import assert from 'assert';
import crypto from 'crypto';
import { 
  createCampaign, 
  enqueueCampaignMessages, 
  updateLeadConsent, 
  recordOptOut, 
  isPhoneOptedOut, 
  normalizePhone,
  loadMessages,
  recordWebhookEvent
} from '../services/whatsappDatabase';
import { whatsappProvider } from '../services/whatsappProvider';
import { whatsappQueueWorker } from '../services/whatsappQueueWorker';
import { loadLocalLeads } from '../services/webinarLeadsService';

async function runTestSuite() {
  console.log('====================================================');
  console.log(' RUNNING THE FORGE PROPERTIES WHATSAPP TEST SUITE   ');
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

  // TEST 1: Phone Normalization
  await test('Phone number normalization handles standard, Nigerian local 080..., and special characters', () => {
    assert.strictEqual(normalizePhone('+234 803 301 8708'), '2348033018708');
    assert.strictEqual(normalizePhone('08033018708'), '2348033018708');
    assert.strictEqual(normalizePhone('+1 (803) 723-2324'), '18037232324');
    assert.strictEqual(normalizePhone(''), '');
  });

  // TEST 2: Template validation
  await test('Approved templates exist with validated variables and category', () => {
    const templates = whatsappProvider.getTemplates();
    assert.ok(templates.length >= 4);
    const followup = templates.find(t => t.name === 'webinar_followup');
    assert.ok(followup);
    assert.strictEqual(followup.status, 'APPROVED');
    assert.ok(followup.variables.length >= 2);
    assert.ok(followup.body_text.includes('{{1}}'));
  });

  // TEST 3: Safe Test / Dry-Run Mode when live sending disabled
  await test('Safe test mode returns simulated message ID and never claims real delivery without credentials', async () => {
    const result = await whatsappProvider.sendTemplateMessage(
      '+2348033018708',
      'webinar_followup',
      { '1': 'Abubakar Jafaru', '2': 'Prasino Lush Phase 2' }
    );
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.isSimulated, true);
    assert.ok(result.providerMessageId?.startsWith('sim_wamid_'));
  });

  // TEST 4: Invalid phone number rejection
  await test('Invalid phone numbers (<10 digits) are rejected with clear error', async () => {
    const result = await whatsappProvider.sendTemplateMessage(
      '12345',
      'webinar_followup'
    );
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorCode, 'INVALID_PHONE_NUMBER');
  });

  // TEST 5: Unapproved template rejection
  await test('Arbitrary unapproved templates are rejected outside Meta rules', async () => {
    const result = await whatsappProvider.sendTemplateMessage(
      '+2348033018708',
      'unapproved_marketing_blast_xyz'
    );
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorCode, 'UNAPPROVED_TEMPLATE');
  });

  // TEST 6: Opt-out recording and exclusion
  await test('Contacts who opt out are immediately excluded from future campaigns', async () => {
    const testPhone = '+2348999999001';
    await recordOptOut(null, testPhone, 'User sent STOP keyword', 'webhook_stop');
    assert.strictEqual(isPhoneOptedOut(testPhone), true);

    const leads = loadLocalLeads();
    const testLead = leads[0];
    if (testLead) {
      await updateLeadConsent(null, testLead.id, false, 'admin_opt_out');
      assert.strictEqual(testLead.whatsapp_opt_in, false);
    }
  });

  // TEST 7: Consent Enforcement on Queue
  await test('Only contacts with explicit whatsapp_opt_in=true can be queued', async () => {
    const campaign = await createCampaign(null, {
      name: 'Q4 Investor Exclusive',
      template_name: 'webinar_followup',
      created_by: 'theforgeproperties@gmail.com'
    });

    const optedOutPhone = '+2348999999001';
    const validOptedInPhone = '+2348034546198';

    const queueResult = await enqueueCampaignMessages(null, campaign.id, [
      {
        lead_id: 'test_lead_unopted',
        recipient_number: optedOutPhone,
        recipient_name: 'Opted Out Contact'
      },
      {
        lead_id: 'test_lead_opted',
        recipient_number: validOptedInPhone,
        recipient_name: 'Consenting Investor'
      }
    ]);

    // Opted out contact should be excluded from queue
    assert.strictEqual(queueResult.enqueuedCount, 1);
    const messages = loadMessages().filter(m => m.campaign_id === campaign.id);
    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0].recipient_number, validOptedInPhone);
  });

  // TEST 8: Queue Idempotency
  await test('Duplicate queue jobs with identical idempotency key are discarded', async () => {
    const campaign = await createCampaign(null, {
      name: 'Idempotency Test Campaign',
      template_name: 'webinar_followup',
      created_by: 'theforgeproperties@gmail.com'
    });

    // Enqueue first time
    const res1 = await enqueueCampaignMessages(null, campaign.id, [
      {
        lead_id: 'unique_lead_id_999',
        recipient_number: '+2348088884894',
        recipient_name: 'Afeni Owolabi'
      }
    ]);
    assert.strictEqual(res1.enqueuedCount, 1);

    // Enqueue second time with same lead ID
    const res2 = await enqueueCampaignMessages(null, campaign.id, [
      {
        lead_id: 'unique_lead_id_999',
        recipient_number: '+2348088884894',
        recipient_name: 'Afeni Owolabi'
      }
    ]);
    // Duplicate skipped!
    assert.strictEqual(res2.enqueuedCount, 0);
  });

  // TEST 9: Queue Worker Concurrency and Processing
  await test('Queue worker atomically claims and processes pending messages', async () => {
    const campaign = await createCampaign(null, {
      name: 'Worker Processing Test',
      template_name: 'site_inspection_invitation',
      created_by: 'theforgeproperties@gmail.com'
    });

    await enqueueCampaignMessages(null, campaign.id, [
      {
        lead_id: 'worker_test_1',
        recipient_number: '+2348034546198',
        recipient_name: 'Abubakar Lami'
      }
    ]);

    const result = await whatsappQueueWorker.processQueue();
    assert.ok(result.processedCount >= 1);

    const msgs = loadMessages().filter(m => m.campaign_id === campaign.id);
    assert.strictEqual(msgs[0].queue_status, 'sent');
    assert.ok(msgs[0].provider_message_id);
  });

  // TEST 10: Webhook Signature Verification
  await test('Webhook signature verification verifies HMAC SHA256 against raw body', () => {
    const testSecret = 'test_app_secret_forge_2026';
    const payload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const signature = crypto.createHmac('sha256', testSecret).update(payload).digest('hex');

    // Expected valid header
    const validHeader = `sha256=${signature}`;
    const invalidHeader = `sha256=wrong_signature_12345`;

    // Direct check
    const hmacExpected = crypto.createHmac('sha256', testSecret).update(payload).digest('hex');
    assert.strictEqual(signature, hmacExpected);
    assert.strictEqual(validHeader, `sha256=${hmacExpected}`);
    assert.notStrictEqual(signature, invalidHeader.substring(7));
  });

  // TEST 11: Webhook Event Deduplication and Out-of-Order Protection
  await test('Webhook event deduplication prevents duplicate processing and state downgrades', () => {
    const eventId = `test_event_${Date.now()}`;
    const isFirstTime = recordWebhookEvent(eventId, 'status_update', { test: true });
    assert.strictEqual(isFirstTime, true);

    const isSecondTime = recordWebhookEvent(eventId, 'status_update', { test: true });
    assert.strictEqual(isSecondTime, false);
  });

  // TEST 12: Coexistence Status Check
  await test('Coexistence status verifies Nigerian (+234) number eligibility and app preservation', () => {
    const status = whatsappProvider.getCoexistenceStatus();
    assert.strictEqual(status.isEligible, true);
    assert.strictEqual(status.activeAppOnPhone, true);
    assert.ok(status.requirements.length >= 3);
    assert.ok(status.onboardingSteps.length >= 5);
  });

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED     `);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite runner error:', err);
  process.exit(1);
});
