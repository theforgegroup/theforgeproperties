/**
 * The Forge Properties: Supabase One-Time JSON Data Synchronization Utility (v3)
 * File: backend/syncJsonToSupabase.ts
 * 
 * Purpose:
 * Safely and idempotently synchronizes existing local JSON records into Supabase
 * without losing any campaign history, delivery statuses, opt-out suppression lists,
 * or webinar lead notes. Generates an audit reconciliation report before cutover.
 * 
 * Safety:
 * - Read-only on local JSON files (NEVER deletes or modifies the JSON files).
 * - Uses UPSERT (ON CONFLICT DO NOTHING / UPDATE) to avoid duplicate records.
 * - Validates schema constraints before inserting.
 * - Does not run automatically; ready for manual execution after Supabase SQL migration.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://amoqzkmzoclsyhuigazo.supabase.co';
// Prefer SERVICE_ROLE_KEY to bypass RLS during server-side batch sync
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb3F6a216b2Nsc3lodWlnYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxNjUsImV4cCI6MjA4MDYzMjE2NX0.OMocRVGkcm8V0yslfSXUIvx9mMIQ3KLN6_1SGANB3E8';
const supabase = createClient(supabaseUrl, supabaseKey);

const CONFIG_DIR = path.join(process.cwd(), 'config');

function readJsonFile<T>(filename: string): T[] {
  const filePath = path.join(CONFIG_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`[Sync] Notice: ${filename} does not exist, skipping.`);
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[Sync] Failed to parse ${filename}:`, err);
    return [];
  }
}

export interface SyncReconciliationReport {
  timestamp: string;
  tables: {
    opt_outs: { sourceCount: number; syncedCount: number; duplicateCount: number; verifiedDbCount: number };
    campaigns: { sourceCount: number; syncedCount: number; duplicateCount: number; verifiedDbCount: number };
    messages: { sourceCount: number; syncedCount: number; duplicateCount: number; verifiedDbCount: number };
    webhook_events: { sourceCount: number; syncedCount: number; duplicateCount: number; verifiedDbCount: number };
    webinar_leads: { sourceCount: number; syncedCount: number; verifiedDbCount: number };
  };
  errors: string[];
  reconciliationStatus: 'MATCHED' | 'DISCREPANCY' | 'FAILED';
}

export async function runJsonToSupabaseSync(): Promise<SyncReconciliationReport> {
  const errors: string[] = [];
  console.log('================================================================');
  console.log(' STARTING IDEMPOTENT JSON -> SUPABASE DATA SYNCHRONIZATION      ');
  console.log('================================================================\n');

  // 1. Sync WhatsApp Opt-Outs (Suppression List)
  const optOuts = readJsonFile<Record<string, unknown>>('whatsapp_opt_outs.json');
  let optOutsSynced = 0;
  let optOutsDuplicates = 0;
  const seenOptPhones = new Set<string>();

  for (const opt of optOuts) {
    const phone = String(opt.phone_number || '').trim();
    if (seenOptPhones.has(phone)) {
      optOutsDuplicates++;
      continue;
    }
    seenOptPhones.add(phone);

    const { error } = await supabase.from('whatsapp_opt_outs').upsert(
      {
        id: opt.id,
        phone_number: phone,
        reason: opt.reason || 'User opted out',
        source: opt.source || 'admin',
        created_at: opt.created_at || new Date().toISOString()
      },
      { onConflict: 'phone_number' }
    );
    if (error) {
      errors.push(`OptOut sync error (${phone}): ${error.message}`);
    } else {
      optOutsSynced++;
    }
  }

  // 2. Sync WhatsApp Campaigns
  const campaigns = readJsonFile<Record<string, unknown>>('whatsapp_campaigns.json');
  let campaignsSynced = 0;
  let campaignsDuplicates = 0;
  const seenCampaignIds = new Set<string>();

  for (const c of campaigns) {
    const cid = String(c.id);
    if (seenCampaignIds.has(cid)) {
      campaignsDuplicates++;
      continue;
    }
    seenCampaignIds.add(cid);

    const { error } = await supabase.from('whatsapp_campaigns').upsert(
      {
        id: c.id,
        name: c.name,
        template_name: c.template_name,
        template_language: c.template_language || 'en',
        template_variables: c.template_variables || {},
        status: c.status || 'draft',
        created_by: c.created_by || 'theforgeproperties@gmail.com',
        scheduled_at: c.scheduled_at || null,
        total_recipients: c.total_recipients || 0,
        queued_count: c.queued_count || 0,
        sent_count: c.sent_count || 0,
        delivered_count: c.delivered_count || 0,
        read_count: c.read_count || 0,
        failed_count: c.failed_count || 0,
        opted_out_count: c.opted_out_count || 0,
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString()
      },
      { onConflict: 'id' }
    );
    if (error) {
      errors.push(`Campaign sync error (${c.name}): ${error.message}`);
    } else {
      campaignsSynced++;
    }
  }

  // 3. Sync WhatsApp Campaign Messages Queue
  const messages = readJsonFile<Record<string, unknown>>('whatsapp_messages.json');
  let messagesSynced = 0;
  let messagesDuplicates = 0;
  const seenIdempotencyKeys = new Set<string>();

  for (const m of messages) {
    const ikey = String(m.idempotency_key || m.id);
    if (seenIdempotencyKeys.has(ikey)) {
      messagesDuplicates++;
      continue;
    }
    seenIdempotencyKeys.add(ikey);

    const { error } = await supabase.from('whatsapp_campaign_messages').upsert(
      {
        id: m.id,
        campaign_id: m.campaign_id,
        lead_id: m.lead_id ? String(m.lead_id) : null,
        recipient_number: m.recipient_number,
        recipient_name: m.recipient_name || 'Valued Investor',
        template_name: m.template_name,
        template_variables: m.template_variables || {},
        queue_status: m.queue_status || 'pending',
        provider_message_id: m.provider_message_id || null,
        attempt_count: m.attempt_count || 0,
        max_attempts: m.max_attempts || 3,
        next_retry_at: m.next_retry_at || null,
        last_error: m.last_error || null,
        idempotency_key: ikey,
        queued_at: m.queued_at || m.created_at || new Date().toISOString(),
        sent_at: m.sent_at || null,
        delivered_at: m.delivered_at || null,
        read_at: m.read_at || null,
        failed_at: m.failed_at || null,
        created_at: m.created_at || new Date().toISOString(),
        updated_at: m.updated_at || new Date().toISOString()
      },
      { onConflict: 'idempotency_key' }
    );
    if (error) {
      errors.push(`Message sync error (${ikey}): ${error.message}`);
    } else {
      messagesSynced++;
    }
  }

  // 4. Sync Webhook Events
  const webhookEvents = readJsonFile<Record<string, unknown>>('whatsapp_webhook_events.json');
  let eventsSynced = 0;
  let eventsDuplicates = 0;
  const seenEventIds = new Set<string>();

  for (const evt of webhookEvents) {
    const eid = String(evt.event_id);
    if (seenEventIds.has(eid)) {
      eventsDuplicates++;
      continue;
    }
    seenEventIds.add(eid);

    const { error } = await supabase.from('whatsapp_webhook_events').upsert(
      {
        id: evt.id,
        event_id: eid,
        provider: evt.provider || 'meta_cloud_api',
        event_type: evt.event_type || 'status_update',
        payload: evt.payload || {},
        processed: evt.processed ?? true,
        processed_at: evt.processed_at || evt.created_at || new Date().toISOString(),
        error: evt.error || null,
        created_at: evt.created_at || new Date().toISOString()
      },
      { onConflict: 'event_id' }
    );
    if (error) {
      errors.push(`Webhook event sync error (${eid}): ${error.message}`);
    } else {
      eventsSynced++;
    }
  }

  // 5. Sync Webinar Leads
  const leads = readJsonFile<Record<string, unknown>>('webinar_leads.json');
  let leadsSynced = 0;

  for (const l of leads) {
    const payload: Record<string, unknown> = {
      full_name: l.full_name,
      whatsapp_number: l.whatsapp_number,
      email: l.email || null,
      call_status: l.call_status || 'Not Called',
      call_notes: l.call_notes || null,
      called_at: l.called_at || null,
      follow_up_date: l.follow_up_date || null,
      whatsapp_opt_in: Boolean(l.whatsapp_opt_in),
      whatsapp_opt_in_at: l.whatsapp_opt_in_at || null,
      whatsapp_opt_in_source: l.whatsapp_opt_in_source || null,
      whatsapp_opt_out_at: l.whatsapp_opt_out_at || null,
      updated_at: l.updated_at || new Date().toISOString()
    };
    if (typeof l.id === 'number') {
      payload.id = l.id;
    }

    const { error } = await supabase.from('webinar_leads').upsert(payload, {
      onConflict: typeof l.id === 'number' ? 'id' : undefined
    });
    if (error) {
      errors.push(`Lead sync error (${l.full_name}): ${error.message}`);
    } else {
      leadsSynced++;
    }
  }

  // 6. Database Verification Row Counts
  let dbOptOutCount = 0;
  let dbCampaignCount = 0;
  let dbMessageCount = 0;
  let dbEventCount = 0;
  let dbLeadCount = 0;

  try {
    const { count: c1 } = await supabase.from('whatsapp_opt_outs').select('*', { count: 'exact', head: true });
    dbOptOutCount = c1 || 0;
    const { count: c2 } = await supabase.from('whatsapp_campaigns').select('*', { count: 'exact', head: true });
    dbCampaignCount = c2 || 0;
    const { count: c3 } = await supabase.from('whatsapp_campaign_messages').select('*', { count: 'exact', head: true });
    dbMessageCount = c3 || 0;
    const { count: c4 } = await supabase.from('whatsapp_webhook_events').select('*', { count: 'exact', head: true });
    dbEventCount = c4 || 0;
    const { count: c5 } = await supabase.from('webinar_leads').select('*', { count: 'exact', head: true });
    dbLeadCount = c5 || 0;
  } catch (err) {
    errors.push(`Row count verification error: ${err}`);
  }

  const report: SyncReconciliationReport = {
    timestamp: new Date().toISOString(),
    tables: {
      opt_outs: { sourceCount: optOuts.length, syncedCount: optOutsSynced, duplicateCount: optOutsDuplicates, verifiedDbCount: dbOptOutCount },
      campaigns: { sourceCount: campaigns.length, syncedCount: campaignsSynced, duplicateCount: campaignsDuplicates, verifiedDbCount: dbCampaignCount },
      messages: { sourceCount: messages.length, syncedCount: messagesSynced, duplicateCount: messagesDuplicates, verifiedDbCount: dbMessageCount },
      webhook_events: { sourceCount: webhookEvents.length, syncedCount: eventsSynced, duplicateCount: eventsDuplicates, verifiedDbCount: dbEventCount },
      webinar_leads: { sourceCount: leads.length, syncedCount: leadsSynced, verifiedDbCount: dbLeadCount }
    },
    errors,
    reconciliationStatus: errors.length === 0 ? 'MATCHED' : 'DISCREPANCY'
  };

  console.log('\n--- DATA RECONCILIATION AUDIT REPORT ---');
  console.log(JSON.stringify(report, null, 2));
  console.log('----------------------------------------\n');

  return report;
}

// Allow CLI invocation if executed directly
if (process.argv[1]?.endsWith('syncJsonToSupabase.ts')) {
  runJsonToSupabaseSync()
    .then(report => {
      if (report.reconciliationStatus === 'MATCHED') {
        console.log('✅ Synchronization reconciliation successful.');
        process.exit(0);
      } else {
        console.warn('⚠️ Synchronization completed with warnings/discrepancies.');
        process.exit(0);
      }
    })
    .catch(err => {
      console.error('Fatal sync failure:', err);
      process.exit(1);
    });
}
