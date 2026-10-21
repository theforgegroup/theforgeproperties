import express, { Response } from 'express';
import pg from 'pg';
import { requireAdminAuth, AuthenticatedAdminRequest } from '../middleware/adminAuth';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaignStatus,
  getCampaignMessages,
  enqueueCampaignMessages,
  getWhatsAppStats,
  updateLeadConsent,
  recordOptOut,
  isPhoneOptedOut,
  normalizePhone,
  loadMessages,
  saveMessages,
  loadCampaigns,
  saveCampaigns,
  recordWebhookEvent
} from '../services/whatsappDatabase';
import { whatsappProvider, APPROVED_WHATSAPP_TEMPLATES } from '../services/whatsappProvider';
import { loadLocalLeads } from '../services/webinarLeadsService';
import { WebinarLead, WhatsAppCampaignMessage } from '../types';

export const createWhatsAppRouter = (pool: pg.Pool | null): express.Router => {
  const router = express.Router();

  // ---------------------------------------------------------------------------
  // CONTACTS ENDPOINTS
  // ---------------------------------------------------------------------------

  // GET /api/admin/whatsapp/contacts
  // Query params: ?search=&consent=(all|opted_in|pending_consent|opted_out)&page=1&limit=25
  router.get('/contacts', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const search = req.query.search ? String(req.query.search).trim().toLowerCase() : '';
      const consentFilter = req.query.consent ? String(req.query.consent) : 'all';
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const limit = Math.min(100, Math.max(5, parseInt(String(req.query.limit || '25'), 10)));

      const allLeads = loadLocalLeads();

      // Filter leads
      const filtered = allLeads.filter((lead: WebinarLead) => {
        // Search filter
        if (search) {
          const matchName = lead.full_name?.toLowerCase().includes(search);
          const matchPhone = lead.whatsapp_number?.toLowerCase().includes(search);
          const matchEmail = lead.email?.toLowerCase().includes(search);
          if (!matchName && !matchPhone && !matchEmail) {
            return false;
          }
        }

        const normPhone = normalizePhone(lead.whatsapp_number);
        const isOptedOut = Boolean(lead.whatsapp_opt_out_at) || isPhoneOptedOut(normPhone);
        const isOptedIn = Boolean(lead.whatsapp_opt_in) && !isOptedOut;

        // Consent filter
        if (consentFilter === 'opted_in' && !isOptedIn) return false;
        if (consentFilter === 'pending_consent' && (isOptedIn || isOptedOut)) return false;
        if (consentFilter === 'opted_out' && !isOptedOut) return false;

        return true;
      });

      // Sort A-Z
      filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

      const totalCount = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      // Compute eligibility summary across all leads
      let totalEligible = 0;
      let totalPendingConsent = 0;
      let totalOptedOut = 0;

      allLeads.forEach(l => {
        const norm = normalizePhone(l.whatsapp_number);
        const isOut = Boolean(l.whatsapp_opt_out_at) || isPhoneOptedOut(norm);
        const isIn = Boolean(l.whatsapp_opt_in) && !isOut;
        const validPhone = norm.length >= 10;

        if (isOut) totalOptedOut++;
        else if (isIn && validPhone) totalEligible++;
        else totalPendingConsent++;
      });

      res.json({
        contacts: paginated.map(l => ({
          id: l.id,
          full_name: l.full_name,
          whatsapp_number: l.whatsapp_number,
          email: l.email,
          call_status: l.call_status,
          whatsapp_opt_in: Boolean(l.whatsapp_opt_in) && !isPhoneOptedOut(normalizePhone(l.whatsapp_number)),
          whatsapp_opt_in_at: l.whatsapp_opt_in_at || null,
          whatsapp_opt_in_source: l.whatsapp_opt_in_source || null,
          whatsapp_opt_out_at: l.whatsapp_opt_out_at || (isPhoneOptedOut(normalizePhone(l.whatsapp_number)) ? l.updated_at || new Date().toISOString() : null),
          is_eligible: Boolean(l.whatsapp_opt_in) && !isPhoneOptedOut(normalizePhone(l.whatsapp_number)) && normalizePhone(l.whatsapp_number).length >= 10
        })),
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
          totalCount
        },
        summary: {
          totalLeads: allLeads.length,
          totalEligible,
          totalPendingConsent,
          totalOptedOut
        }
      });
    } catch (err) {
      console.error('Error in GET /api/admin/whatsapp/contacts:', err);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  // PUT /api/admin/whatsapp/contacts/:id/consent
  // Body: { opt_in: boolean, source?: string, full_name?: string }
  router.put('/contacts/:id/consent', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { opt_in, source, full_name } = req.body;

      if (typeof opt_in !== 'boolean') {
        res.status(400).json({ error: 'opt_in (boolean) is required in request body' });
        return;
      }

      const updated = await updateLeadConsent(
        pool,
        id,
        opt_in,
        source || 'admin_dashboard_update',
        full_name
      );

      if (!updated) {
        res.status(404).json({ error: 'Contact not found' });
        return;
      }

      res.json({
        success: true,
        contact: {
          id: updated.id,
          full_name: updated.full_name,
          whatsapp_number: updated.whatsapp_number,
          whatsapp_opt_in: updated.whatsapp_opt_in,
          whatsapp_opt_in_at: updated.whatsapp_opt_in_at,
          whatsapp_opt_in_source: updated.whatsapp_opt_in_source,
          whatsapp_opt_out_at: updated.whatsapp_opt_out_at
        }
      });
    } catch (err) {
      console.error('Error in PUT /api/admin/whatsapp/contacts/:id/consent:', err);
      res.status(500).json({ error: 'Failed to update contact consent' });
    }
  });

  // POST /api/admin/whatsapp/contacts/bulk-consent
  // Body: { ids: Array<string | number>, opt_in: boolean, source?: string }
  router.post('/contacts/bulk-consent', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { ids, opt_in, source } = req.body;
      if (!Array.isArray(ids) || typeof opt_in !== 'boolean') {
        res.status(400).json({ error: 'ids (array) and opt_in (boolean) are required' });
        return;
      }

      const updatedResults = [];
      for (const id of ids) {
        const u = await updateLeadConsent(pool, id, opt_in, source || 'bulk_admin_consent');
        if (u) updatedResults.push(u);
      }

      res.json({
        success: true,
        updatedCount: updatedResults.length
      });
    } catch (err) {
      console.error('Error in POST /api/admin/whatsapp/contacts/bulk-consent:', err);
      res.status(500).json({ error: 'Failed to bulk update consent' });
    }
  });

  // ---------------------------------------------------------------------------
  // CAMPAIGNS ENDPOINTS
  // ---------------------------------------------------------------------------

  // GET /api/admin/whatsapp/campaigns
  router.get('/campaigns', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const campaigns = await getCampaigns(pool);
      res.json({ campaigns });
    } catch (err) {
      console.error('Error in GET /api/admin/whatsapp/campaigns:', err);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  // POST /api/admin/whatsapp/campaigns
  // Body: { name: string, template_name: string, template_language?: string, template_variables?: object }
  router.post('/campaigns', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { name, template_name, template_language, template_variables } = req.body;
      if (!name || !template_name) {
        res.status(400).json({ error: 'name and template_name are required' });
        return;
      }

      const campaign = await createCampaign(pool, {
        name,
        template_name,
        template_language,
        template_variables,
        created_by: req.adminUser?.email || 'admin'
      });

      res.status(201).json({ success: true, campaign });
    } catch (err) {
      console.error('Error in POST /api/admin/whatsapp/campaigns:', err);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  // GET /api/admin/whatsapp/campaigns/:id
  router.get('/campaigns/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const campaign = await getCampaignById(pool, id);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }
      res.json({ campaign });
    } catch (err) {
      console.error('Error in GET /api/admin/whatsapp/campaigns/:id:', err);
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  });

  // POST /api/admin/whatsapp/campaigns/:id/preview
  // Body: { contact_ids: Array<string | number>, sample_lead_id?: string | number }
  router.post('/campaigns/:id/preview', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { contact_ids } = req.body;
      const campaign = await getCampaignById(pool, id);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      const template = APPROVED_WHATSAPP_TEMPLATES.find(t => t.name === campaign.template_name);
      if (!template) {
        res.status(400).json({ error: `Template "${campaign.template_name}" not found` });
        return;
      }

      const allLeads = loadLocalLeads();
      const selectedLeads = Array.isArray(contact_ids) && contact_ids.length > 0
        ? allLeads.filter(l => contact_ids.some(cid => String(cid) === String(l.id)))
        : allLeads;

      const eligibleLeads: WebinarLead[] = [];
      const excludedLeads: Array<{ id: number | string; name: string; reason: string }> = [];

      selectedLeads.forEach(l => {
        const norm = normalizePhone(l.whatsapp_number);
        const isOptedOut = Boolean(l.whatsapp_opt_out_at) || isPhoneOptedOut(norm);
        const isOptedIn = Boolean(l.whatsapp_opt_in) && !isOptedOut;

        if (isOptedOut) {
          excludedLeads.push({ id: l.id, name: l.full_name, reason: 'Recipient opted out of WhatsApp messages' });
        } else if (!isOptedIn) {
          excludedLeads.push({ id: l.id, name: l.full_name, reason: 'Recipient has not provided marketing opt-in consent' });
        } else if (norm.length < 10) {
          excludedLeads.push({ id: l.id, name: l.full_name, reason: 'Invalid phone number format (< 10 digits)' });
        } else {
          eligibleLeads.push(l);
        }
      });

      // Sample preview rendering
      const sample = eligibleLeads[0] || selectedLeads[0];
      let sampleMessage = template.body_text;
      if (sample) {
        sampleMessage = sampleMessage.replace('{{1}}', sample.full_name || 'Valued Investor');
        if (campaign.template_variables?.['2']) {
          sampleMessage = sampleMessage.replace('{{2}}', campaign.template_variables['2']);
        }
        if (campaign.template_variables?.['3']) {
          sampleMessage = sampleMessage.replace('{{3}}', campaign.template_variables['3']);
        }
      }

      res.json({
        campaign,
        template,
        totalSelected: selectedLeads.length,
        eligibleCount: eligibleLeads.length,
        excludedCount: excludedLeads.length,
        excludedLeads: excludedLeads.slice(0, 10),
        samplePreview: sampleMessage,
        sampleRecipient: sample ? { name: sample.full_name, phone: sample.whatsapp_number } : null
      });
    } catch (err) {
      console.error('Error in POST /api/admin/whatsapp/campaigns/:id/preview:', err);
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  });

  // POST /api/admin/whatsapp/campaigns/:id/queue
  // Body: { contact_ids?: Array<string | number> }
  router.post('/campaigns/:id/queue', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { contact_ids } = req.body;
      const campaign = await getCampaignById(pool, id);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      if (campaign.status === 'processing' || campaign.status === 'completed') {
        res.status(400).json({ error: `Campaign cannot be queued because its status is ${campaign.status}` });
        return;
      }

      const allLeads = loadLocalLeads();
      const targetLeads = Array.isArray(contact_ids) && contact_ids.length > 0
        ? allLeads.filter(l => contact_ids.some(cid => String(cid) === String(l.id)))
        : allLeads;

      // Filter only strictly eligible opted-in recipients
      const eligibleRecipients = [];
      for (const l of targetLeads) {
        const norm = normalizePhone(l.whatsapp_number);
        const isOptedOut = Boolean(l.whatsapp_opt_out_at) || isPhoneOptedOut(norm);
        const isOptedIn = Boolean(l.whatsapp_opt_in) && !isOptedOut;

        if (isOptedIn && norm.length >= 10) {
          eligibleRecipients.push({
            lead_id: l.id,
            recipient_number: l.whatsapp_number,
            recipient_name: l.full_name,
            template_variables: {
              '1': l.full_name,
              ...(campaign.template_variables || {})
            }
          });
        }
      }

      if (eligibleRecipients.length === 0) {
        res.status(400).json({
          error: 'Zero eligible recipients found. Contacts must have explicit WhatsApp opt-in consent and valid phone numbers to be queued.'
        });
        return;
      }

      const result = await enqueueCampaignMessages(pool, id, eligibleRecipients);

      res.json({
        success: true,
        enqueuedCount: result.enqueuedCount,
        campaign: result.campaign
      });
    } catch (err) {
      console.error('Error in POST /api/admin/whatsapp/campaigns/:id/queue:', err);
      res.status(500).json({ error: 'Failed to enqueue campaign messages' });
    }
  });

  // POST /api/admin/whatsapp/campaigns/:id/pause
  router.post('/campaigns/:id/pause', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await updateCampaignStatus(pool, id, 'paused');
      if (!updated) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }
      res.json({ success: true, campaign: updated });
    } catch (err) {
      console.error('Error in pause campaign:', err);
      res.status(500).json({ error: 'Failed to pause campaign' });
    }
  });

  // POST /api/admin/whatsapp/campaigns/:id/resume
  router.post('/campaigns/:id/resume', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await updateCampaignStatus(pool, id, 'queued');
      if (!updated) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }
      res.json({ success: true, campaign: updated });
    } catch (err) {
      console.error('Error in resume campaign:', err);
      res.status(500).json({ error: 'Failed to resume campaign' });
    }
  });

  // POST /api/admin/whatsapp/campaigns/:id/cancel
  router.post('/campaigns/:id/cancel', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await updateCampaignStatus(pool, id, 'cancelled');
      if (!updated) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      // Mark all pending messages as cancelled
      const messages = loadMessages();
      messages.forEach(m => {
        if (m.campaign_id === id && (m.queue_status === 'pending' || m.queue_status === 'processing')) {
          m.queue_status = 'cancelled';
          m.updated_at = new Date().toISOString();
        }
      });
      saveMessages(messages);

      res.json({ success: true, campaign: updated });
    } catch (err) {
      console.error('Error in cancel campaign:', err);
      res.status(500).json({ error: 'Failed to cancel campaign' });
    }
  });

  // POST /api/admin/whatsapp/campaigns/:id/retry-failed
  router.post('/campaigns/:id/retry-failed', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const messages = loadMessages();
      let retriedCount = 0;
      const nowIso = new Date().toISOString();

      messages.forEach(m => {
        if (m.campaign_id === id && m.queue_status === 'failed') {
          m.queue_status = 'pending';
          m.next_retry_at = null;
          m.last_error = null;
          m.updated_at = nowIso;
          retriedCount++;
        }
      });

      if (retriedCount > 0) {
        saveMessages(messages);
        await updateCampaignStatus(pool, id, 'queued');
      }

      res.json({ success: true, retriedCount });
    } catch (err) {
      console.error('Error in retry failed:', err);
      res.status(500).json({ error: 'Failed to retry messages' });
    }
  });

  // ---------------------------------------------------------------------------
  // TEMPLATES & MESSAGES REPORTING
  // ---------------------------------------------------------------------------

  // GET /api/admin/whatsapp/templates
  router.get('/templates', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
    res.json({ templates: APPROVED_WHATSAPP_TEMPLATES });
  });

  // GET /api/admin/whatsapp/campaigns/:id/messages
  router.get('/campaigns/:id/messages', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const messages = await getCampaignMessages(pool, id);
      res.json({ messages });
    } catch (err) {
      console.error('Error in GET messages:', err);
      res.status(500).json({ error: 'Failed to fetch campaign messages' });
    }
  });

  // GET /api/admin/whatsapp/stats
  router.get('/stats', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const stats = getWhatsAppStats();
      res.json({ stats });
    } catch (err) {
      console.error('Error in GET stats:', err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // GET /api/admin/whatsapp/coexistence-status
  router.get('/coexistence-status', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const status = whatsappProvider.getCoexistenceStatus();
      res.json(status);
    } catch (err) {
      console.error('Error in GET coexistence status:', err);
      res.status(500).json({ error: 'Failed to fetch coexistence status' });
    }
  });

  return router;
};

// -----------------------------------------------------------------------------
// WEBHOOKS ROUTER
// -----------------------------------------------------------------------------
export const createWhatsAppWebhookRouter = (pool: pg.Pool | null): express.Router => {
  const router = express.Router();

  // GET /api/webhooks/whatsapp - Meta Webhook Verification
  router.get('/', (req, res) => {
    const mode = req.query['hub.mode'] ? String(req.query['hub.mode']) : '';
    const token = req.query['hub.verify_token'] ? String(req.query['hub.verify_token']) : '';
    const challenge = req.query['hub.challenge'] ? String(req.query['hub.challenge']) : '';

    const verified = whatsappProvider.verifyWebhookChallenge(mode, token, challenge);
    if (verified) {
      res.status(200).send(verified);
    } else {
      res.status(403).json({ error: 'Webhook verification challenge failed' });
    }
  });

  // POST /api/webhooks/whatsapp - Delivery updates, echoes, and opt-outs
  router.post('/', async (req, res) => {
    try {
      const payload = req.body;
      const rawBody = (req as unknown as { rawBody?: Buffer | string }).rawBody || JSON.stringify(payload);
      const signature = req.headers['x-hub-signature-256'] as string;

      // Verify signature
      if (!whatsappProvider.verifyWebhookSignature(rawBody, signature)) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }

      // Check entry structures
      const entries = payload?.entry || [];
      for (const entry of entries) {
        const changes = entry?.changes || [];
        for (const change of changes) {
          const value = change?.value;
          if (!value) continue;

          // 1. Process Message Status Updates (sent, delivered, read, failed)
          const statuses = value.statuses || [];
          for (const s of statuses) {
            const providerMsgId = s.id;
            const statusType = s.status; // 'sent', 'delivered', 'read', 'failed'
            const timestamp = s.timestamp ? new Date(parseInt(s.timestamp, 10) * 1000).toISOString() : new Date().toISOString();

            if (providerMsgId) {
              const isNew = recordWebhookEvent(`status_${providerMsgId}_${statusType}`, 'status_update', s);
              if (!isNew) continue; // Idempotent deduplication

              const messages = loadMessages();
              const msg = messages.find(m => m.provider_message_id === providerMsgId);
              if (msg) {
                // Out-of-order protection: don't downgrade 'read' or 'delivered' to 'sent'
                const rankMap: Record<string, number> = { pending: 0, processing: 1, sent: 2, delivered: 3, read: 4, failed: 5 };
                const currentRank = rankMap[msg.queue_status] || 0;
                const newRank = rankMap[statusType] || 0;

                if (newRank >= currentRank || statusType === 'failed') {
                  msg.queue_status = statusType as WhatsAppCampaignMessage['queue_status'];
                  if (statusType === 'sent') msg.sent_at = timestamp;
                  if (statusType === 'delivered') msg.delivered_at = timestamp;
                  if (statusType === 'read') msg.read_at = timestamp;
                  if (statusType === 'failed') {
                    msg.failed_at = timestamp;
                    msg.last_error = s.errors?.[0]?.message || 'Delivery failure from WhatsApp provider';
                  }
                  msg.updated_at = new Date().toISOString();
                  saveMessages(messages);

                  // Update campaign counters
                  const campaigns = loadCampaigns();
                  const c = campaigns.find(item => item.id === msg.campaign_id);
                  if (c) {
                    if (statusType === 'delivered') c.delivered_count = (c.delivered_count || 0) + 1;
                    if (statusType === 'read') c.read_count = (c.read_count || 0) + 1;
                    if (statusType === 'failed') c.failed_count = (c.failed_count || 0) + 1;
                    c.updated_at = new Date().toISOString();
                    saveCampaigns(campaigns);
                  }
                }
              }
            }
          }

          // 2. Process Inbound Messages (Check for STOP keyword to record opt-outs)
          const incomingMessages = value.messages || [];
          for (const inc of incomingMessages) {
            const senderPhone = inc.from;
            const textBody = inc.text?.body?.trim().toUpperCase();

            if (senderPhone && (textBody === 'STOP' || textBody === 'UNSUBSCRIBE' || textBody === 'CANCEL')) {
              await recordOptOut(pool, senderPhone, `Keyword ${textBody} received via WhatsApp`, 'inbound_message');
            }
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error processing WhatsApp webhook:', err);
      res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  return router;
};
