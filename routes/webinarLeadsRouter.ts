import express from 'express';
import pg from 'pg';
import {
  getWebinarLeads,
  getWebinarStats,
  updateLeadStatus,
  updateLeadNotes,
  updateLeadPhone,
  seedWebinarLeads,
  syncWebinarLeads
} from '../services/webinarLeadsService';
import { getDefaultWebinarLeads, computeWebinarStats } from '../services/defaultWebinarLeads';
import { WebinarCallStatus } from '../types';

export const createWebinarLeadsRouter = (pool: pg.Pool | null): express.Router => {
  const router = express.Router();

  // GET /api/admin/webinar-leads/stats
  router.get('/stats', async (_req, res) => {
    try {
      const stats = await getWebinarStats(pool);
      res.json(stats);
    } catch (err) {
      console.error('Failed to get webinar leads stats, using fallback:', err);
      const defaults = getDefaultWebinarLeads();
      res.json(computeWebinarStats(defaults));
    }
  });

  // GET /api/admin/webinar-leads
  // ?status= (optional filter), ?search= (optional search)
  router.get('/', async (req, res) => {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const result = await getWebinarLeads(pool, { status, search });
      res.json(result);
    } catch (err) {
      console.error('Failed to get webinar leads, using fallback:', err);
      const defaults = getDefaultWebinarLeads();
      res.json({ leads: defaults, stats: computeWebinarStats(defaults) });
    }
  });

  // POST /api/admin/webinar-leads/sync or PUT /api/admin/webinar-leads/bulk
  // Body: { "leads": [...] }
  router.post('/sync', async (req, res) => {
    try {
      const incomingLeads = req.body.leads || [];
      const result = await syncWebinarLeads(pool, incomingLeads);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('Failed to sync webinar leads:', err);
      res.status(500).json({ error: 'Failed to sync webinar leads' });
    }
  });

  router.put('/bulk', async (req, res) => {
    try {
      const incomingLeads = req.body.leads || [];
      const result = await syncWebinarLeads(pool, incomingLeads);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('Failed to bulk update webinar leads:', err);
      res.status(500).json({ error: 'Failed to bulk update webinar leads' });
    }
  });

  // POST /api/admin/webinar-leads/seed (or /import)
  router.post('/seed', async (_req, res) => {
    try {
      const result = await seedWebinarLeads(pool);
      res.json({ success: true, ...result });
    } catch (err) {
      console.warn('Seed exception recovered with default dataset:', err);
      const fallback = getDefaultWebinarLeads();
      res.json({
        success: true,
        count: fallback.length,
        leads: fallback,
        stats: computeWebinarStats(fallback)
      });
    }
  });

  router.post('/import', async (_req, res) => {
    try {
      const result = await seedWebinarLeads(pool);
      res.json({ success: true, ...result });
    } catch (err) {
      console.warn('Import exception recovered with default dataset:', err);
      const fallback = getDefaultWebinarLeads();
      res.json({
        success: true,
        count: fallback.length,
        leads: fallback,
        stats: computeWebinarStats(fallback)
      });
    }
  });

  // PUT /api/admin/webinar-leads/:id/status
  // Body: { "call_status": "", "full_name": "" }
  router.put('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { call_status, full_name } = req.body;
      if (!call_status) {
        return res.status(400).json({ error: 'call_status is required in body' });
      }

      const updated = await updateLeadStatus(pool, id, call_status as WebinarCallStatus, full_name);
      if (!updated) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(updated);
    } catch (err) {
      console.error('Failed to update lead status:', err);
      res.status(500).json({ error: 'Failed to update lead status' });
    }
  });

  // PUT /api/admin/webinar-leads/:id/notes
  // Body: { "call_notes": "", "full_name": "" }
  router.put('/:id/notes', async (req, res) => {
    try {
      const { id } = req.params;
      const { call_notes, full_name } = req.body;
      if (call_notes === undefined) {
        return res.status(400).json({ error: 'call_notes is required in body' });
      }

      const updated = await updateLeadNotes(pool, id, String(call_notes || ''), full_name);
      if (!updated) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(updated);
    } catch (err) {
      console.error('Failed to update lead notes:', err);
      res.status(500).json({ error: 'Failed to update lead notes' });
    }
  });

  // PUT /api/admin/webinar-leads/:id/phone
  // Body: { "whatsapp_number": "", "full_name": "" }
  router.put('/:id/phone', async (req, res) => {
    try {
      const { id } = req.params;
      const { whatsapp_number, full_name } = req.body;
      if (!whatsapp_number) {
        return res.status(400).json({ error: 'whatsapp_number is required in body' });
      }

      const updated = await updateLeadPhone(pool, id, String(whatsapp_number), full_name);
      if (!updated) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(updated);
    } catch (err) {
      console.error('Failed to update lead phone:', err);
      res.status(500).json({ error: 'Failed to update lead phone' });
    }
  });

  return router;
};
