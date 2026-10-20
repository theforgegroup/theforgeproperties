import express from 'express';
import pg from 'pg';
import {
  getWebinarLeads,
  getWebinarStats,
  updateLeadStatus,
  updateLeadNotes,
  updateLeadPhone,
  seedWebinarLeads
} from '../services/webinarLeadsService';
import { WebinarCallStatus } from '../types';

export const createWebinarLeadsRouter = (pool: pg.Pool | null): express.Router => {
  const router = express.Router();

  // GET /api/admin/webinar-leads/stats
  router.get('/stats', async (_req, res) => {
    try {
      const stats = await getWebinarStats(pool);
      res.json(stats);
    } catch (err) {
      console.error('Failed to get webinar leads stats:', err);
      res.status(500).json({ error: 'Failed to retrieve stats' });
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
      console.error('Failed to get webinar leads:', err);
      res.status(500).json({ error: 'Failed to retrieve webinar leads' });
    }
  });

  // POST /api/admin/webinar-leads/seed (or /import)
  router.post('/seed', async (_req, res) => {
    try {
      const result = await seedWebinarLeads(pool);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('Failed to seed webinar leads:', err);
      res.status(500).json({ error: 'Failed to seed webinar leads' });
    }
  });

  router.post('/import', async (_req, res) => {
    try {
      const result = await seedWebinarLeads(pool);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('Failed to import webinar leads:', err);
      res.status(500).json({ error: 'Failed to import webinar leads' });
    }
  });

  // PUT /api/admin/webinar-leads/:id/status
  // Body: { "call_status": "" }
  router.put('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { call_status } = req.body;
      if (!call_status) {
        return res.status(400).json({ error: 'call_status is required in body' });
      }

      const updated = await updateLeadStatus(pool, id, call_status as WebinarCallStatus);
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
  // Body: { "call_notes": "" }
  router.put('/:id/notes', async (req, res) => {
    try {
      const { id } = req.params;
      const { call_notes } = req.body;
      if (call_notes === undefined) {
        return res.status(400).json({ error: 'call_notes is required in body' });
      }

      const updated = await updateLeadNotes(pool, id, String(call_notes || ''));
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
  // Body: { "whatsapp_number": "" }
  router.put('/:id/phone', async (req, res) => {
    try {
      const { id } = req.params;
      const { whatsapp_number } = req.body;
      if (!whatsapp_number) {
        return res.status(400).json({ error: 'whatsapp_number is required in body' });
      }

      const updated = await updateLeadPhone(pool, id, String(whatsapp_number));
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
