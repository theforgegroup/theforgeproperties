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

// Memory cache to avoid any disk latency or ephemeral container wipe
let memoryLeads: WebinarLead[] = [];

function loadLocalLeads(): WebinarLead[] {
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

function saveLocalLeads(leads: WebinarLead[]): void {
  memoryLeads = leads;
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

  // 1. Try Supabase first if accessible
  try {
    let query = supabase.from('webinar_leads').select('*');
    if (status && status !== 'All') {
      query = query.eq('call_status', status);
    }
    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`full_name.ilike.%${q}%,whatsapp_number.ilike.%${q}%,email.ilike.%${q}%`);
    }
    query = query.order('full_name', { ascending: true });

    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      // Map Supabase rows
      const supabaseLeads: WebinarLead[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as number | string,
        full_name: String(row.full_name || ''),
        whatsapp_number: String(row.whatsapp_number || ''),
        email: String(row.email || ''),
        call_status: (row.call_status as WebinarCallStatus) || 'Not Called',
        call_notes: (row.call_notes as string) || null,
        called_at: (row.called_at as string) || null,
        follow_up_date: (row.follow_up_date as string) || null,
        created_at: (row.created_at as string) || undefined,
        updated_at: (row.updated_at as string) || undefined
      }));

      // Fetch all for complete stats
      const { data: allSupabaseData } = await supabase.from('webinar_leads').select('call_status');
      const allStatuses = (allSupabaseData || []).map((r: { call_status?: string }) => ({
        call_status: (r.call_status as WebinarCallStatus) || 'Not Called'
      })) as WebinarLead[];

      const stats = computeWebinarStats(allStatuses.length > 0 ? allStatuses : supabaseLeads);
      saveLocalLeads(supabaseLeads);
      return { leads: supabaseLeads, stats };
    }
  } catch (supErr) {
    console.warn('Supabase webinar_leads read skipped or restricted by RLS:', supErr);
  }

  // 2. Try PostgreSQL pool if configured
  if (pool) {
    try {
      const statsRes = await pool.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE call_status = 'Not Called') AS not_called,
          COUNT(*) FILTER (WHERE call_status = 'Called — Registered') AS registered,
          COUNT(*) FILTER (WHERE call_status = 'Called — Needs Follow Up') AS needs_follow_up,
          COUNT(*) FILTER (WHERE call_status = 'Called — Call Back Requested') AS call_back_requested,
          COUNT(*) FILTER (WHERE call_status = 'Called — Not Interested') AS not_interested,
          COUNT(*) FILTER (WHERE call_status = 'Called — No Answer') AS no_answer,
          COUNT(*) FILTER (WHERE call_status = 'Called — Wrong Number') AS wrong_number
        FROM public.webinar_leads;
      `);

      const sRow = statsRes.rows[0] || {};
      const stats: WebinarLeadsStats = {
        total: parseInt(sRow.total || '0', 10),
        not_called: parseInt(sRow.not_called || '0', 10),
        registered: parseInt(sRow.registered || '0', 10),
        needs_follow_up: parseInt(sRow.needs_follow_up || '0', 10),
        call_back_requested: parseInt(sRow.call_back_requested || '0', 10),
        not_interested: parseInt(sRow.not_interested || '0', 10),
        no_answer: parseInt(sRow.no_answer || '0', 10),
        wrong_number: parseInt(sRow.wrong_number || '0', 10)
      };

      if (stats.total > 0) {
        let queryText = `
          SELECT
            id,
            full_name,
            whatsapp_number,
            email,
            call_status,
            call_notes,
            called_at,
            follow_up_date,
            created_at,
            updated_at
          FROM public.webinar_leads
        `;
        const queryParams: unknown[] = [];
        const whereClauses: string[] = [];

        if (status && status !== 'All') {
          queryParams.push(status);
          whereClauses.push(`call_status = $${queryParams.length}`);
        }

        if (search && search.trim()) {
          queryParams.push(search.trim());
          const paramIdx = queryParams.length;
          whereClauses.push(`(
            full_name ILIKE '%' || $${paramIdx} || '%'
            OR whatsapp_number ILIKE '%' || $${paramIdx} || '%'
            OR email ILIKE '%' || $${paramIdx} || '%'
          )`);
        }

        if (whereClauses.length > 0) {
          queryText += ` WHERE ` + whereClauses.join(' AND ');
        }

        queryText += ` ORDER BY full_name ASC;`;

        const result = await pool.query(queryText, queryParams);
        const leads: WebinarLead[] = result.rows.map(row => ({
          id: Number(row.id),
          full_name: row.full_name,
          whatsapp_number: row.whatsapp_number,
          email: row.email,
          call_status: row.call_status,
          call_notes: row.call_notes,
          called_at: row.called_at,
          follow_up_date: row.follow_up_date,
          created_at: row.created_at,
          updated_at: row.updated_at
        }));

        saveLocalLeads(leads);
        return { leads, stats };
      }
    } catch (pgErr) {
      console.warn('PostgreSQL query error, using local fallback:', pgErr);
    }
  }

  // 3. Fallback memory / file cache
  const allLeads = loadLocalLeads();
  const stats = computeWebinarStats(allLeads);

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
  newStatus: WebinarCallStatus
): Promise<WebinarLead | null> {
  const nowIso = new Date().toISOString();

  // Try updating in Supabase
  try {
    const updatePayload: Record<string, unknown> = {
      call_status: newStatus,
      updated_at: nowIso
    };
    if (newStatus !== 'Not Called') {
      updatePayload.called_at = nowIso;
    }
    await supabase.from('webinar_leads').update(updatePayload).eq('id', id);
  } catch (err) {
    console.warn('Supabase lead status update skipped:', err);
  }

  // Try updating in PostgreSQL
  if (pool) {
    try {
      await pool.query(`
        UPDATE public.webinar_leads
        SET
          call_status = $1,
          called_at = CASE
            WHEN $1 != 'Not Called'
            THEN NOW()
            ELSE called_at
          END,
          updated_at = NOW()
        WHERE id = $2;
      `, [newStatus, id]);
    } catch (err) {
      console.warn('PostgreSQL update status warning:', err);
    }
  }

  // Always update in memory / file cache
  const allLeads = loadLocalLeads();
  const idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    allLeads[idx].call_status = newStatus;
    if (newStatus !== 'Not Called') {
      allLeads[idx].called_at = nowIso;
    }
    allLeads[idx].updated_at = nowIso;
    saveLocalLeads(allLeads);
    return allLeads[idx];
  }

  // If not found in cache, construct one
  return {
    id,
    full_name: 'Webinar Lead',
    whatsapp_number: '',
    email: '',
    call_status: newStatus,
    call_notes: null,
    called_at: newStatus !== 'Not Called' ? nowIso : null,
    follow_up_date: null,
    updated_at: nowIso
  };
}

export async function updateLeadNotes(
  pool: pg.Pool | null,
  id: string | number,
  notes: string
): Promise<WebinarLead | null> {
  const nowIso = new Date().toISOString();

  // Try updating in Supabase
  try {
    await supabase.from('webinar_leads').update({
      call_notes: notes,
      updated_at: nowIso
    }).eq('id', id);
  } catch (err) {
    console.warn('Supabase lead notes update skipped:', err);
  }

  // Try updating in PostgreSQL
  if (pool) {
    try {
      await pool.query(`
        UPDATE public.webinar_leads
        SET
          call_notes = $1,
          updated_at = NOW()
        WHERE id = $2;
      `, [notes, id]);
    } catch (err) {
      console.warn('PostgreSQL update notes warning:', err);
    }
  }

  // Always update local memory / file
  const allLeads = loadLocalLeads();
  const idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    allLeads[idx].call_notes = notes;
    allLeads[idx].updated_at = nowIso;
    saveLocalLeads(allLeads);
    return allLeads[idx];
  }

  return null;
}

export async function updateLeadPhone(
  pool: pg.Pool | null,
  id: string | number,
  phone: string
): Promise<WebinarLead | null> {
  const nowIso = new Date().toISOString();

  // Try updating in Supabase
  try {
    await supabase.from('webinar_leads').update({
      whatsapp_number: phone,
      updated_at: nowIso
    }).eq('id', id);
  } catch (err) {
    console.warn('Supabase lead phone update skipped:', err);
  }

  // Try updating in PostgreSQL
  if (pool) {
    try {
      await pool.query(`
        UPDATE public.webinar_leads
        SET
          whatsapp_number = $1,
          updated_at = NOW()
        WHERE id = $2;
      `, [phone, id]);
    } catch (err) {
      console.warn('PostgreSQL update phone warning:', err);
    }
  }

  // Always update local memory / file
  const allLeads = loadLocalLeads();
  const idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    allLeads[idx].whatsapp_number = phone;
    allLeads[idx].updated_at = nowIso;
    saveLocalLeads(allLeads);
    return allLeads[idx];
  }

  return null;
}

export async function seedWebinarLeads(pool: pg.Pool | null): Promise<{ count: number; leads: WebinarLead[]; stats: WebinarLeadsStats }> {
  const defaultLeads = getDefaultWebinarLeads();

  // 1. Always ensure memory and file storage have all 97 leads
  saveLocalLeads(defaultLeads);

  // 2. Try inserting into Supabase if permitted
  try {
    const { data: existingRows } = await supabase.from('webinar_leads').select('id').limit(1);
    if (!existingRows || existingRows.length === 0) {
      // Prepare records for Supabase insert
      const rowsToInsert = defaultLeads.map(l => ({
        full_name: l.full_name,
        whatsapp_number: l.whatsapp_number,
        email: l.email,
        call_status: 'Not Called'
      }));

      // Insert in chunks of 50 to avoid size limits
      for (let i = 0; i < rowsToInsert.length; i += 50) {
        const chunk = rowsToInsert.slice(i, i + 50);
        await supabase.from('webinar_leads').insert(chunk);
      }
      console.log(`[Supabase Seed] Attempted inserting ${rowsToInsert.length} leads into Supabase.`);
    }
  } catch (supErr) {
    console.warn('Supabase batch insert skipped (e.g. table RLS or already populated):', supErr);
  }

  // 3. Try inserting into PostgreSQL if pool is available
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

        console.log(`[Postgres Seed SUCCESS] Inserted ${SEED_WEBINAR_LEADS.length} leads.`);
      }
    } catch (pgErr) {
      console.warn('PostgreSQL seed skipped:', pgErr);
    }
  }

  // Always return the complete seeded set reliably
  return {
    count: defaultLeads.length,
    leads: defaultLeads,
    stats: computeWebinarStats(defaultLeads)
  };
}
