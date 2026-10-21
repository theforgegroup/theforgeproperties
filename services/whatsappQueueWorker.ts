import pg from 'pg';
import { 
  loadCampaigns, 
  saveCampaigns, 
  loadMessages, 
  saveMessages, 
  isPhoneOptedOut, 
  normalizePhone 
} from './whatsappDatabase';
import { whatsappProvider } from './whatsappProvider';
import { WhatsAppCampaignMessage, WhatsAppCampaign } from '../types';

export interface QueueWorkerConfig {
  batchSize: number;
  rateLimitMs: number; // Delay between message dispatches
  pollIntervalMs: number; // Queue check interval
  maxAttempts: number;
}

const DEFAULT_CONFIG: QueueWorkerConfig = {
  batchSize: parseInt(process.env.WHATSAPP_QUEUE_BATCH_SIZE || '25', 10),
  rateLimitMs: parseInt(process.env.WHATSAPP_RATE_LIMIT_MS || '100', 10), // ~10 messages/sec default
  pollIntervalMs: parseInt(process.env.WHATSAPP_QUEUE_POLL_MS || '3000', 10),
  maxAttempts: parseInt(process.env.WHATSAPP_MAX_RETRIES || '3', 10)
};

class WhatsAppQueueWorker {
  private isProcessing = false;
  private timer: NodeJS.Timeout | null = null;
  private config: QueueWorkerConfig;
  private pool: pg.Pool | null = null;

  constructor(config: Partial<QueueWorkerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public setPool(pool: pg.Pool | null): void {
    this.pool = pool;
  }

  public start(): void {
    if (this.timer) return;
    console.log(`[WhatsApp Queue Worker] Started. Polling every ${this.config.pollIntervalMs}ms, batch size: ${this.config.batchSize}`);
    this.timer = setInterval(() => {
      this.processQueue().catch(err => {
        console.error('[WhatsApp Queue Worker] Unexpected error in loop:', err);
      });
    }, this.config.pollIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[WhatsApp Queue Worker] Stopped.');
    }
  }

  /**
   * Main Queue Processing Step (Concurrency-safe and atomic)
   */
  public async processQueue(): Promise<{ processedCount: number }> {
    if (this.isProcessing) {
      return { processedCount: 0 };
    }

    this.isProcessing = true;
    let processedCount = 0;

    try {
      const now = new Date();
      const messages = loadMessages();
      const campaigns = loadCampaigns();

      // Find eligible campaigns that are active ('queued' or 'processing')
      const activeCampaigns = new Map<string, WhatsAppCampaign>();
      campaigns.forEach(c => {
        if (c.status === 'queued' || c.status === 'processing') {
          activeCampaigns.set(c.id, c);
        }
      });

      if (activeCampaigns.size === 0) {
        return { processedCount: 0 };
      }

      // Claim pending messages atomically
      const pendingMessages: WhatsAppCampaignMessage[] = [];

      for (const m of messages) {
        const campaign = activeCampaigns.get(m.campaign_id);
        if (!campaign) continue;

        // Check if message is ready to be sent (either brand new or scheduled retry)
        const isPending = m.queue_status === 'pending';
        const isRetryReady = m.queue_status === 'processing' && m.next_retry_at && new Date(m.next_retry_at) <= now;

        if ((isPending || isRetryReady) && m.attempt_count < (m.max_attempts || this.config.maxAttempts)) {
          pendingMessages.push(m);
          if (pendingMessages.length >= this.config.batchSize) {
            break;
          }
        }
      }

      if (pendingMessages.length === 0) {
        // Check if any active campaigns have finished all their messages
        this.updateCompletedCampaigns(campaigns, messages);
        return { processedCount: 0 };
      }

      // Mark claimed messages as 'processing' to prevent another worker claiming them
      pendingMessages.forEach(m => {
        m.queue_status = 'processing';
        m.updated_at = now.toISOString();
      });
      saveMessages(messages);

      // Process each claimed message
      for (const msg of pendingMessages) {
        const campaign = activeCampaigns.get(msg.campaign_id);
        if (!campaign) continue;

        // Verify campaign was not paused or cancelled in between
        if (campaign.status === 'paused' || campaign.status === 'cancelled') {
          msg.queue_status = campaign.status === 'paused' ? 'pending' : 'cancelled';
          msg.updated_at = new Date().toISOString();
          continue;
        }

        // Set campaign status to 'processing' if it was queued
        if (campaign.status === 'queued') {
          campaign.status = 'processing';
          campaign.updated_at = new Date().toISOString();
        }

        const normPhone = normalizePhone(msg.recipient_number);

        // Immediate Pre-flight Consent & Opt-Out check
        if (isPhoneOptedOut(normPhone)) {
          msg.queue_status = 'skipped';
          msg.last_error = 'Recipient is opted out of WhatsApp marketing';
          msg.updated_at = new Date().toISOString();
          campaign.opted_out_count = (campaign.opted_out_count || 0) + 1;
          continue;
        }

        msg.attempt_count += 1;

        // Dispatch via WhatsApp Provider
        const sendResult = await whatsappProvider.sendTemplateMessage(
          msg.recipient_number,
          msg.template_name,
          msg.template_variables,
          campaign.template_language || 'en'
        );

        const eventTime = new Date().toISOString();

        if (sendResult.success) {
          msg.queue_status = 'sent';
          msg.provider_message_id = sendResult.providerMessageId || null;
          msg.sent_at = eventTime;
          msg.last_error = null;
          msg.updated_at = eventTime;

          campaign.sent_count = (campaign.sent_count || 0) + 1;
          campaign.queued_count = Math.max(0, (campaign.queued_count || 1) - 1);
        } else {
          msg.last_error = sendResult.error || 'Unknown dispatch failure';
          msg.updated_at = eventTime;

          // Check if retryable transient error
          if (sendResult.retryable && msg.attempt_count < (msg.max_attempts || this.config.maxAttempts)) {
            // Exponential backoff: 5s, 20s, 80s
            const backoffMs = Math.pow(4, msg.attempt_count) * 1250;
            msg.next_retry_at = new Date(Date.now() + backoffMs).toISOString();
            msg.queue_status = 'pending';
          } else {
            msg.queue_status = 'failed';
            msg.failed_at = eventTime;
            campaign.failed_count = (campaign.failed_count || 0) + 1;
            campaign.queued_count = Math.max(0, (campaign.queued_count || 1) - 1);
          }
        }

        processedCount++;

        // Rate limiting throttle
        if (this.config.rateLimitMs > 0) {
          await new Promise(resolve => setTimeout(resolve, this.config.rateLimitMs));
        }
      }

      // Check for completion across active campaigns
      this.updateCompletedCampaigns(campaigns, messages);

      // Persist state to disk
      saveMessages(messages);
      saveCampaigns(campaigns);

    } finally {
      this.isProcessing = false;
    }

    return { processedCount };
  }

  /**
   * Helper to mark campaigns completed when all their messages are processed
   */
  private updateCompletedCampaigns(campaigns: WhatsAppCampaign[], messages: WhatsAppCampaignMessage[]): void {
    const nowIso = new Date().toISOString();
    campaigns.forEach(c => {
      if (c.status === 'processing') {
        const campaignMsgs = messages.filter(m => m.campaign_id === c.id);
        if (campaignMsgs.length > 0) {
          const hasUnfinished = campaignMsgs.some(m => m.queue_status === 'pending' || m.queue_status === 'processing');
          if (!hasUnfinished) {
            c.status = 'completed';
            c.updated_at = nowIso;
          }
        }
      }
    });
  }
}

export const whatsappQueueWorker = new WhatsAppQueueWorker();
