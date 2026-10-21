import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { WebinarLead, WebinarLeadsStats, WebinarCallStatus } from '../types';
import { getDefaultWebinarLeads, computeWebinarStats, SEED_WEBINAR_LEADS } from './defaultWebinarLeads';

export { SEED_WEBINAR_LEADS };

const supabaseUrl = 'https://amoqzkmzoclsyhuigazo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb3F6a216b2Nsc3lodWlnYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxNjUsImV4cCI6MjA4MDYzMjE2NX0.OMocRVGkcm8V0yslfSXUIvx9mMIQ3KLN6_1SGANB3E8';
const supabase = createClient(supabaseUrl, supabaseKey);

const LOCAL_STORAGE_FILE = path.join(process.cwd(), 'config', 'webinar_leads.json');

// Memory cache to avoid disk latency
let memoryLeads: WebinarLead[] = [];

export function loadLocalLeads(): WebinarLead[] {
  if (memoryLeads.length > 0) {
    return memoryLeads;
  }
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryLeads = parsed;
        return memoryLeads;
      }
    }
  } catch (err) {
    console.error('Failed to read webinar_leads.json:', err);
  }

  const defaults = getDefaultWebinarLeads();
  saveLocalLeads(defaults);
  return defaults;
}

export function saveLocalLeads(leads: WebinarLead[]): void {
  memoryLeads = [...leads];
  try {
    const parentDir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save webinar_leads.json to disk:', err);
  }
}

export function computeStatsFromLeads(leads: WebinarLead[]): WebinarLeadsStats {
  return computeWebinarStats(leads);
}

export async function initWebinarLeadsTable(pool: pg.Pool | null): Promise<void> {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.webinar_leads (
          id BIGSERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          whatsapp_number TEXT,
          email TEXT,
          call_status TEXT NOT NULL DEFAULT 'Not Called',
          call_notes TEXT,
          called_at TIMESTAMPTZ,
          follow_up_date DATE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_webinar_leads_status ON public.webinar_leads(call_status);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_webinar_leads_name ON public.webinar_leads(full_name);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_webinar_leads_follow_up_date ON public.webinar_leads(follow_up_date);
      `);

      await client.query(`
        CREATE OR REPLACE FUNCTION update_webinar_leads_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await client.query(`
        DROP TRIGGER IF EXISTS trigger_webinar_leads_updated_at ON public.webinar_leads;
        CREATE TRIGGER trigger_webinar_leads_updated_at
        BEFORE UPDATE ON public.webinar_leads
        FOR EACH ROW
        EXECUTE FUNCTION update_webinar_leads_updated_at();
      `);

      console.log('[PostgreSQL Migration SUCCESS] webinar_leads table, indexes, and trigger initialized.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[PostgreSQL Migration WARNING] webinar_leads setup warning:', err);
  }
}

export async function getWebinarLeads(
  pool: pg.Pool | null,
  options?: { status?: string; search?: string }
): Promise<{ leads: WebinarLead[]; stats: WebinarLeadsStats }> {
  const { status, search } = options || {};

  // 1. Always load current local leads
  const allLeads = loadLocalLeads();

  // 2. Try Supabase merge (without overwriting user's non-default status changes)
  try {
    const { data: supaData, error: supaErr } = await supabase.from('webinar_leads').select('*');
    if (!supaErr && Array.isArray(supaData) && supaData.length > 0) {
      const localMap = new Map<string, WebinarLead>();
      allLeads.forEach(l => localMap.set(l.full_name.trim().toLowerCase(), l));

      let hasNewData = false;
      supaData.forEach((row: Record<string, unknown>) => {
        const name = String(row.full_name || '').trim().toLowerCase();
        const existing = localMap.get(name);
        if (existing) {
          // If remote has a changed status and local was 'Not Called', adopt remote
          if (row.call_status && row.call_status !== 'Not Called' && existing.call_status === 'Not Called') {
            existing.call_status = row.call_status as WebinarCallStatus;
            hasNewData = true;
          }
          if (row.call_notes && !existing.call_notes) {
            existing.call_notes = String(row.call_notes);
            hasNewData = true;
          }
          if (row.called_at && !existing.called_at) {
            existing.called_at = String(row.called_at);
            hasNewData = true;
          }
          if (row.id) {
            existing.id = row.id as number | string;
          }
        }
      });

      if (hasNewData) {
        saveLocalLeads(allLeads);
      }
    }
  } catch {
    // Supabase RLS or offline notice - safe to ignore
  }

  // 3. PostgreSQL pool merge if available
  if (pool) {
    try {
      const result = await pool.query(`SELECT * FROM public.webinar_leads;`);
      if (result.rows && result.rows.length > 0) {
        const localMap = new Map<string, WebinarLead>();
        allLeads.forEach(l => localMap.set(l.full_name.trim().toLowerCase(), l));

        let hasNewData = false;
        result.rows.forEach(row => {
          const name = String(row.full_name || '').trim().toLowerCase();
          const existing = localMap.get(name);
          if (existing) {
            if (row.call_status && row.call_status !== 'Not Called' && existing.call_status === 'Not Called') {
              existing.call_status = row.call_status;
              hasNewData = true;
            }
            if (row.call_notes && !existing.call_notes) {
              existing.call_notes = row.call_notes;
              hasNewData = true;
            }
            if (row.called_at && !existing.called_at) {
              existing.called_at = row.called_at;
              hasNewData = true;
            }
          }
        });

        if (hasNewData) {
          saveLocalLeads(allLeads);
        }
      }
    } catch {
      // PG query skipped
    }
  }

  // Compute full stats across all items
  const stats = computeWebinarStats(allLeads);

  // Apply status and search filters on return only (NEVER overwrite disk with filtered list!)
  let filtered = [...allLeads];
  if (status && status !== 'All') {
    filtered = filtered.filter(l => l.call_status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(l => 
      (l.full_name && l.full_name.toLowerCase().includes(q)) ||
      (l.whatsapp_number && l.whatsapp_number.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
  return { leads: filtered, stats };
}

export async function getWebinarStats(pool: pg.Pool | null): Promise<WebinarLeadsStats> {
  const res = await getWebinarLeads(pool);
  return res.stats;
}

export async function updateLeadStatus(
  pool: pg.Pool | null,
  id: string | number,
  newStatus: WebinarCallStatus,
  leadNameHint?: string
): Promise<WebinarLead | null> {
  const nowIso = new Date().toISOString();
  const allLeads = loadLocalLeads();

  // Find by ID or by full_name
  let idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx === -1 && leadNameHint) {
    const hint = leadNameHint.trim().toLowerCase();
    idx = allLeads.findIndex(l => l.full_name.trim().toLowerCase() === hint);
  }

  if (idx !== -1) {
    allLeads[idx].call_status = newStatus;
    if (newStatus !== 'Not Called') {
      allLeads[idx].called_at = nowIso;
    }
    allLeads[idx].updated_at = nowIso;
    saveLocalLeads(allLeads);

    const updatedLead = allLeads[idx];

    // Background Supabase update
    try {
      const payload: Record<string, unknown> = {
        call_status: newStatus,
        updated_at: nowIso
      };
      if (newStatus !== 'Not Called') {
        payload.called_at = nowIso;
      }
      if (!isNaN(Number(id))) {
        supabase.from('webinar_leads').update(payload).eq('id', Number(id)).then();
      }
      if (updatedLead.full_name) {
        supabase.from('webinar_leads').update(payload).eq('full_name', updatedLead.full_name).then();
      }
    } catch {
      // Supabase ignore
    }

    // Background PostgreSQL update
    if (pool) {
      try {
        pool.query(`
          UPDATE public.webinar_leads
          SET
            call_status = $1,
            called_at = CASE WHEN $1 != 'Not Called' THEN NOW() ELSE called_at END,
            updated_at = NOW()
          WHERE id = $2 OR full_name = $3;
        `, [newStatus, isNaN(Number(id)) ? 0 : Number(id), updatedLead.full_name]).catch(() => {});
      } catch {
        // PG ignore
      }
    }

    return updatedLead;
  }

  // Construct fallback if missing
  const constructed: WebinarLead = {
    id,
    full_name: leadNameHint || 'Webinar Lead',
    whatsapp_number: '',
    email: '',
    call_status: newStatus,
    call_notes: null,
    called_at: newStatus !== 'Not Called' ? nowIso : null,
    follow_up_date: null,
    updated_at: nowIso
  };
  allLeads.push(constructed);
  saveLocalLeads(allLeads);
  return constructed;
}

export async function updateLeadNotes(
  pool: pg.Pool | null,
  id: string | number,
  notes: string,
  leadNameHint?: string
): Promise<WebinarLead | null> {
  const nowIso = new Date().toISOString();
  const allLeads = loadLocalLeads();

  let idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx === -1 && leadNameHint) {
    const hint = leadNameHint.trim().toLowerCase();
    idx = allLeads.findIndex(l => l.full_name.trim().toLowerCase() === hint);
  }

  if (idx !== -1) {
    allLeads[idx].call_notes = notes;
    allLeads[idx].updated_at = nowIso;
    saveLocalLeads(allLeads);

    const updatedLead = allLeads[idx];

    // Background Supabase update
    try {
      if (!isNaN(Number(id))) {
        supabase.from('webinar_leads').update({ call_notes: notes, updated_at: nowIso }).eq('id', Number(id)).then();
      }
      if (updatedLead.full_name) {
        supabase.from('webinar_leads').update({ call_notes: notes, updated_at: nowIso }).eq('full_name', updatedLead.full_name).then();
      }
    } catch (err) {
      console.warn('Supabase notes update skipped:', err);
    }

    // Background PG update
    if (pool) {
      try {
        pool.query(`
          UPDATE public.webinar_leads
          SET call_notes = $1, updated_at = NOW()
          WHERE id = $2 OR full_name = $3;
        `, [notes, isNaN(Number(id)) ? 0 : Number(id), updatedLead.full_name]).catch(() => {});
      } catch (err) {
        console.warn('PG notes update skipped:', err);
      }
    }

    return updatedLead;
  }

  return null;
}

export async function updateLeadPhone(
  pool: pg.Pool | null,
  id: string | number,
  phone: string,
  leadNameHint?: string
): Promise<WebinarLead | null> {
  const nowIso = new Date().toISOString();
  const allLeads = loadLocalLeads();

  let idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx === -1 && leadNameHint) {
    const hint = leadNameHint.trim().toLowerCase();
    idx = allLeads.findIndex(l => l.full_name.trim().toLowerCase() === hint);
  }

  if (idx !== -1) {
    allLeads[idx].whatsapp_number = phone;
    allLeads[idx].updated_at = nowIso;
    saveLocalLeads(allLeads);

    const updatedLead = allLeads[idx];

    try {
      if (!isNaN(Number(id))) {
        supabase.from('webinar_leads').update({ whatsapp_number: phone, updated_at: nowIso }).eq('id', Number(id)).then();
      }
      if (updatedLead.full_name) {
        supabase.from('webinar_leads').update({ whatsapp_number: phone, updated_at: nowIso }).eq('full_name', updatedLead.full_name).then();
      }
    } catch (err) {
      console.warn('Supabase phone update skipped:', err);
    }

    if (pool) {
      try {
        pool.query(`
          UPDATE public.webinar_leads
          SET whatsapp_number = $1, updated_at = NOW()
          WHERE id = $2 OR full_name = $3;
        `, [phone, isNaN(Number(id)) ? 0 : Number(id), updatedLead.full_name]).catch(() => {});
      } catch (err) {
        console.warn('PG phone update skipped:', err);
      }
    }

    return updatedLead;
  }

  return null;
}

export async function syncWebinarLeads(
  pool: pg.Pool | null,
  incomingLeads: WebinarLead[]
): Promise<{ count: number; leads: WebinarLead[]; stats: WebinarLeadsStats }> {
  if (!Array.isArray(incomingLeads) || incomingLeads.length === 0) {
    const current = loadLocalLeads();
    return { count: current.length, leads: current, stats: computeWebinarStats(current) };
  }

  const existingLeads = loadLocalLeads();
  const leadMapById = new Map<string, WebinarLead>();
  const leadMapByName = new Map<string, WebinarLead>();

  existingLeads.forEach(l => {
    leadMapById.set(String(l.id), l);
    leadMapByName.set(l.full_name.trim().toLowerCase(), l);
  });

  for (const incoming of incomingLeads) {
    const keyId = String(incoming.id);
    const keyName = (incoming.full_name || '').trim().toLowerCase();
    const existing = leadMapById.get(keyId) || leadMapByName.get(keyName);

    if (existing) {
      if (incoming.call_status) existing.call_status = incoming.call_status;
      if (incoming.call_notes !== undefined) existing.call_notes = incoming.call_notes;
      if (incoming.called_at) existing.called_at = incoming.called_at;
      if (incoming.whatsapp_number) existing.whatsapp_number = incoming.whatsapp_number;
      if (incoming.email) existing.email = incoming.email;
      if (incoming.follow_up_date !== undefined) existing.follow_up_date = incoming.follow_up_date;
      existing.updated_at = incoming.updated_at || new Date().toISOString();
    } else {
      existingLeads.push(incoming);
      leadMapById.set(keyId, incoming);
      leadMapByName.set(keyName, incoming);
    }
  }

  saveLocalLeads(existingLeads);

  // Background mirror to Supabase
  try {
    for (const l of incomingLeads) {
      if (l.call_status && l.call_status !== 'Not Called') {
        const payload = {
          call_status: l.call_status,
          call_notes: l.call_notes || null,
          called_at: l.called_at || null,
          updated_at: l.updated_at || new Date().toISOString()
        };
        if (!isNaN(Number(l.id))) {
          supabase.from('webinar_leads').update(payload).eq('id', Number(l.id)).then();
        }
        if (l.full_name) {
          supabase.from('webinar_leads').update(payload).eq('full_name', l.full_name).then();
        }
      }
    }
  } catch {
    // Supabase background sync notice
  }

  const stats = computeWebinarStats(existingLeads);
  return { count: existingLeads.length, leads: existingLeads, stats };
}

export async function seedWebinarLeads(pool: pg.Pool | null): Promise<{ count: number; leads: WebinarLead[]; stats: WebinarLeadsStats }> {
  const currentLeads = loadLocalLeads();

  // CRITICAL: If leads already exist and any lead has been called or has notes, PRESERVE them!
  const hasUserActivity = currentLeads.some(l => l.call_status !== 'Not Called' || !!l.call_notes);
  if (currentLeads.length >= 95 && hasUserActivity) {
    return {
      count: currentLeads.length,
      leads: currentLeads,
      stats: computeWebinarStats(currentLeads)
    };
  }

  // Initialize or fill in default leads
  const defaultLeads = getDefaultWebinarLeads();
  saveLocalLeads(defaultLeads);

  // Background attempt to populate Supabase if empty
  try {
    const { data: existingRows } = await supabase.from('webinar_leads').select('id').limit(1);
    if (!existingRows || existingRows.length === 0) {
      const rowsToInsert = defaultLeads.map(l => ({
        full_name: l.full_name,
        whatsapp_number: l.whatsapp_number,
        email: l.email,
        call_status: 'Not Called'
      }));

      for (let i = 0; i < rowsToInsert.length; i += 50) {
        const chunk = rowsToInsert.slice(i, i + 50);
        await supabase.from('webinar_leads').insert(chunk);
      }
    }
  } catch (err) {
    console.warn('Supabase seed notice:', err);
  }

  // PostgreSQL seed if available
  if (pool) {
    try {
      const countCheck = await pool.query('SELECT COUNT(*) FROM public.webinar_leads;');
      const currentCount = parseInt(countCheck.rows[0]?.count || '0', 10);
      if (currentCount === 0) {
        const valuesArr: unknown[] = [];
        const placeholders: string[] = [];

        SEED_WEBINAR_LEADS.forEach((lead, i) => {
          const offset = i * 3;
          placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
          valuesArr.push(lead.full_name, lead.whatsapp_number, lead.email);
        });

        await pool.query(`
          INSERT INTO public.webinar_leads (full_name, whatsapp_number, email)
          VALUES ${placeholders.join(', ')};
        `, valuesArr);
      }
    } catch (err) {
      console.warn('PG seed notice:', err);
    }
  }

  return {
    count: defaultLeads.length,
    leads: defaultLeads,
    stats: computeWebinarStats(defaultLeads)
  };
}
