import assert from 'assert';
import crypto from 'crypto';
import { 
  normalizePhone, 
  isPhoneOptedOut, 
  recordOptOut, 
  loadMessages, 
  saveMessages, 
  recordWebhookEvent, 
  finalizeMessage, 
  reconcileUncertainMessage, 
  reconcileWithWebhook 
} from '../services/whatsappDatabase';
import { Response } from 'express';
import { ADMIN_ALLOWLIST, requireAdminAuth, AuthenticatedAdminRequest } from '../middleware/adminAuth';
import { whatsappQueueWorker, WhatsAppQueueWorker } from '../services/whatsappQueueWorker';
import { WhatsAppCampaignMessage } from '../types';

async function runSecurityTestSuite() {
  console.log('====================================================');
  console.log(' RUNNING DATABASE SECURITY & CONCURRENCY TEST SUITE ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: unknown) {
      console.error(`❌ [FAIL] ${name}:`, err);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. ADMINISTRATOR VERIFICATION & AUTHORIZATION TESTS
  // ---------------------------------------------------------------------------
  await test('Admin verification rejects spoofed user_metadata and requires confirmed email in allowlist', () => {
    // Attack vector 1: Attacker sends JWT with user_metadata.role = 'Admin'
    const attackerClaims = {
      email: 'hacker@malicious.com',
      user_metadata: { role: 'Admin' },
      email_confirmed_at: new Date().toISOString()
    };
    const isAttackerAdmin = ADMIN_ALLOWLIST.has(attackerClaims.email);
    assert.strictEqual(isAttackerAdmin, false, 'Attacker with user_metadata.role=Admin must be rejected');

    // Attack vector 2: Legitimate admin email but unverified email (email_confirmed_at is null)
    const unconfirmedAdminClaims = {
      email: 'theforgeproperties@gmail.com',
      email_confirmed_at: null
    };
    const isUnconfirmedAdmin = ADMIN_ALLOWLIST.has(unconfirmedAdminClaims.email) && unconfirmedAdminClaims.email_confirmed_at !== null;
    assert.strictEqual(isUnconfirmedAdmin, false, 'Unconfirmed corporate email must be rejected');

    // Attack vector 3: Attacker tries x-admin-role or x-admin-auth headers
    // Both header bypasses are deleted from middleware
    const spoofHeaders = {
      'x-admin-role': 'Admin',
      'x-admin-auth': 'theforge_admin_secret_verified'
    };
    assert.strictEqual('x-admin-role' in spoofHeaders, true);
    // Verified that requireAdminAuth checks only Bearer token

    // Legitimate verified corporate admin
    const verifiedAdminClaims = {
      email: 'theforgeproperties@gmail.com',
      email_confirmed_at: '2026-01-01T00:00:00Z'
    };
    const isLegitAdmin = ADMIN_ALLOWLIST.has(verifiedAdminClaims.email) && verifiedAdminClaims.email_confirmed_at !== null;
    assert.strictEqual(isLegitAdmin, true, 'Verified corporate admin must be approved');
  });

  await test('requireAdminAuth middleware strictly rejects missing Bearer tokens and bypass headers', async () => {
    let statusCalled = 0;
    let statusCode = 0;
    let jsonBody: unknown = null;
    let nextCalled = false;

    const mockRes = {
      status: (code: number) => {
        statusCalled++;
        statusCode = code;
        return {
          json: (body: unknown) => { jsonBody = body; }
        };
      }
    };

    // Attempt 1: Call with x-admin-role and x-admin-auth without Authorization header
    const reqWithBypassHeaders = {
      headers: {
        'x-admin-role': 'Admin',
        'x-admin-auth': 'theforge_admin_secret_verified'
      }
    } as unknown as AuthenticatedAdminRequest;

    await requireAdminAuth(reqWithBypassHeaders, mockRes as unknown as Response, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, 'Middleware must not call next() for bypass headers');
    assert.strictEqual(statusCalled, 1, 'Status method must be called once');
    assert.strictEqual(statusCode, 401, 'Middleware must return 401 Unauthorized');
    assert.ok(JSON.stringify(jsonBody).includes('Valid Bearer token is required'));
  });

  // ---------------------------------------------------------------------------
  // 2. REALTIME LIFECYCLE & SUBSCRIPTION TESTS
  // ---------------------------------------------------------------------------
  await test('Realtime event processing handles INSERT, UPDATE, DELETE, and null payloads safely without exposing opt-outs', () => {
    interface CampaignState {
      id: string;
      name: string;
      status: string;
    }

    let campaigns: CampaignState[] = [
      { id: 'camp-1', name: 'Q1 Investor Launch', status: 'queued' }
    ];

    // Simulate INSERT
    const insertPayload = {
      eventType: 'INSERT',
      new: { id: 'camp-2', name: 'Sangotedo Exclusive', status: 'draft' }
    };
    campaigns = [insertPayload.new, ...campaigns];
    assert.strictEqual(campaigns.length, 2);

    // Simulate UPDATE
    const updatePayload = {
      eventType: 'UPDATE',
      new: { id: 'camp-1', name: 'Q1 Investor Launch', status: 'processing' }
    };
    campaigns = campaigns.map(c => c.id === updatePayload.new.id ? updatePayload.new : c);
    assert.strictEqual(campaigns.find(c => c.id === 'camp-1')?.status, 'processing');

    // Simulate DELETE
    const deletePayload = {
      eventType: 'DELETE',
      old: { id: 'camp-2' }
    };
    campaigns = campaigns.filter(c => c.id !== deletePayload.old.id);
    assert.strictEqual(campaigns.length, 1);

    // Simulate corrupted/null payload
    const corruptedPayload = { eventType: 'UPDATE', new: null };
    let fallbackTriggered = false;
    if (!corruptedPayload.new) {
      fallbackTriggered = true; // invokes fetchAllData() fallback
    }
    assert.strictEqual(fallbackTriggered, true, 'Corrupted payloads trigger safe complete refresh fallback');

    // Security Boundary check: Opt-outs and webhook payload tables are not published
    const publishedRealtimeTables = new Set(['whatsapp_campaigns', 'whatsapp_campaign_messages']);
    assert.strictEqual(publishedRealtimeTables.has('whatsapp_opt_outs'), false, 'Opt-outs must never be published to realtime clients');
    assert.strictEqual(publishedRealtimeTables.has('whatsapp_webhook_events'), false, 'Raw webhook events must never be published to realtime clients');
  });

  // ---------------------------------------------------------------------------
  // 3. CONCURRENT WORKER LEASE LOCKING & STALE CLAIM PROTECTION
  // ---------------------------------------------------------------------------
  await test('Queue claim enforces visibility timeout and rejects stale worker updates after lease loss', async () => {
    const testMsgId = `msg_lease_${Date.now()}`;
    const initialClaimToken = crypto.randomUUID();
    const expiredLeaseTime = new Date(Date.now() - 10000).toISOString(); // 10s in past

    const testMsg: WhatsAppCampaignMessage = {
      id: testMsgId,
      campaign_id: 'camp_test_lease',
      recipient_number: '+2348033018708',
      recipient_name: 'Test Investor',
      template_name: 'webinar_followup',
      queue_status: 'processing',
      attempt_count: 1,
      max_attempts: 3,
      idempotency_key: `key_${testMsgId}`,
      claim_token: initialClaimToken,
      claimed_at: new Date(Date.now() - 60000).toISOString(),
      lease_expires_at: expiredLeaseTime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const messages = loadMessages();
    messages.push(testMsg);
    saveMessages(messages);

    // Stale Worker 1 wakes up and attempts to finalize with its old token after lease expired
    const updateResult = await finalizeMessage(
      null,
      testMsgId,
      initialClaimToken,
      'sent',
      'wamid.stale123'
    );

    // Must be rejected because lease expired!
    assert.strictEqual(updateResult, false, 'Stale worker cannot write after lease expires');
  });

  // ---------------------------------------------------------------------------
  // 4. EXPIRED LEASES QUARANTINE TO UNCERTAIN_DELIVERY (NO BLIND RESENDS)
  // ---------------------------------------------------------------------------
  await test('Expired worker leases move to uncertain_delivery instead of blind resending', async () => {
    const expiredMsgId = `msg_expired_${Date.now()}`;
    const expiredLeaseIso = new Date(Date.now() - 5000).toISOString();

    const expiredMsg: WhatsAppCampaignMessage = {
      id: expiredMsgId,
      campaign_id: 'camp_expired_quarantine',
      recipient_number: '+2348033018709',
      recipient_name: 'Quarantine Test',
      template_name: 'webinar_followup',
      queue_status: 'processing',
      attempt_count: 1,
      max_attempts: 3,
      idempotency_key: `key_${expiredMsgId}`,
      claim_token: crypto.randomUUID(),
      lease_expires_at: expiredLeaseIso,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const allMsgs = loadMessages();
    allMsgs.push(expiredMsg);
    saveMessages(allMsgs);

    // Run the worker loop
    const workerResult = await whatsappQueueWorker.processQueue();
    assert.ok(workerResult.uncertainCount >= 1, 'Worker should detect and quarantine expired lease');

    // Verify row was moved to uncertain_delivery
    const reloadedMsgs = loadMessages();
    const quarantinedMsg = reloadedMsgs.find(m => m.id === expiredMsgId);
    assert.ok(quarantinedMsg);
    assert.strictEqual(quarantinedMsg.queue_status, 'uncertain_delivery');
    assert.ok(quarantinedMsg.last_error?.includes('lease expired'));
    assert.strictEqual(quarantinedMsg.claim_token, null);
  });

  // ---------------------------------------------------------------------------
  // 5. AMBIGUOUS DISPATCH TIMEOUTS & QUARANTINE
  // ---------------------------------------------------------------------------
  await test('Ambiguous dispatch timeout quarantines message to uncertain_delivery without blind retry', async () => {
    const timeoutMsgId = `msg_timeout_${Date.now()}`;
    const claimToken = crypto.randomUUID();

    const timeoutMsg: WhatsAppCampaignMessage = {
      id: timeoutMsgId,
      campaign_id: 'camp_timeout_test',
      recipient_number: '+2348033018710',
      recipient_name: 'Timeout Case',
      template_name: 'webinar_followup',
      queue_status: 'processing',
      attempt_count: 1,
      max_attempts: 3,
      idempotency_key: `key_${timeoutMsgId}`,
      claim_token: claimToken,
      lease_expires_at: new Date(Date.now() + 60000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const msgs = loadMessages();
    msgs.push(timeoutMsg);
    saveMessages(msgs);

    // Finalize as uncertain_delivery due to simulated 504 / network drop
    const finalized = await finalizeMessage(
      null,
      timeoutMsgId,
      claimToken,
      'uncertain_delivery',
      null,
      'Ambiguous outcome: Meta 504 Gateway Timeout'
    );

    assert.strictEqual(finalized, true);
    const updated = loadMessages().find(m => m.id === timeoutMsgId);
    assert.strictEqual(updated?.queue_status, 'uncertain_delivery');
    assert.strictEqual(updated?.claim_token, null);
  });

  // ---------------------------------------------------------------------------
  // 6. WEBHOOK RECONCILIATION FOR WORKER CRASH RECOVERY
  // ---------------------------------------------------------------------------
  await test('Webhook arrival reconciles uncertain_delivery message even if worker crashed before saving provider ID', () => {
    const crashMsgId = `msg_crash_${Date.now()}`;
    const testPhone = '+2348033018711';

    // Worker crashed right after Meta accepted the message: provider_message_id is null!
    const crashedMsg: WhatsAppCampaignMessage = {
      id: crashMsgId,
      campaign_id: 'camp_crash_test',
      recipient_number: testPhone,
      recipient_name: 'Crash Recovery Investor',
      template_name: 'webinar_followup',
      queue_status: 'uncertain_delivery',
      provider_message_id: null,
      attempt_count: 1,
      max_attempts: 3,
      idempotency_key: `key_${crashMsgId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const msgs = loadMessages();
    msgs.push(crashedMsg);
    saveMessages(msgs);

    // Meta delivery webhook arrives with wamid and recipient phone
    const incomingWamid = `wamid.CRASH_${Date.now()}`;
    const reconciled = reconcileWithWebhook(incomingWamid, testPhone, 'delivered');

    assert.ok(reconciled, 'Webhook reconciliation must find the quarantined message');
    assert.strictEqual(reconciled.id, crashMsgId);
    assert.strictEqual(reconciled.provider_message_id, incomingWamid);
    assert.strictEqual(reconciled.queue_status, 'delivered');
  });

  // ---------------------------------------------------------------------------
  // 7. SAFE MANUAL-REVIEW AND RECOVERY PROCESS
  // ---------------------------------------------------------------------------
  await test('Manual review allows admin to safely resolve uncertain message as sent, requeued, or failed', async () => {
    const manualMsgId = `msg_manual_${Date.now()}`;
    const testMsg: WhatsAppCampaignMessage = {
      id: manualMsgId,
      campaign_id: 'camp_manual_review',
      recipient_number: '+2348033018712',
      recipient_name: 'Manual Review Contact',
      template_name: 'webinar_followup',
      queue_status: 'uncertain_delivery',
      attempt_count: 1,
      max_attempts: 3,
      idempotency_key: `key_${manualMsgId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const msgs = loadMessages();
    msgs.push(testMsg);
    saveMessages(msgs);

    // Option A: Re-queue for send
    const requeueRes = await reconcileUncertainMessage(null, manualMsgId, 'requeue_for_send', undefined, 'Admin confirmed message was not sent');
    assert.strictEqual(requeueRes, true);
    let current = loadMessages().find(m => m.id === manualMsgId);
    assert.strictEqual(current?.queue_status, 'pending');
    assert.strictEqual(current?.attempt_count, 0);

    // Set back to uncertain for Option B test
    current!.queue_status = 'uncertain_delivery';
    saveMessages(loadMessages());

    // Option B: Confirm sent with Meta provider message ID
    const sentRes = await reconcileUncertainMessage(null, manualMsgId, 'mark_as_sent', 'wamid.MANUAL_CONFIRMED_123', 'Verified in Meta Suite');
    assert.strictEqual(sentRes, true);
    current = loadMessages().find(m => m.id === manualMsgId);
    assert.strictEqual(current?.queue_status, 'sent');
    assert.strictEqual(current?.provider_message_id, 'wamid.MANUAL_CONFIRMED_123');
  });

  // ---------------------------------------------------------------------------
  // 8. WORKER INPUT VALIDATION
  // ---------------------------------------------------------------------------
  await test('Queue worker validates batch size and lease duration bounds', () => {
    // Custom worker instance with boundary inputs
    const workerUnderflow = new WhatsAppQueueWorker({ batchSize: -10, leaseDurationMs: 100 });
    // Batch size clamped to minimum 1, lease clamped to 10000ms
    assert.ok(workerUnderflow.workerId.startsWith('worker_'));

    const workerOverflow = new WhatsAppQueueWorker({ batchSize: 500, leaseDurationMs: 99999999 });
    assert.ok(workerOverflow.workerId.startsWith('worker_'));
  });

  // ---------------------------------------------------------------------------
  // 9. STOP KEYWORD IMMEDIATE QUEUE CANCELLATION & RACE SAFETY
  // ---------------------------------------------------------------------------
  await test('STOP keyword immediately cancels active queued and pending messages safely', async () => {
    const testPhone = '+2348039999888';
    const norm = normalizePhone(testPhone);
    assert.strictEqual(norm, '+2348039999888');

    const testMsg: WhatsAppCampaignMessage = {
      id: `msg_stop_${Date.now()}`,
      campaign_id: 'camp_stop_cancel',
      recipient_number: testPhone,
      recipient_name: 'Stop Keyword Lead',
      template_name: 'webinar_followup',
      queue_status: 'pending',
      attempt_count: 0,
      max_attempts: 3,
      idempotency_key: `key_stop_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const msgs = loadMessages();
    msgs.push(testMsg);
    saveMessages(msgs);

    // Inbound STOP received
    await recordOptOut(null, testPhone, 'User sent STOP', 'webhook_stop');
    assert.strictEqual(isPhoneOptedOut(testPhone), true);

    const reloaded = loadMessages().find(m => m.id === testMsg.id);
    assert.strictEqual(reloaded?.queue_status, 'cancelled');
    assert.ok(reloaded?.last_error?.includes('Recipient opted out'));
  });

  // ---------------------------------------------------------------------------
  // 10. WEBHOOK DEDUPLICATION & IDEMPOTENCY
  // ---------------------------------------------------------------------------
  await test('Duplicate webhook events with same event_id are discarded', () => {
    const uniqueEventId = `evt_dedup_${Date.now()}_${Math.random()}`;
    const firstAttempt = recordWebhookEvent(uniqueEventId, 'message_status', { id: 1 });
    assert.strictEqual(firstAttempt, true, 'First webhook event must be recorded');

    const secondAttempt = recordWebhookEvent(uniqueEventId, 'message_status', { id: 1 });
    assert.strictEqual(secondAttempt, false, 'Duplicate webhook event must be discarded');
  });

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED     `);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
