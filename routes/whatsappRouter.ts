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
  recordWebhookEvent,
  reconcileUncertainMessage,
  reconcileWithWebhook
} from '../services/whatsappDatabase';
import { whatsappProvider, APPROVED_WHATSAPP_TEMPLATES } from '../services/whatsappProvider';
import { loadLocalLeads } from '../services/webinarLeadsService';
import { WebinarLead } from '../types';

export const createWhatsAppRouter = (pool: pg.Pool | null): express.Router => {
  const router = express.Router();

  // ---------------------------------------------------------------------------
  // CONTACTS & CONSENT ENDPOINTS
  // ---------------------------------------------------------------------------

  // GET /api/admin/whatsapp/contacts
  router.get('/contacts', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const search = req.query.search ? String(req.query.search).trim().toLowerCase() : '';
      const consentFilter = req.query.consent ? String(req.query.consent) : 'all';
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const limit = Math.min(100, Math.max(5, parseInt(String(req.query.limit || '25'), 10)));

      const allLeads = loadLocalLeads();

      const contactsWithStatus = await Promise.all(allLeads.map(async (lead: WebinarLead) => {
        const canonicalPhone = normalizePhone(lead.whatsapp_number);
        const isOptedOut = Boolean(lead.whatsapp_opt_out_at) || (await isPhoneOptedOut(canonicalPhone, pool));
        const isOptedIn = Boolean(lead.whatsapp_opt_in) && !isOptedOut;
        const validPhone = canonicalPhone.length >= 10;

        return {
          id: lead.id,
          full_name: lead.full_name,
          whatsapp_number: lead.whatsapp_number,
          email: lead.email,
          call_status: lead.call_status,
          whatsapp_opt_in: isOptedIn,
          whatsapp_opt_in_at: lead.whatsapp_opt_in_at || null,
          whatsapp_opt_in_source: lead.whatsapp_opt_in_source || null,
          whatsapp_opt_out_at: isOptedOut ? (lead.whatsapp_opt_out_at || lead.updated_at || new Date().toISOString()) : null,
          is_campaign_eligible: isOptedIn && validPhone
        };
      }));

      const filtered = contactsWithStatus.filter(c => {
        if (search) {
          const matchName = c.full_name?.toLowerCase().includes(search);
          const matchPhone = c.whatsapp_number?.toLowerCase().includes(search);
          const matchEmail = c.email?.toLowerCase().includes(search);
          if (!matchName && !matchPhone && !matchEmail) {
            return false;
          }
        }

        if (consentFilter === 'opted_in' && !c.whatsapp_opt_in) return false;
        if (consentFilter === 'pending_consent' && (c.whatsapp_opt_in || c.whatsapp_opt_out_at)) return false;
        if (consentFilter === 'opted_out' && !c.whatsapp_opt_out_at) return false;

        return true;
      });

      filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

      const totalCount = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      let totalEligible = 0;
      let totalPendingConsent = 0;
      let totalOptedOut = 0;

      contactsWithStatus.forEach(c => {
        if (c.whatsapp_opt_out_at) totalOptedOut++;
        else if (c.is_campaign_eligible) totalEligible++;
        else totalPendingConsent++;
      });

      res.json({
        contacts: paginated,
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
  // CAMPAIGNS ENDPOINTS (PostgreSQL / Supabase Authoritative)
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
        created_by: req.adminUser?.email || 'theforgeproperties@gmail.com'
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

      for (const l of selectedLeads) {
        const canonical = normalizePhone(l.whatsapp_number);
        const isOptedOut = Boolean(l.whatsapp_opt_out_at) || (await isPhoneOptedOut(canonical, pool));
        const isOptedIn = Boolean(l.whatsapp_opt_in) && !isOptedOut;

        if (isOptedOut) {
          excludedLeads.push({ id: l.id, name: l.full_name, reason: 'Recipient opted out of WhatsApp messages' });
        } else if (!isOptedIn) {
          excludedLeads.push({ id: l.id, name: l.full_name, reason: 'Recipient has not provided explicit marketing opt-in consent' });
        } else if (canonical.length < 10) {
          excludedLeads.push({ id: l.id, name: l.full_name, reason: 'Invalid phone number format (< 10 digits)' });
        } else {
          eligibleLeads.push(l);
        }
      }

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

      const eligibleRecipients = [];
      for (const l of targetLeads) {
        const canonical = normalizePhone(l.whatsapp_number);
        const isOptedOut = Boolean(l.whatsapp_opt_out_at) || (await isPhoneOptedOut(canonical, pool));
        const isOptedIn = Boolean(l.whatsapp_opt_in) && !isOptedOut;

        if (isOptedIn && canonical.length >= 10) {
          eligibleRecipients.push({
            lead_id: l.id,
            recipient_number: canonical,
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
          error: 'Zero eligible recipients found. Contacts must have explicit WhatsApp opt-in consent and valid phone numbers.'
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

      if (pool) {
        await pool.query(`
          UPDATE public.whatsapp_campaign_messages
          SET queue_status = 'cancelled',
              claim_token = NULL,
              claimed_at = NULL,
              claimed_by = NULL,
              lease_expires_at = NULL,
              updated_at = NOW()
          WHERE campaign_id = $1 AND queue_status IN ('pending', 'processing');
        `, [id]);
      }

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
      let retriedCount = 0;

      if (pool) {
        const result = await pool.query(`
          UPDATE public.whatsapp_campaign_messages
          SET queue_status = 'pending',
              attempt_count = 0,
              next_retry_at = NULL,
              last_error = NULL,
              claim_token = NULL,
              claimed_at = NULL,
              claimed_by = NULL,
              lease_expires_at = NULL,
              updated_at = NOW()
          WHERE campaign_id = $1 AND queue_status = 'failed'
          RETURNING id;
        `, [id]);
        retriedCount = result.rowCount || 0;
      }

      if (retriedCount > 0) {
        await updateCampaignStatus(pool, id, 'queued');
      }

      res.json({ success: true, retriedCount });
    } catch (err) {
      console.error('Error in retry failed:', err);
      res.status(500).json({ error: 'Failed to retry messages' });
    }
  });

  // ---------------------------------------------------------------------------
  // UNCERTAIN DELIVERY & MANUAL RECOVERY ENDPOINTS
  // ---------------------------------------------------------------------------

  // GET /api/admin/whatsapp/uncertain-messages
  router.get('/uncertain-messages', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
    try {
      if (pool) {
        const result = await pool.query(`
          SELECT * FROM public.whatsapp_campaign_messages
          WHERE queue_status = 'uncertain_delivery'
          ORDER BY updated_at DESC;
        `);
        res.json({ uncertainMessages: result.rows, count: result.rows.length });
        return;
      }
      res.json({ uncertainMessages: [], count: 0 });
    } catch (err) {
      console.error('Error fetching uncertain messages:', err);
      res.status(500).json({ error: 'Failed to fetch uncertain messages' });
    }
  });

  // POST /api/admin/whatsapp/messages/:id/reconcile
  // Body: { resolution: 'mark_as_sent' | 'requeue_for_send' | 'mark_as_failed', provider_message_id?: string, notes?: string }
  router.post('/messages/:id/reconcile', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { resolution, provider_message_id, notes } = req.body;

      if (!['mark_as_sent', 'requeue_for_send', 'mark_as_failed'].includes(resolution)) {
        res.status(400).json({
          error: 'Invalid resolution. Must be mark_as_sent, requeue_for_send, or mark_as_failed.'
        });
        return;
      }

      const success = await reconcileUncertainMessage(pool, id, resolution, provider_message_id, notes);
      if (!success) {
        res.status(404).json({ error: 'Message not found or not in uncertain_delivery state' });
        return;
      }

      res.json({ success: true, messageId: id, resolution });
    } catch (err) {
      console.error('Error reconciling message:', err);
      res.status(500).json({ error: 'Failed to reconcile message' });
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
      const campaign = await getCampaignById(pool, id);
      res.json({ messages, campaign });
    } catch (err) {
      console.error('Error in GET messages:', err);
      res.status(500).json({ error: 'Failed to fetch campaign messages' });
    }
  });

  // GET /api/admin/whatsapp/stats
  router.get('/stats', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const stats = await getWhatsAppStats(pool);
      const coexistence = whatsappProvider.getCoexistenceStatus();
      res.json({ stats, coexistence });
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
// WEBHOOKS ROUTER (Public with HMAC-SHA256 verification)
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

      if (!whatsappProvider.verifyWebhookSignature(rawBody, signature)) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }

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
            const statusType = s.status as 'sent' | 'delivered' | 'read' | 'failed';
            const recipientPhone = s.recipient_id;

            if (providerMsgId) {
              const isNew = await recordWebhookEvent(pool, `status_${providerMsgId}_${statusType}`, 'status_update', s);
              if (!isNew) continue; // Idempotent deduplication

              // Reconcile uncertain or processing messages directly in database
              await reconcileWithWebhook(pool, providerMsgId, recipientPhone, statusType);
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
