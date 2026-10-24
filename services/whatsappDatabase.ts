import fs from 'fs';
import path from 'path';
import pg from 'pg';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { 
  WhatsAppCampaign, 
  WhatsAppCampaignMessage, 
  WhatsAppOptOut, 
  WhatsAppStats, 
  WhatsAppCampaignStatus,
  WebinarLead 
} from '../types';
import { loadLocalLeads, saveLocalLeads } from './webinarLeadsService';

const supabaseUrl = process.env.SUPABASE_URL || 'https://amoqzkmzoclsyhuigazo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb3F6a216b2Nsc3lodWlnYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxNjUsImV4cCI6MjA4MDYzMjE2NX0.OMocRVGkcm8V0yslfSXUIvx9mMIQ3KLN6_1SGANB3E8';
const supabase = createClient(supabaseUrl, supabaseKey);

const CAMPAIGNS_FILE = path.join(process.cwd(), 'config', 'whatsapp_campaigns.json');
const MESSAGES_FILE = path.join(process.cwd(), 'config', 'whatsapp_messages.json');
const OPTOUTS_FILE = path.join(process.cwd(), 'config', 'whatsapp_opt_outs.json');
const WEBHOOK_EVENTS_FILE = path.join(process.cwd(), 'config', 'whatsapp_webhook_events.json');

// In-memory caches for test/offline environments
let memoryCampaigns: WhatsAppCampaign[] = [];
let memoryMessages: WhatsAppCampaignMessage[] = [];
let memoryOptOuts: WhatsAppOptOut[] = [];

function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// -----------------------------------------------------------------------------
// CANONICAL PHONE NORMALIZATION
// Standardizes Nigerian (+234) and international numbers into canonical E.164 (+<digits>)
// Matches public.normalize_phone(p_raw_phone TEXT) in PostgreSQL
// -----------------------------------------------------------------------------
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/[^0-9]/g, '');
  if (!digits) return '';

  let canonicalDigits = digits;
  // Nigerian 11-digit local format: 080..., 070..., 090... -> 23480...
  if (digits.length === 11 && digits.startsWith('0')) {
    canonicalDigits = '234' + digits.substring(1);
  }
  // Nigerian 14-digit local prefix format: 234080... -> 23480...
  else if (digits.length === 14 && digits.startsWith('2340')) {
    canonicalDigits = '234' + digits.substring(4);
  }

  return '+' + canonicalDigits;
}

// -----------------------------------------------------------------------------
// OFFLINE / TEST MEMORY HELPERS
// (Used ONLY during initial setup migration or test mock runs without PostgreSQL)
// -----------------------------------------------------------------------------
export function loadCampaigns(): WhatsAppCampaign[] {
  if (memoryCampaigns.length > 0) return memoryCampaigns;
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryCampaigns = parsed;
        return memoryCampaigns;
      }
    }
  } catch (err) {
    console.error('Failed to read whatsapp_campaigns.json:', err);
  }
  return memoryCampaigns;
}

export function saveCampaigns(campaigns: WhatsAppCampaign[]): void {
  memoryCampaigns = [...campaigns];
  try {
    ensureDirectoryExists(CAMPAIGNS_FILE);
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write whatsapp_campaigns.json:', err);
  }
}

export function loadMessages(): WhatsAppCampaignMessage[] {
  if (memoryMessages.length > 0) return memoryMessages;
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryMessages = parsed;
        return memoryMessages;
      }
    }
  } catch (err) {
    console.error('Failed to read whatsapp_messages.json:', err);
  }
  return memoryMessages;
}

export function saveMessages(messages: WhatsAppCampaignMessage[]): void {
  memoryMessages = [...messages];
  try {
    ensureDirectoryExists(MESSAGES_FILE);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write whatsapp_messages.json:', err);
  }
}

export function loadOptOuts(): WhatsAppOptOut[] {
  if (memoryOptOuts.length > 0) return memoryOptOuts;
  try {
    if (fs.existsSync(OPTOUTS_FILE)) {
      const data = fs.readFileSync(OPTOUTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryOptOuts = parsed;
        return memoryOptOuts;
      }
    }
  } catch (err) {
    console.error('Failed to read whatsapp_opt_outs.json:', err);
  }
  return memoryOptOuts;
}

export function saveOptOuts(optOuts: WhatsAppOptOut[]): void {
  memoryOptOuts = [...optOuts];
  try {
    ensureDirectoryExists(OPTOUTS_FILE);
    fs.writeFileSync(OPTOUTS_FILE, JSON.stringify(optOuts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write whatsapp_opt_outs.json:', err);
  }
}

// -----------------------------------------------------------------------------
// CHECK OPT-OUT (Canonical Phone Match)
// Synchronous check against local memory/cache, with optional database check
// -----------------------------------------------------------------------------
export function isPhoneOptedOut(phone: string, _pool?: pg.Pool | null): boolean {
  void _pool;
  const canonical = normalizePhone(phone);
  if (!canonical) return false;

  const optOuts = loadOptOuts();
  return optOuts.some(o => normalizePhone(o.phone_number) === canonical);
}

export async function isPhoneOptedOutDb(phone: string, pool?: pg.Pool | null): Promise<boolean> {
  const canonical = normalizePhone(phone);
  if (!canonical) return false;

  if (pool) {
    try {
      const res = await pool.query(
        'SELECT 1 FROM public.whatsapp_opt_outs WHERE phone_number = $1 LIMIT 1;',
        [canonical]
      );
      if (res.rows.length > 0) return true;
    } catch (err) {
      console.warn('[isPhoneOptedOutDb] Direct PG check error:', err);
    }
  }

  return isPhoneOptedOut(phone);
}

// -----------------------------------------------------------------------------
// RECORD OPT-OUT (STOP Keyword / Admin Action)
// Strictly canonical, exact match, cancels queued messages immediately
// -----------------------------------------------------------------------------
export async function recordOptOut(
  pool: pg.Pool | null,
  phoneNumber: string,
  reason: string,
  source: string = 'webhook_stop'
): Promise<WhatsAppOptOut> {
  const canonical = normalizePhone(phoneNumber);
  if (!canonical) {
    throw new Error('Invalid phone number for opt-out');
  }

  const nowIso = new Date().toISOString();

  // 1. If PostgreSQL pool is available, execute atomic RPC
  if (pool) {
    try {
      await pool.query(
        'SELECT * FROM public.process_whatsapp_opt_out($1, $2, $3);',
        [canonical, reason, source]
      );
    } catch (pgErr) {
      console.error('[recordOptOut] PostgreSQL process_whatsapp_opt_out RPC error:', pgErr);
      throw pgErr; // Fail-closed
    }
  }

  // 2. Sync to local memory / file stores
  const optOuts = loadOptOuts();
  let existing = optOuts.find(o => normalizePhone(o.phone_number) === canonical);
  if (!existing) {
    existing = {
      id: crypto.randomUUID(),
      phone_number: canonical,
      reason,
      source,
      created_at: nowIso
    };
    optOuts.push(existing);
    saveOptOuts(optOuts);
  }

  // Cancel any active queued or pending messages for this number
  const messages = loadMessages();
  let cancelledCount = 0;
  messages.forEach(m => {
    if (normalizePhone(m.recipient_number) === canonical && 
        (m.queue_status === 'pending' || m.queue_status === 'processing')) {
      m.queue_status = 'cancelled';
      m.last_error = `Recipient opted out (${reason})`;
      m.claim_token = null;
      m.lease_expires_at = null;
      m.updated_at = nowIso;
      cancelledCount++;
    }
  });
  if (cancelledCount > 0) {
    saveMessages(messages);
  }

  // Update webinar leads
  const leads = loadLocalLeads();
  let updatedAnyLead = false;
  leads.forEach(l => {
    if (normalizePhone(l.whatsapp_number) === canonical) {
      l.whatsapp_opt_in = false;
      l.whatsapp_opt_out_at = nowIso;
      l.updated_at = nowIso;
      updatedAnyLead = true;
    }
  });
  if (updatedAnyLead) {
    saveLocalLeads(leads);
  }

  // 3. Mirror to Supabase REST
  try {
    await supabase.from('whatsapp_opt_outs').upsert([{
      phone_number: canonical,
      reason,
      source
    }]);

    await supabase.from('webinar_leads').update({
      whatsapp_opt_in: false,
      whatsapp_opt_out_at: nowIso
    }).eq('whatsapp_number', canonical);

    await supabase.from('whatsapp_campaign_messages').update({
      queue_status: 'cancelled',
      last_error: `Recipient opted out (${reason})`,
      updated_at: nowIso
    }).in('queue_status', ['pending', 'processing'])
      .eq('recipient_number', canonical);
  } catch (err) {
    console.warn('[recordOptOut] Supabase REST sync warning:', err);
  }

  return existing;
}

// -----------------------------------------------------------------------------
// LEAD CONSENT MANAGEMENT (Explicit opt-in required)
// -----------------------------------------------------------------------------
export async function updateLeadConsent(
  pool: pg.Pool | null,
  leadId: string | number,
  optIn: boolean,
  source: string = 'admin_recorded',
  leadNameHint?: string
): Promise<WebinarLead | null> {
  const nowIso = new Date().toISOString();
  const leads = loadLocalLeads();

  let target = leads.find(l => String(l.id) === String(leadId) || l.id === leadId);
  if (!target && leadNameHint) {
    target = leads.find(l => l.full_name.trim().toLowerCase() === leadNameHint.trim().toLowerCase());
  }

  if (target) {
    target.whatsapp_opt_in = optIn;
    if (optIn) {
      target.whatsapp_opt_in_at = nowIso;
      target.whatsapp_opt_in_source = source;
      target.whatsapp_opt_out_at = null;
    } else {
      target.whatsapp_opt_out_at = nowIso;
    }
    target.updated_at = nowIso;
    saveLocalLeads(leads);

    if (!optIn && target.whatsapp_number) {
      await recordOptOut(pool, target.whatsapp_number, 'Admin consent removal', source);
    }

    if (pool) {
      try {
        await pool.query(`
          UPDATE public.webinar_leads
          SET 
            whatsapp_opt_in = $1,
            whatsapp_opt_in_at = CASE WHEN $1 = TRUE THEN NOW() ELSE whatsapp_opt_in_at END,
            whatsapp_opt_in_source = CASE WHEN $1 = TRUE THEN $2 ELSE whatsapp_opt_in_source END,
            whatsapp_opt_out_at = CASE WHEN $1 = FALSE THEN NOW() ELSE NULL END,
            updated_at = NOW()
          WHERE id = $3 OR full_name = $4;
        `, [optIn, source, isNaN(Number(leadId)) ? 0 : Number(leadId), target.full_name]);
      } catch (err) {
        console.warn('[updateLeadConsent] PostgreSQL update warning:', err);
      }
    }

    return target;
  }

  return null;
}

// -----------------------------------------------------------------------------
// CAMPAIGNS DATABASE CRUD
// -----------------------------------------------------------------------------
export async function getCampaigns(pool: pg.Pool | null): Promise<WhatsAppCampaign[]> {
  if (pool) {
    try {
      const res = await pool.query(`
        SELECT 
          id, name, template_name, template_language, template_variables,
          status, created_by, scheduled_at, total_recipients, queued_count,
          sent_count, delivered_count, read_count, failed_count, opted_out_count,
          created_at, updated_at
        FROM public.whatsapp_campaigns
        ORDER BY created_at DESC;
      `);
      return res.rows.map(r => ({
        ...r,
        template_variables: typeof r.template_variables === 'string' ? JSON.parse(r.template_variables) : r.template_variables || {}
      }));
    } catch (err) {
      console.error('[getCampaigns] PostgreSQL query error:', err);
      throw err;
    }
  }

  const campaigns = loadCampaigns();
  campaigns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return campaigns;
}

export async function getCampaignById(pool: pg.Pool | null, id: string): Promise<WhatsAppCampaign | null> {
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM public.whatsapp_campaigns WHERE id = $1 LIMIT 1;',
        [id]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        ...r,
        template_variables: typeof r.template_variables === 'string' ? JSON.parse(r.template_variables) : r.template_variables || {}
      };
    } catch (err) {
      console.error('[getCampaignById] PostgreSQL query error:', err);
      throw err;
    }
  }

  const campaigns = loadCampaigns();
  return campaigns.find(c => c.id === id) || null;
}

export async function createCampaign(
  pool: pg.Pool | null,
  data: {
    name: string;
    template_name: string;
    template_language?: string;
    template_variables?: Record<string, string>;
    created_by: string;
  }
): Promise<WhatsAppCampaign> {
  const nowIso = new Date().toISOString();
  const campaign: WhatsAppCampaign = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    template_name: data.template_name,
    template_language: data.template_language || 'en',
    template_variables: data.template_variables || {},
    status: 'draft',
    created_by: data.created_by,
    scheduled_at: null,
    total_recipients: 0,
    queued_count: 0,
    sent_count: 0,
    delivered_count: 0,
    read_count: 0,
    failed_count: 0,
    opted_out_count: 0,
    created_at: nowIso,
    updated_at: nowIso
  };

  if (pool) {
    try {
      await pool.query(`
        INSERT INTO public.whatsapp_campaigns (
          id, name, template_name, template_language, template_variables, status, created_by,
          total_recipients, queued_count, sent_count, delivered_count, read_count, failed_count, opted_out_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
      `, [
        campaign.id, campaign.name, campaign.template_name, campaign.template_language,
        JSON.stringify(campaign.template_variables), campaign.status, campaign.created_by,
        campaign.total_recipients, campaign.queued_count, campaign.sent_count, campaign.delivered_count,
        campaign.read_count, campaign.failed_count, campaign.opted_out_count
      ]);
    } catch (err) {
      console.error('[createCampaign] PostgreSQL insert error:', err);
      throw err;
    }
  }

  const campaigns = loadCampaigns();
  campaigns.unshift(campaign);
  saveCampaigns(campaigns);

  return campaign;
}

export async function updateCampaignStatus(
  pool: pg.Pool | null,
  campaignId: string,
  newStatus: WhatsAppCampaignStatus
): Promise<WhatsAppCampaign | null> {
  const nowIso = new Date().toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        'UPDATE public.whatsapp_campaigns SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;',
        [newStatus, campaignId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (err) {
      console.error('[updateCampaignStatus] PostgreSQL error:', err);
      throw err;
    }
  }

  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === campaignId);
  if (idx !== -1) {
    campaigns[idx].status = newStatus;
    campaigns[idx].updated_at = nowIso;
    saveCampaigns(campaigns);
    return campaigns[idx];
  }
  return null;
}

// -----------------------------------------------------------------------------
// CAMPAIGN MESSAGES QUEUE & DATABASE-AUTHORITATIVE CLAIMING
// -----------------------------------------------------------------------------
export async function getCampaignMessages(
  pool: pg.Pool | null,
  campaignId: string
): Promise<WhatsAppCampaignMessage[]> {
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM public.whatsapp_campaign_messages WHERE campaign_id = $1 ORDER BY queued_at ASC;',
        [campaignId]
      );
      return res.rows.map(r => ({
        ...r,
        template_variables: typeof r.template_variables === 'string' ? JSON.parse(r.template_variables) : r.template_variables || {}
      }));
    } catch (err) {
      console.error('[getCampaignMessages] PostgreSQL error:', err);
      throw err;
    }
  }

  const messages = loadMessages();
  return messages.filter(m => m.campaign_id === campaignId);
}

export async function enqueueCampaignMessages(
  pool: pg.Pool | null,
  campaignId: string,
  recipients: Array<{
    lead_id?: number | string;
    recipient_number: string;
    recipient_name: string;
    template_variables?: Record<string, string>;
  }>
): Promise<{ enqueuedCount: number; campaign: WhatsAppCampaign }> {
  const nowIso = new Date().toISOString();
  let campaign = await getCampaignById(pool, campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const allMessages = loadMessages();
  const newMessages: WhatsAppCampaignMessage[] = [];

  for (const r of recipients) {
    const canonicalPhone = normalizePhone(r.recipient_number);
    // Double check consent & opt-out immediately before queueing
    const isOptedOut = isPhoneOptedOut(canonicalPhone, pool);
    if (isOptedOut) {
      continue;
    }

    const idempotencyKey = `cmp_${campaignId}_lead_${r.lead_id || canonicalPhone}_v1`;
    // Prevent duplicate queue entries
    if (allMessages.some(m => m.idempotency_key === idempotencyKey)) {
      continue;
    }

    const msg: WhatsAppCampaignMessage = {
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      lead_id: r.lead_id ? String(r.lead_id) : null,
      recipient_number: canonicalPhone,
      recipient_name: r.recipient_name || 'Valued Investor',
      template_name: campaign.template_name,
      template_variables: { ...(campaign.template_variables || {}), ...(r.template_variables || {}) },
      queue_status: 'pending',
      provider_message_id: null,
      attempt_count: 0,
      max_attempts: 3,
      next_retry_at: null,
      last_error: null,
      idempotency_key: idempotencyKey,
      claim_token: null,
      claimed_at: null,
      claimed_by: null,
      lease_expires_at: null,
      queued_at: nowIso,
      sent_at: null,
      delivered_at: null,
      read_at: null,
      failed_at: null,
      created_at: nowIso,
      updated_at: nowIso
    };

    newMessages.push(msg);
  }

  if (pool && newMessages.length > 0) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const m of newMessages) {
        await client.query(`
          INSERT INTO public.whatsapp_campaign_messages (
            id, campaign_id, lead_id, recipient_number, recipient_name,
            template_name, template_variables, queue_status, attempt_count, max_attempts,
            idempotency_key, queued_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (idempotency_key) DO NOTHING;
        `, [
          m.id, m.campaign_id, m.lead_id, m.recipient_number, m.recipient_name,
          m.template_name, JSON.stringify(m.template_variables), m.queue_status,
          m.attempt_count, m.max_attempts, m.idempotency_key, m.queued_at, m.created_at, m.updated_at
        ]);
      }

      const countRes = await client.query(
        'SELECT count(*) FROM public.whatsapp_campaign_messages WHERE campaign_id = $1;',
        [campaignId]
      );
      const totalRecipients = parseInt(countRes.rows[0].count, 10);

      const updRes = await client.query(`
        UPDATE public.whatsapp_campaigns
        SET total_recipients = $1,
            queued_count = (SELECT count(*) FROM public.whatsapp_campaign_messages WHERE campaign_id = $2 AND queue_status = 'pending'),
            status = 'queued',
            updated_at = NOW()
        WHERE id = $2
        RETURNING *;
      `, [totalRecipients, campaignId]);

      await client.query('COMMIT');
      campaign = updRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[enqueueCampaignMessages] Transaction error:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  // Sync memory store
  allMessages.push(...newMessages);
  saveMessages(allMessages);

  // Update memory campaigns
  const campaigns = loadCampaigns();
  const cIdx = campaigns.findIndex(c => c.id === campaignId);
  if (cIdx !== -1) {
    campaigns[cIdx].total_recipients = (campaigns[cIdx].total_recipients || 0) + newMessages.length;
    campaigns[cIdx].queued_count = (campaigns[cIdx].queued_count || 0) + newMessages.length;
    campaigns[cIdx].status = 'queued';
    campaigns[cIdx].updated_at = nowIso;
    saveCampaigns(campaigns);
    campaign = campaigns[cIdx];
  }

  return {
    enqueuedCount: newMessages.length,
    campaign: campaign!
  };
}

// -----------------------------------------------------------------------------
// CLAIM QUEUE BATCH (Calls PostgreSQL RPC public.claim_whatsapp_queue_batch)
// -----------------------------------------------------------------------------
export async function claimQueueBatch(
  pool: pg.Pool | null,
  workerId: string,
  batchSize: number = 25,
  leaseSeconds: number = 300
): Promise<WhatsAppCampaignMessage[]> {
  // If PostgreSQL pool is available, execute the authoritative atomic RPC
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM public.claim_whatsapp_queue_batch($1, $2, $3);',
        [workerId, batchSize, leaseSeconds]
      );
      return res.rows.map(r => ({
        ...r,
        template_variables: typeof r.template_variables === 'string' ? JSON.parse(r.template_variables) : r.template_variables || {}
      }));
    } catch (err) {
      console.error('[claimQueueBatch] Authoritative PostgreSQL RPC error:', err);
      throw err; // Fail-closed
    }
  }

  // OFFLINE / TEST MEMORY CLAIMING EMULATION
  const now = new Date();
  const nowIso = now.toISOString();
  const messages = loadMessages();
  const campaigns = loadCampaigns();

  // 1. Quarantine expired leases to uncertain_delivery
  messages.forEach(m => {
    if (m.queue_status === 'processing' && m.lease_expires_at && new Date(m.lease_expires_at) < now) {
      m.queue_status = 'uncertain_delivery';
      m.last_error = 'Worker lease expired while in processing. Quarantined for webhook reconciliation or manual review.';
      m.claim_token = null;
      m.claimed_at = null;
      m.claimed_by = null;
      m.lease_expires_at = null;
      m.updated_at = nowIso;
    }
  });

  const activeCampaigns = new Set(
    campaigns.filter(c => c.status === 'queued' || c.status === 'processing').map(c => c.id)
  );

  const claimed: WhatsAppCampaignMessage[] = [];
  const leaseExpiryIso = new Date(Date.now() + (leaseSeconds * 1000)).toISOString();

  for (const m of messages) {
    if (!activeCampaigns.has(m.campaign_id)) continue;
    const isReadyPending = m.queue_status === 'pending' && (!m.next_retry_at || new Date(m.next_retry_at) <= now);
    if (isReadyPending && m.attempt_count < m.max_attempts) {
      m.queue_status = 'processing';
      m.attempt_count += 1;
      m.claim_token = crypto.randomUUID();
      m.claimed_at = nowIso;
      m.claimed_by = workerId;
      m.lease_expires_at = leaseExpiryIso;
      m.updated_at = nowIso;
      claimed.push(m);
      if (claimed.length >= batchSize) break;
    }
  }

  saveMessages(messages);
  return claimed;
}

// -----------------------------------------------------------------------------
// ATOMIC MESSAGE FINALIZATION (Calls public.finalize_whatsapp_message)
// Enforces claim token, active lease, and clears all lease fields on exit
// -----------------------------------------------------------------------------
export async function finalizeMessage(
  pool: pg.Pool | null,
  messageId: string,
  claimToken: string,
  status: 'sent' | 'failed' | 'uncertain_delivery' | 'pending' | 'cancelled' | 'skipped',
  providerMessageId: string | null = null,
  error: string | null = null,
  nextRetryAt: string | null = null
): Promise<boolean> {
  const now = new Date();
  const nowIso = now.toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        'SELECT public.finalize_whatsapp_message($1, $2, $3, $4, $5, $6) AS updated;',
        [messageId, claimToken, status, providerMessageId, error, nextRetryAt]
      );
      return Boolean(res.rows[0]?.updated);
    } catch (pgErr) {
      console.error('[finalizeMessage] PostgreSQL finalize_whatsapp_message RPC error:', pgErr);
      return false;
    }
  }

  // OFFLINE / TEST MEMORY CHECK
  const messages = loadMessages();
  const msg = messages.find(m => m.id === messageId);
  if (!msg) return false;

  if (msg.claim_token !== claimToken) {
    console.warn(`[Concurrency] Stale worker write rejected for message ${messageId}. Expected ${msg.claim_token}, got ${claimToken}`);
    return false;
  }

  if (msg.lease_expires_at && new Date(msg.lease_expires_at) < now) {
    console.warn(`[Concurrency] Worker lease expired for message ${messageId}. Write rejected.`);
    return false;
  }

  msg.queue_status = status;
  if (providerMessageId) msg.provider_message_id = providerMessageId;
  msg.last_error = error;
  msg.next_retry_at = nextRetryAt;
  if (status === 'sent' && !msg.sent_at) msg.sent_at = nowIso;
  if (status === 'failed' && !msg.failed_at) msg.failed_at = nowIso;
  
  // Always clear claim and lease fields on finalization
  msg.claim_token = null;
  msg.claimed_at = null;
  msg.claimed_by = null;
  msg.lease_expires_at = null;
  msg.updated_at = nowIso;

  saveMessages(messages);
  return true;
}

// -----------------------------------------------------------------------------
// RECONCILE UNCERTAIN MESSAGES (Manual Admin Action)
// -----------------------------------------------------------------------------
export async function reconcileUncertainMessage(
  pool: pg.Pool | null,
  messageId: string,
  resolution: 'mark_as_sent' | 'requeue_for_send' | 'mark_as_failed',
  providerMessageId?: string,
  notes?: string
): Promise<boolean> {
  const nowIso = new Date().toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        'SELECT public.reconcile_uncertain_message($1, $2, $3, $4) AS reconciled;',
        [messageId, resolution, providerMessageId || null, notes || null]
      );
      return Boolean(res.rows[0]?.reconciled);
    } catch (err) {
      console.error('[reconcileUncertainMessage] PostgreSQL RPC error:', err);
      throw err;
    }
  }

  // Offline / test memory check
  const messages = loadMessages();
  const msg = messages.find(m => m.id === messageId);
  if (!msg || msg.queue_status !== 'uncertain_delivery') {
    return false;
  }

  if (resolution === 'mark_as_sent') {
    msg.queue_status = 'sent';
    if (providerMessageId) msg.provider_message_id = providerMessageId;
    msg.sent_at = msg.sent_at || nowIso;
    msg.last_error = notes ? `Manually reconciled: ${notes}` : msg.last_error;
  } else if (resolution === 'requeue_for_send') {
    msg.queue_status = 'pending';
    msg.attempt_count = 0;
    msg.next_retry_at = nowIso;
    msg.last_error = notes ? `Re-queued: ${notes}` : 'Re-queued from quarantine';
  } else if (resolution === 'mark_as_failed') {
    msg.queue_status = 'failed';
    msg.failed_at = nowIso;
    msg.last_error = notes || 'Marked failed during manual review';
  }

  msg.claim_token = null;
  msg.claimed_at = null;
  msg.claimed_by = null;
  msg.lease_expires_at = null;
  msg.updated_at = nowIso;
  saveMessages(messages);

  return true;
}

// -----------------------------------------------------------------------------
// RECONCILE WITH WEBHOOK (Delivery Status Callback Reconciler)
// Polymorphic: supports both (pool, providerMsgId, recipientPhone, statusType)
// and (providerMsgId, recipientPhone, statusType)
// -----------------------------------------------------------------------------
export function reconcileWithWebhook(
  providerMessageId: string,
  recipientPhone?: string,
  statusType?: 'sent' | 'delivered' | 'read' | 'failed'
): WhatsAppCampaignMessage | null;
export function reconcileWithWebhook(
  pool: pg.Pool | null,
  providerMessageId: string,
  recipientPhone?: string,
  statusType?: 'sent' | 'delivered' | 'read' | 'failed'
): Promise<WhatsAppCampaignMessage | null> | (WhatsAppCampaignMessage | null);
export function reconcileWithWebhook(
  arg0: pg.Pool | null | string,
  arg1?: string,
  arg2?: string,
  arg3?: 'sent' | 'delivered' | 'read' | 'failed'
): Promise<WhatsAppCampaignMessage | null> | (WhatsAppCampaignMessage | null) {
  let pool: pg.Pool | null = null;
  let providerMessageId: string;
  let recipientPhone: string | undefined;
  let statusType: 'sent' | 'delivered' | 'read' | 'failed' = 'sent';

  if (typeof arg0 === 'string') {
    providerMessageId = arg0;
    recipientPhone = arg1;
    statusType = (arg2 as 'sent' | 'delivered' | 'read' | 'failed') || 'sent';
  } else {
    pool = arg0;
    providerMessageId = arg1 || '';
    recipientPhone = arg2;
    statusType = arg3 || 'sent';
  }

  const canonicalPhone = recipientPhone ? normalizePhone(recipientPhone) : null;
  const nowIso = new Date().toISOString();

  if (pool) {
    return (async () => {
      try {
        let res = await pool.query(`
          UPDATE public.whatsapp_campaign_messages
          SET queue_status = $1,
              sent_at = CASE WHEN $1 = 'sent' AND sent_at IS NULL THEN NOW() ELSE sent_at END,
              delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END,
              read_at = CASE WHEN $1 = 'read' THEN NOW() ELSE read_at END,
              failed_at = CASE WHEN $1 = 'failed' THEN NOW() ELSE failed_at END,
              claim_token = NULL,
              claimed_at = NULL,
              claimed_by = NULL,
              lease_expires_at = NULL,
              updated_at = NOW()
          WHERE provider_message_id = $2
          RETURNING *;
        `, [statusType, providerMessageId]);

        if (res.rows.length === 0 && canonicalPhone) {
          res = await pool.query(`
            UPDATE public.whatsapp_campaign_messages
            SET queue_status = $1,
                provider_message_id = $2,
                sent_at = CASE WHEN $1 = 'sent' AND sent_at IS NULL THEN NOW() ELSE sent_at END,
                delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END,
                read_at = CASE WHEN $1 = 'read' THEN NOW() ELSE read_at END,
                failed_at = CASE WHEN $1 = 'failed' THEN NOW() ELSE failed_at END,
                claim_token = NULL,
                claimed_at = NULL,
                claimed_by = NULL,
                lease_expires_at = NULL,
                updated_at = NOW()
            WHERE public.normalize_phone(recipient_number) = $3
              AND queue_status IN ('uncertain_delivery', 'processing')
            RETURNING *;
          `, [statusType, providerMessageId, canonicalPhone]);
        }

        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err) {
        console.warn('[reconcileWithWebhook] PostgreSQL update warning:', err);
      }
      return null;
    })();
  }

  const messages = loadMessages();
  let target = messages.slice().reverse().find(m => m.provider_message_id === providerMessageId);
  if (!target && canonicalPhone) {
    target = messages.slice().reverse().find(m => 
      (m.queue_status === 'uncertain_delivery' || m.queue_status === 'processing') &&
      normalizePhone(m.recipient_number) === canonicalPhone
    );
  }

  if (target) {
    target.provider_message_id = providerMessageId;
    target.queue_status = statusType;
    if (statusType === 'sent' && !target.sent_at) target.sent_at = nowIso;
    if (statusType === 'delivered' && !target.delivered_at) target.delivered_at = nowIso;
    if (statusType === 'read' && !target.read_at) target.read_at = nowIso;
    if (statusType === 'failed' && !target.failed_at) target.failed_at = nowIso;
    target.claim_token = null;
    target.claimed_at = null;
    target.claimed_by = null;
    target.lease_expires_at = null;
    target.updated_at = nowIso;
    saveMessages(messages);
    return target;
  }

  return null;
}

// -----------------------------------------------------------------------------
// STATS CALCULATION
// -----------------------------------------------------------------------------
export async function getWhatsAppStats(pool: pg.Pool | null): Promise<WhatsAppStats> {
  if (pool) {
    try {
      const campRes = await pool.query(`
        SELECT 
          count(*) AS total,
          count(*) FILTER (WHERE status = 'draft') AS draft,
          count(*) FILTER (WHERE status = 'queued') AS queued,
          count(*) FILTER (WHERE status = 'processing') AS processing,
          count(*) FILTER (WHERE status = 'completed') AS completed
        FROM public.whatsapp_campaigns;
      `);

      const msgRes = await pool.query(`
        SELECT 
          count(*) FILTER (WHERE queue_status IN ('pending', 'processing')) AS total_queued,
          count(*) FILTER (WHERE queue_status IN ('sent', 'delivered', 'read')) AS total_sent,
          count(*) FILTER (WHERE queue_status IN ('delivered', 'read')) AS total_delivered,
          count(*) FILTER (WHERE queue_status = 'read') AS total_read,
          count(*) FILTER (WHERE queue_status = 'failed') AS total_failed,
          count(*) FILTER (WHERE queue_status = 'uncertain_delivery') AS total_uncertain
        FROM public.whatsapp_campaign_messages;
      `);

      const optRes = await pool.query('SELECT count(*) AS total_opt_outs FROM public.whatsapp_opt_outs;');

      const cRow = campRes.rows[0] || {};
      const mRow = msgRes.rows[0] || {};
      const oRow = optRes.rows[0] || {};

      const totalSent = parseInt(mRow.total_sent || '0', 10);
      const totalDelivered = parseInt(mRow.total_delivered || '0', 10);
      const totalRead = parseInt(mRow.total_read || '0', 10);

      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
      const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

      return {
        total_campaigns: parseInt(cRow.total || '0', 10),
        draft_campaigns: parseInt(cRow.draft || '0', 10),
        queued_campaigns: parseInt(cRow.queued || '0', 10),
        processing_campaigns: parseInt(cRow.processing || '0', 10),
        completed_campaigns: parseInt(cRow.completed || '0', 10),
        total_messages_queued: parseInt(mRow.total_queued || '0', 10),
        total_messages_sent: totalSent,
        total_messages_delivered: totalDelivered,
        total_messages_read: totalRead,
        total_messages_failed: parseInt(mRow.total_failed || '0', 10),
        total_messages_uncertain: parseInt(mRow.total_uncertain || '0', 10),
        total_opt_outs: parseInt(oRow.total_opt_outs || '0', 10),
        delivery_rate: deliveryRate,
        read_rate: readRate
      };
    } catch (err) {
      console.warn('[getWhatsAppStats] PostgreSQL query error:', err);
    }
  }

  // Fallback to local memory calculations
  const campaigns = loadCampaigns();
  const messages = loadMessages();
  const optOuts = loadOptOuts();

  let draft = 0;
  let queued = 0;
  let processing = 0;
  let completed = 0;

  campaigns.forEach(c => {
    if (c.status === 'draft') draft++;
    else if (c.status === 'queued') queued++;
    else if (c.status === 'processing') processing++;
    else if (c.status === 'completed') completed++;
  });

  let totalQueued = 0;
  let totalSent = 0;
  let totalDelivered = 0;
  let totalRead = 0;
  let totalFailed = 0;
  let totalUncertain = 0;

  messages.forEach(m => {
    if (m.queue_status === 'pending' || m.queue_status === 'processing') totalQueued++;
    if (m.queue_status === 'sent') totalSent++;
    if (m.queue_status === 'delivered') { totalSent++; totalDelivered++; }
    if (m.queue_status === 'read') { totalSent++; totalDelivered++; totalRead++; }
    if (m.queue_status === 'failed') totalFailed++;
    if (m.queue_status === 'uncertain_delivery') totalUncertain++;
  });

  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  return {
    total_campaigns: campaigns.length,
    draft_campaigns: draft,
    queued_campaigns: queued,
    processing_campaigns: processing,
    completed_campaigns: completed,
    total_messages_queued: totalQueued,
    total_messages_sent: totalSent,
    total_messages_delivered: totalDelivered,
    total_messages_read: totalRead,
    total_messages_failed: totalFailed,
    total_messages_uncertain: totalUncertain,
    total_opt_outs: optOuts.length,
    delivery_rate: deliveryRate,
    read_rate: readRate
  };
}

// -----------------------------------------------------------------------------
// IDEMPOTENT WEBHOOK EVENT LOGGING
// Polymorphic: supports (eventId, eventType, payload) and (pool, eventId, eventType, payload)
// -----------------------------------------------------------------------------
export function recordWebhookEvent(
  eventId: string,
  eventType?: string,
  payload?: unknown
): boolean;
export function recordWebhookEvent(
  pool: pg.Pool | null,
  eventId: string,
  eventType?: string,
  payload?: unknown
): Promise<boolean> | boolean;
export function recordWebhookEvent(
  arg0: pg.Pool | null | string,
  arg1?: string,
  arg2?: string | unknown,
  arg3?: unknown
): Promise<boolean> | boolean {
  let pool: pg.Pool | null = null;
  let eventId: string;
  let eventType: string = 'generic';
  let payload: unknown = {};

  if (typeof arg0 === 'string') {
    eventId = arg0;
    eventType = typeof arg1 === 'string' ? arg1 : 'generic';
    payload = arg2;
  } else {
    pool = arg0;
    eventId = arg1 || '';
    eventType = typeof arg2 === 'string' ? arg2 : 'generic';
    payload = arg3;
  }

  if (pool) {
    return (async () => {
      try {
        const res = await pool.query(`
          INSERT INTO public.whatsapp_webhook_events (event_id, provider, event_type, payload, created_at)
          VALUES ($1, 'meta_cloud_api', $2, $3, NOW())
          ON CONFLICT (event_id) DO NOTHING
          RETURNING id;
        `, [eventId, eventType, JSON.stringify(payload || {})]);
        return res.rows.length > 0;
      } catch (err) {
        console.warn('[recordWebhookEvent] PostgreSQL insert warning:', err);
        return true;
      }
    })();
  }

  // Memory event deduplication
  try {
    let events: Array<{ event_id: string; event_type?: string; payload?: unknown; created_at: string }> = [];
    if (fs.existsSync(WEBHOOK_EVENTS_FILE)) {
      events = JSON.parse(fs.readFileSync(WEBHOOK_EVENTS_FILE, 'utf-8'));
    }
    if (events.some(e => e.event_id === eventId)) {
      return false; // Already processed
    }

    events.unshift({ event_id: eventId, event_type: eventType, payload, created_at: new Date().toISOString() });
    if (events.length > 1000) events = events.slice(0, 1000);
    ensureDirectoryExists(WEBHOOK_EVENTS_FILE);
    fs.writeFileSync(WEBHOOK_EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Webhook event record error:', err);
    return true;
  }
}
