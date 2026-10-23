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

// In-memory caches for fast processing
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
// CAMPAIGNS STORE
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

// -----------------------------------------------------------------------------
// MESSAGES STORE
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// OPT OUTS STORE
// -----------------------------------------------------------------------------
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

// Normalize phone to E.164 digits without plus or leading zeros for reliable comparison
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/[^0-9]/g, '');
  // Standardize Nigerian local 080... to 23480...
  if (digits.startsWith('0') && digits.length === 11) {
    return '234' + digits.substring(1);
  }
  return digits;
}

// Check if a phone is opted out
export function isPhoneOptedOut(phone: string): boolean {
  const norm = normalizePhone(phone);
  if (!norm) return false;
  const optOuts = loadOptOuts();
  return optOuts.some(o => normalizePhone(o.phone_number) === norm);
}

// Record an opt-out (e.g. STOP webhook keyword or admin action)
export async function recordOptOut(
  pool: pg.Pool | null,
  phoneNumber: string,
  reason: string,
  source: string = 'webhook_stop'
): Promise<WhatsAppOptOut> {
  const norm = normalizePhone(phoneNumber);
  const optOuts = loadOptOuts();
  let existing = optOuts.find(o => normalizePhone(o.phone_number) === norm);

  const nowIso = new Date().toISOString();

  if (!existing) {
    existing = {
      id: crypto.randomUUID(),
      phone_number: phoneNumber,
      reason,
      source,
      created_at: nowIso
    };
    optOuts.push(existing);
    saveOptOuts(optOuts);
  }

  // Update webinar_leads opt_out_at & remove opt_in
  const leads = loadLocalLeads();
  let updatedAny = false;
  leads.forEach(l => {
    if (normalizePhone(l.whatsapp_number) === norm) {
      l.whatsapp_opt_in = false;
      l.whatsapp_opt_out_at = nowIso;
      l.updated_at = nowIso;
      updatedAny = true;
    }
  });
  if (updatedAny) {
    saveLocalLeads(leads);
  }

  // Background mirror to Supabase & Postgres
  try {
    supabase.from('whatsapp_opt_outs').upsert([{
      phone_number: phoneNumber,
      reason,
      source
    }]).then();

    supabase.from('webinar_leads').update({
      whatsapp_opt_in: false,
      whatsapp_opt_out_at: nowIso
    }).ilike('whatsapp_number', `%${norm.slice(-10)}%`).then();
  } catch (err) {
    console.warn('Supabase opt-out sync warning:', err);
  }

  if (pool) {
    try {
      await pool.query(`
        INSERT INTO public.whatsapp_opt_outs (phone_number, reason, source)
        VALUES ($1, $2, $3)
        ON CONFLICT (phone_number) DO NOTHING;
      `, [phoneNumber, reason, source]);

      await pool.query(`
        UPDATE public.webinar_leads
        SET whatsapp_opt_in = FALSE, whatsapp_opt_out_at = NOW()
        WHERE whatsapp_number ILIKE '%' || $1 || '%';
      `, [norm.slice(-10)]);
    } catch (err) {
      console.warn('PostgreSQL opt-out sync warning:', err);
    }
  }

  return existing;
}

// -----------------------------------------------------------------------------
// LEAD CONSENT MANAGEMENT
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

    // If opted out, also record in opt-outs table
    if (!optIn && target.whatsapp_number) {
      await recordOptOut(pool, target.whatsapp_number, 'Admin consent removal', source);
    }

    // Mirror to Supabase
    try {
      const payload: Record<string, unknown> = {
        whatsapp_opt_in: optIn,
        whatsapp_opt_in_at: optIn ? nowIso : null,
        whatsapp_opt_in_source: optIn ? source : null,
        whatsapp_opt_out_at: optIn ? null : nowIso,
        updated_at: nowIso
      };
      if (!isNaN(Number(leadId))) {
        supabase.from('webinar_leads').update(payload).eq('id', Number(leadId)).then();
      }
      if (target.full_name) {
        supabase.from('webinar_leads').update(payload).eq('full_name', target.full_name).then();
      }
    } catch (err) {
      console.warn('Supabase consent update warning:', err);
    }

    // Mirror to PostgreSQL
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
        console.warn('PostgreSQL consent update warning:', err);
      }
    }

    return target;
  }

  return null;
}

// -----------------------------------------------------------------------------
// CAMPAIGNS CRUD
// -----------------------------------------------------------------------------
export async function getCampaigns(pool: pg.Pool | null): Promise<WhatsAppCampaign[]> {
  if (pool) {
    // PostgreSQL pool hook for direct SQL queries
  }
  const campaigns = loadCampaigns();
  // Sort latest first
  campaigns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return campaigns;
}

export async function getCampaignById(pool: pg.Pool | null, id: string): Promise<WhatsAppCampaign | null> {
  if (pool) {
    // PostgreSQL pool hook for direct SQL queries
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

  const campaigns = loadCampaigns();
  campaigns.unshift(campaign);
  saveCampaigns(campaigns);

  // Background mirror to Supabase & PG
  try {
    supabase.from('whatsapp_campaigns').insert([campaign]).then();
  } catch (err) {
    console.warn('Supabase campaign insert warning:', err);
  }

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
      console.warn('Postgres campaign insert warning:', err);
    }
  }

  return campaign;
}

export async function updateCampaignStatus(
  pool: pg.Pool | null,
  campaignId: string,
  newStatus: WhatsAppCampaignStatus
): Promise<WhatsAppCampaign | null> {
  const nowIso = new Date().toISOString();
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === campaignId);

  if (idx !== -1) {
    campaigns[idx].status = newStatus;
    campaigns[idx].updated_at = nowIso;
    saveCampaigns(campaigns);

    try {
      supabase.from('whatsapp_campaigns').update({ status: newStatus, updated_at: nowIso }).eq('id', campaignId).then();
    } catch {
      // Supabase ignore
    }

    if (pool) {
      try {
        await pool.query('UPDATE public.whatsapp_campaigns SET status = $1, updated_at = NOW() WHERE id = $2;', [newStatus, campaignId]);
      } catch {
        // PG ignore
      }
    }

    return campaigns[idx];
  }

  return null;
}

// -----------------------------------------------------------------------------
// CAMPAIGN MESSAGES QUEUE
// -----------------------------------------------------------------------------
export async function getCampaignMessages(
  pool: pg.Pool | null,
  campaignId: string
): Promise<WhatsAppCampaignMessage[]> {
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
  const campaigns = loadCampaigns();
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const allMessages = loadMessages();
  const newMessages: WhatsAppCampaignMessage[] = [];

  for (const r of recipients) {
    const normPhone = normalizePhone(r.recipient_number);
    // Double check consent & opt-out immediately before queueing
    if (isPhoneOptedOut(normPhone)) {
      continue;
    }

    const idempotencyKey = `cmp_${campaignId}_lead_${r.lead_id || normPhone}_v1`;
    // Prevent duplicate entries
    if (allMessages.some(m => m.idempotency_key === idempotencyKey)) {
      continue;
    }

    const msg: WhatsAppCampaignMessage = {
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      lead_id: r.lead_id || null,
      recipient_number: r.recipient_number,
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

  allMessages.push(...newMessages);
  saveMessages(allMessages);

  // Update campaign counters
  campaign.total_recipients = (campaign.total_recipients || 0) + newMessages.length;
  campaign.queued_count = (campaign.queued_count || 0) + newMessages.length;
  campaign.status = 'queued';
  campaign.updated_at = nowIso;
  saveCampaigns(campaigns);

  // Background mirror
    try {
      supabase.from('whatsapp_campaign_messages').insert(newMessages).then();
      supabase.from('whatsapp_campaigns').update({
        total_recipients: campaign.total_recipients,
        queued_count: campaign.queued_count,
        status: 'queued',
        updated_at: nowIso
      }).eq('id', campaignId).then();
    } catch {
      // Supabase ignore
    }

    return {
      enqueuedCount: newMessages.length,
      campaign
    };
  }

  // -----------------------------------------------------------------------------
  // STATS CALCULATION
  // -----------------------------------------------------------------------------
  export function getWhatsAppStats(): WhatsAppStats {
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

    messages.forEach(m => {
      if (m.queue_status === 'pending' || m.queue_status === 'processing') totalQueued++;
      if (m.queue_status === 'sent') totalSent++;
      if (m.queue_status === 'delivered') { totalSent++; totalDelivered++; }
      if (m.queue_status === 'read') { totalSent++; totalDelivered++; totalRead++; }
      if (m.queue_status === 'failed') totalFailed++;
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
      total_opt_outs: optOuts.length,
      delivery_rate: deliveryRate,
      read_rate: readRate
    };
  }

  // Record raw webhook events for deduplication and audit trail
  export function recordWebhookEvent(eventId: string, eventType?: string, payload?: unknown): boolean {
  try {
    let events: Array<{ event_id: string; event_type?: string; payload?: unknown; created_at: string }> = [];
    if (fs.existsSync(WEBHOOK_EVENTS_FILE)) {
      events = JSON.parse(fs.readFileSync(WEBHOOK_EVENTS_FILE, 'utf-8'));
    }
    // Idempotent check
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
