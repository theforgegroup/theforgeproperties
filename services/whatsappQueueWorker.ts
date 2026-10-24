import crypto from 'crypto';
import pg from 'pg';
import { 
  claimQueueBatch, 
  finalizeMessage, 
  isPhoneOptedOut, 
  normalizePhone,
  loadMessages,
  saveMessages
} from './whatsappDatabase';
import { whatsappProvider } from './whatsappProvider';
import { WhatsAppCampaignMessage } from '../types';

export interface QueueWorkerConfig {
  batchSize: number;
  rateLimitMs: number;
  pollIntervalMs: number;
  leaseDurationMs: number;
  maxAttempts: number;
}

const DEFAULT_CONFIG: QueueWorkerConfig = {
  batchSize: Math.min(100, Math.max(1, parseInt(process.env.WHATSAPP_QUEUE_BATCH_SIZE || '25', 10))),
  rateLimitMs: Math.max(0, parseInt(process.env.WHATSAPP_RATE_LIMIT_MS || '100', 10)),
  pollIntervalMs: Math.max(500, parseInt(process.env.WHATSAPP_QUEUE_POLL_MS || '3000', 10)),
  leaseDurationMs: Math.min(3600000, Math.max(10000, parseInt(process.env.WHATSAPP_LEASE_MS || '300000', 10))), // 5 mins
  maxAttempts: Math.min(10, Math.max(1, parseInt(process.env.WHATSAPP_MAX_RETRIES || '3', 10)))
};

export class WhatsAppQueueWorker {
  private isProcessing = false;
  private timer: NodeJS.Timeout | null = null;
  private config: QueueWorkerConfig;
  private pool: pg.Pool | null = null;
  public readonly workerId: string;

  constructor(config: Partial<QueueWorkerConfig> = {}) {
    this.workerId = `worker_${process.pid}_${crypto.randomBytes(4).toString('hex')}`;
    this.config = this.validateAndNormalizeConfig({ ...DEFAULT_CONFIG, ...config });
  }

  private validateAndNormalizeConfig(cfg: QueueWorkerConfig): QueueWorkerConfig {
    return {
      batchSize: Math.min(100, Math.max(1, cfg.batchSize || 25)),
      rateLimitMs: Math.max(0, cfg.rateLimitMs ?? 100),
      pollIntervalMs: Math.max(500, cfg.pollIntervalMs || 3000),
      leaseDurationMs: Math.min(3600000, Math.max(10000, cfg.leaseDurationMs || 300000)),
      maxAttempts: Math.min(10, Math.max(1, cfg.maxAttempts || 3))
    };
  }

  public setPool(pool: pg.Pool | null): void {
    this.pool = pool;
  }

  public start(): void {
    if (this.timer) return;
    console.log(`[WhatsApp Queue Worker ${this.workerId}] Started. Poll: ${this.config.pollIntervalMs}ms, Batch: ${this.config.batchSize}, Lease: ${this.config.leaseDurationMs}ms`);
    this.timer = setInterval(() => {
      this.processQueue().catch(err => {
        console.error(`[WhatsApp Queue Worker ${this.workerId}] Unexpected error in loop:`, err);
      });
    }, this.config.pollIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log(`[WhatsApp Queue Worker ${this.workerId}] Stopped.`);
    }
  }

  /**
   * Main Queue Processing Step:
   * Uses authoritative PostgreSQL RPC public.claim_whatsapp_queue_batch()
   * Safe against worker crashes, expired leases, network timeouts, and duplicate sends.
   */
  public async processQueue(): Promise<{ processedCount: number; uncertainCount: number }> {
    if (this.isProcessing) {
      return { processedCount: 0, uncertainCount: 0 };
    }

    this.isProcessing = true;
    let processedCount = 0;
    let uncertainCount = 0;

    try {
      const leaseSeconds = Math.floor(this.config.leaseDurationMs / 1000);

      // In offline / test mode without pool, detect and quarantine expired leases
      if (!this.pool) {
        const now = new Date();
        const nowIso = now.toISOString();
        const messages = loadMessages();
        messages.forEach(m => {
          if (m.queue_status === 'processing' && m.lease_expires_at && new Date(m.lease_expires_at) < now) {
            m.queue_status = 'uncertain_delivery';
            m.last_error = 'Worker lease expired while in processing. Quarantined for webhook reconciliation or manual review.';
            m.claim_token = null;
            m.claimed_at = null;
            m.claimed_by = null;
            m.lease_expires_at = null;
            m.updated_at = nowIso;
            uncertainCount++;
          }
        });
        if (uncertainCount > 0) {
          saveMessages(messages);
        }
      }

      // -----------------------------------------------------------------------
      // STEP 1: CLAIM WORK VIA DATABASE RPC
      // Automatically moves expired leases to uncertain_delivery and
      // atomically locks batch rows using FOR UPDATE OF m SKIP LOCKED.
      // -----------------------------------------------------------------------
      let claimedBatch: WhatsAppCampaignMessage[] = [];
      try {
        claimedBatch = await claimQueueBatch(
          this.pool,
          this.workerId,
          this.config.batchSize,
          leaseSeconds
        );
      } catch (claimErr) {
        console.error(`[WhatsApp Queue Worker ${this.workerId}] Database claim error:`, claimErr);
        // Fail-safe: Back off without dispatching from stale local state
        return { processedCount: 0, uncertainCount };
      }

      if (claimedBatch.length === 0) {
        await this.syncCompletedCampaigns();
        return { processedCount: 0, uncertainCount };
      }

      // -----------------------------------------------------------------------
      // STEP 2: DISPATCH CLAIMED MESSAGES
      // -----------------------------------------------------------------------
      for (const msg of claimedBatch) {
        if (!msg.claim_token) {
          console.warn(`[WhatsApp Queue Worker ${this.workerId}] Message ${msg.id} missing claim token. Skipping.`);
          continue;
        }

        const currentClaimToken = msg.claim_token;
        const normPhone = normalizePhone(msg.recipient_number);

        // Pre-flight check against global suppression list
        const optedOut = await isPhoneOptedOut(normPhone, this.pool);
        if (optedOut) {
          console.log(`[WhatsApp Queue Worker] Recipient ${normPhone} is opted out. Cancelling message ${msg.id}.`);
          await finalizeMessage(
            this.pool,
            msg.id,
            currentClaimToken,
            'skipped',
            null,
            'Recipient is opted out of WhatsApp marketing'
          );
          processedCount++;
          continue;
        }

        let sendResult: {
          success: boolean;
          providerMessageId?: string;
          error?: string;
          errorCode?: string | number;
          retryable?: boolean;
          ambiguousOutcome?: boolean;
        };

        try {
          sendResult = await whatsappProvider.sendTemplateMessage(
            msg.recipient_number,
            msg.template_name,
            msg.template_variables || {},
            'en'
          );
        } catch (dispatchErr: unknown) {
          // Socket hangup, network timeout, or unexpected exception during HTTP call:
          // Outcome is AMBIGUOUS: Meta may have received and queued the message
          console.error(`[WhatsApp Queue Worker] Ambiguous dispatch exception for message ${msg.id}:`, dispatchErr);
          sendResult = {
            success: false,
            error: dispatchErr instanceof Error ? dispatchErr.message : String(dispatchErr),
            ambiguousOutcome: true
          };
        }

        if (sendResult.ambiguousOutcome) {
          // QUARANTINE TO UNCERTAIN_DELIVERY
          // Never blind-retry! Awaiting webhook reconciliation or manual review
          await finalizeMessage(
            this.pool,
            msg.id,
            currentClaimToken,
            'uncertain_delivery',
            sendResult.providerMessageId || null,
            `Ambiguous dispatch outcome (${sendResult.error || 'Network timeout'}). Quarantined.`
          );
          uncertainCount++;
        } else if (sendResult.success) {
          // SUCCESSFUL DISPATCH: atomic finalization with active claim token
          const finalized = await finalizeMessage(
            this.pool,
            msg.id,
            currentClaimToken,
            'sent',
            sendResult.providerMessageId || null,
            null
          );

          if (!finalized) {
            console.warn(`[WhatsApp Queue Worker] Failed to finalize sent message ${msg.id} - lease expired or claim was lost.`);
          }
        } else {
          // DISPATCH FAILURE
          if (sendResult.retryable && msg.attempt_count < (msg.max_attempts || this.config.maxAttempts)) {
            // Exponential backoff retry: 5s, 20s, 80s
            const backoffMs = Math.pow(4, msg.attempt_count) * 1250;
            const nextRetry = new Date(Date.now() + backoffMs).toISOString();

            await finalizeMessage(
              this.pool,
              msg.id,
              currentClaimToken,
              'pending',
              null,
              sendResult.error || 'Transient provider error',
              nextRetry
            );
          } else {
            // Permanent failure
            await finalizeMessage(
              this.pool,
              msg.id,
              currentClaimToken,
              'failed',
              null,
              sendResult.error || 'Dispatch failed permanently'
            );
          }
        }

        processedCount++;

        // Rate limiting throttle
        if (this.config.rateLimitMs > 0) {
          await new Promise(resolve => setTimeout(resolve, this.config.rateLimitMs));
        }
      }

      await this.syncCompletedCampaigns();

    } finally {
      this.isProcessing = false;
    }

    return { processedCount, uncertainCount };
  }

  private async syncCompletedCampaigns(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.query(`
          UPDATE public.whatsapp_campaigns c
          SET status = 'completed',
              updated_at = NOW()
          WHERE status IN ('queued', 'processing')
            AND NOT EXISTS (
              SELECT 1 FROM public.whatsapp_campaign_messages m
              WHERE m.campaign_id = c.id
                AND m.queue_status IN ('pending', 'processing')
            );
        `);
      } catch (err) {
        console.warn('[WhatsApp Queue Worker] Error syncing completed campaigns in DB:', err);
      }
    }
  }
}

export const whatsappQueueWorker = new WhatsAppQueueWorker();
