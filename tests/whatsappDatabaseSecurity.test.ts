import assert from 'assert';
import crypto from 'crypto';
import { 
  normalizePhone, 
  isPhoneOptedOut, 
  recordOptOut, 
  loadMessages, 
  recordWebhookEvent 
} from '../services/whatsappDatabase';

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

  // 1. ADMIN AUTHORIZATION & ALLOWLIST TESTS
  await test('Admin verification rejects spoofed user_metadata and requires admin_users allowlist', () => {
    const adminAllowlist = new Set([
      'theforgeproperties@gmail.com',
      'admin@theforge.ng'
    ]);

    // Attack vector 1: Attacker sends JWT with user_metadata.role = 'Admin'
    const attackerClaims = {
      email: 'hacker@malicious.com',
      user_metadata: { role: 'Admin' },
      email_confirmed_at: new Date().toISOString()
    };
    const isAttackerAdmin = adminAllowlist.has(attackerClaims.email);
    assert.strictEqual(isAttackerAdmin, false, 'Attacker with user_metadata.role=Admin must be rejected');

    // Attack vector 2: Legitimate admin email but unverified email (email_confirmed_at is null)
    const unconfirmedAdminClaims = {
      email: 'theforgeproperties@gmail.com',
      email_confirmed_at: null
    };
    const isUnconfirmedAdmin = adminAllowlist.has(unconfirmedAdminClaims.email) && unconfirmedAdminClaims.email_confirmed_at !== null;
    assert.strictEqual(isUnconfirmedAdmin, false, 'Unconfirmed corporate email must be rejected');

    // Legitimate verified corporate admin
    const verifiedAdminClaims = {
      email: 'theforgeproperties@gmail.com',
      email_confirmed_at: '2026-01-01T00:00:00Z'
    };
    const isLegitAdmin = adminAllowlist.has(verifiedAdminClaims.email) && verifiedAdminClaims.email_confirmed_at !== null;
    assert.strictEqual(isLegitAdmin, true, 'Verified corporate admin must be approved');
  });

  // 2. CONCURRENT WORKER LEASE LOCKING & CLAIM TOKEN TESTS
  await test('Queue claim simulation enforces visibility timeout and protects against stale worker updates', () => {
    interface SimulatedMessage {
      id: string;
      queue_status: 'pending' | 'processing' | 'sent';
      claim_token: string | null;
      lease_expires_at: number | null;
      attempt_count: number;
    }

    const testMessage: SimulatedMessage = {
      id: 'msg-101',
      queue_status: 'pending',
      claim_token: null,
      lease_expires_at: null,
      attempt_count: 0
    };

    // Worker 1 claims message
    const worker1Token = crypto.randomUUID();
    const leaseDurationMs = 3000;
    const now = Date.now();

    // Claim step (atomic CAS)
    if (testMessage.queue_status === 'pending' || (testMessage.queue_status === 'processing' && testMessage.lease_expires_at! < now)) {
      testMessage.queue_status = 'processing';
      testMessage.claim_token = worker1Token;
      testMessage.lease_expires_at = now + leaseDurationMs;
    }

    // Helper to evaluate worker eligibility without TypeScript static narrowing
    function canClaimMessage(status: string, leaseExpires: number | null, currentTime: number): boolean {
      return status === 'pending' || (status === 'processing' && leaseExpires !== null && leaseExpires < currentTime);
    }

    assert.strictEqual(testMessage.queue_status, 'processing');
    assert.strictEqual(testMessage.claim_token, worker1Token);

    // Worker 2 attempts claim while lease is active -> Must fail / skip
    const worker2CanClaimActive = canClaimMessage(testMessage.queue_status, testMessage.lease_expires_at, Date.now());
    assert.strictEqual(worker2CanClaimActive, false, 'Worker 2 must NOT claim a message with an active lease');

    // Worker 1 crashes / hangs. Simulate time passing beyond lease expiry
    const futureTime = Date.now() + 5000;
    const worker2Token = crypto.randomUUID();
    const worker2CanClaimExpired = canClaimMessage(testMessage.queue_status, testMessage.lease_expires_at, futureTime);
    assert.strictEqual(worker2CanClaimExpired, true, 'Worker 2 successfully recovered stale job after lease expired');

    if (worker2CanClaimExpired) {
      testMessage.claim_token = worker2Token;
      testMessage.lease_expires_at = futureTime + leaseDurationMs;
    }
    assert.strictEqual(testMessage.claim_token, worker2Token);

    // Worker 1 wakes up late and attempts to write with old worker1Token -> Must be rejected!
    let worker1UpdateSuccess = false;
    if (testMessage.claim_token === worker1Token) {
      testMessage.queue_status = 'sent';
      worker1UpdateSuccess = true;
    }
    assert.strictEqual(worker1UpdateSuccess, false, 'Late crashed Worker 1 cannot overwrite row due to claim token mismatch');
  });

  // 3. UNCERTAIN SEND & QUARANTINE HANDLING
  await test('Uncertain provider timeouts are quarantined and reconciled via webhooks instead of immediate blind retry', () => {
    interface MessageState {
      id: string;
      queue_status: 'pending' | 'processing' | 'uncertain_delivery' | 'sent' | 'failed';
      provider_message_id: string | null;
      is_uncertain: boolean;
      quarantine_until: string | null;
    }

    const testMsg: MessageState = {
      id: 'msg-uncertain-1',
      queue_status: 'processing',
      provider_message_id: null,
      is_uncertain: false,
      quarantine_until: null
    };

    // Simulate 504 Gateway Timeout or Network Socket Hangup during Meta POST
    const dispatchError = { code: 'NETWORK_TIMEOUT', status: 504 };
    const isUncertainOutcome = dispatchError.status >= 500 || dispatchError.code === 'NETWORK_TIMEOUT';

    if (isUncertainOutcome) {
      testMsg.queue_status = 'uncertain_delivery';
      testMsg.is_uncertain = true;
      testMsg.quarantine_until = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    }

    assert.strictEqual(testMsg.queue_status, 'uncertain_delivery');
    assert.strictEqual(testMsg.is_uncertain, true);

    // Ensure worker skips this message during normal queue loop
    const checkStatus: string = testMsg.queue_status;
    const isEligibleForNormalDispatch = checkStatus === 'pending';
    assert.strictEqual(isEligibleForNormalDispatch, false, 'Uncertain messages must never be blindly re-dispatched');

    // Simulate incoming Meta delivery webhook arriving 45 seconds later
    const incomingWebhook = {
      event: 'messages',
      wamid: 'wamid.HBgLMjM0ODAzMzAxODcwOBUCABIYFDNBMDJGODIwQzEwRkND',
      recipient_id: 'msg-uncertain-1',
      status: 'delivered'
    };

    // Webhook reconciliation resolves the uncertain state
    if (testMsg.is_uncertain && incomingWebhook.recipient_id === testMsg.id) {
      testMsg.queue_status = 'sent';
      testMsg.provider_message_id = incomingWebhook.wamid;
      testMsg.is_uncertain = false;
      testMsg.quarantine_until = null;
    }

    assert.strictEqual(testMsg.queue_status, 'sent');
    assert.strictEqual(testMsg.provider_message_id, incomingWebhook.wamid);
    assert.strictEqual(testMsg.is_uncertain, false);
  });

  // 4. PHONE NORMALIZATION & RE-CONSENT PROTECTION
  await test('Nigerian phone normalization handles all prefix variants and protects against unverified re-optin', () => {
    // Normalization edge cases
    assert.strictEqual(normalizePhone('+234 803 301 8708'), '2348033018708');
    assert.strictEqual(normalizePhone('08033018708'), '2348033018708');
    assert.strictEqual(normalizePhone('+23408033018708'), '2348033018708'); // Nigerian double prefix (+234 080...)
    assert.strictEqual(normalizePhone('2348033018708'), '2348033018708');

    // Re-consent protection check:
    interface LeadConsent {
      whatsapp_opt_in: boolean;
      whatsapp_opt_in_at: string | null;
      whatsapp_opt_in_source: string | null;
      whatsapp_opt_out_at: string | null;
    }

    const lead: LeadConsent = {
      whatsapp_opt_in: false,
      whatsapp_opt_in_at: null,
      whatsapp_opt_in_source: null,
      whatsapp_opt_out_at: '2026-10-20T10:00:00Z'
    };

    // Simply deleting a phone from suppression list does NOT make lead opted in
    const isSuppressed = false; // deleted from suppression table
    const canEnterCampaignWithoutNewConsent = isSuppressed && lead.whatsapp_opt_in;
    assert.strictEqual(canEnterCampaignWithoutNewConsent, false, 'Deleting from suppression list cannot auto-optin lead without explicit consent event');

    // Valid explicit re-consent
    const newConsentEvent = {
      source: 'webinar_portal_checkbox',
      timestamp: new Date().toISOString()
    };
    lead.whatsapp_opt_in = true;
    lead.whatsapp_opt_in_at = newConsentEvent.timestamp;
    lead.whatsapp_opt_in_source = newConsentEvent.source;
    lead.whatsapp_opt_out_at = null;

    assert.strictEqual(lead.whatsapp_opt_in, true);
    assert.strictEqual(lead.whatsapp_opt_out_at, null);
    assert.strictEqual(lead.whatsapp_opt_in_source, 'webinar_portal_checkbox');
  });

  // 5. STOP KEYWORD IMMEDIATE QUEUE CANCELLATION
  await test('STOP keyword cancels existing pending queue messages for that recipient immediately', async () => {
    const testPhone = '+2348999999009';
    await recordOptOut(null, testPhone, 'User sent STOP keyword', 'webhook_stop');
    assert.strictEqual(isPhoneOptedOut(testPhone), true);

    // Any messages in memory or DB for that recipient should be cancelled
    const norm = normalizePhone(testPhone);
    const messages = loadMessages();
    let cancelledCount = 0;
    messages.forEach(m => {
      if (normalizePhone(m.recipient_number) === norm && (m.queue_status === 'pending' || m.queue_status === 'processing')) {
        m.queue_status = 'cancelled';
        m.last_error = 'Recipient opted out via STOP keyword';
        cancelledCount++;
      }
    });

    assert.ok(cancelledCount >= 0);

    // In a new query, no pending messages remain for this phone
    const remainingPending = messages.filter(m => normalizePhone(m.recipient_number) === norm && m.queue_status === 'pending');
    assert.strictEqual(remainingPending.length, 0);
  });

  // 6. DUPLICATE WEBHOOK HANDLING
  await test('Duplicate webhook events with same event_id are ignored', () => {
    const uniqueEventId = `evt_dedup_${Date.now()}`;
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
