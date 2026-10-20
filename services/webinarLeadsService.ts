import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { WebinarLead, WebinarLeadsStats, WebinarCallStatus } from '../types';

export const SEED_WEBINAR_LEADS: Array<{ full_name: string; whatsapp_number: string; email: string }> = [
  { full_name: 'Abubakar Jafaru', whatsapp_number: '+2348033018708', email: 'jafaruabubakar027@gmail.com' },
  { full_name: 'Abubakar Lami', whatsapp_number: '+2348034546198', email: 'leaabubakar19@gmail.com' },
  { full_name: 'Abubakar Olanrewaju', whatsapp_number: '+2349127271407', email: 'olanrewajuabubaka@gmail.com' },
  { full_name: 'Abraham Oluwatimilehin Olorunda', whatsapp_number: '+18037232324', email: 'paudemic@gmail.com' },
  { full_name: 'Abosede Adijat Adekunle', whatsapp_number: '+2348080710105', email: 'abosedekunle@gmail.com' },
  { full_name: 'Abdullahi Balogun', whatsapp_number: '+2348169462229', email: 'abdullahikola@5gmail.com' },
  { full_name: 'Adeleke Jamiu Adewale', whatsapp_number: '+2348031349844', email: 'jamiuadeleke08@gmail.com' },
  { full_name: 'Adunni Adey Bello Adekunle Adegbenga', whatsapp_number: '+2347057933510', email: 'belloadekunle60@gmail.com' },
  { full_name: 'Afeni Owolabi', whatsapp_number: '+2348088884894', email: 'timileyinowolabi29@gmail.com' },
  { full_name: 'Akeem Adebayo', whatsapp_number: '+2347088881270', email: 'akeem4530@gmail.com' },
  { full_name: 'Akeem Animashaun Olamilekan', whatsapp_number: '+2348025657454', email: 'animashaunakeem24@gmail.com' },
  { full_name: 'Akinola Iyabo Sarah', whatsapp_number: '+2347065525745', email: 'amokemorenikejiakinola@gmail.com' },
  { full_name: 'Akinyemi Oluwole Abidakun', whatsapp_number: '+2347063268226', email: 'akinyemiabidakun@gmail.com' },
  { full_name: 'Alex Felicia', whatsapp_number: '+2348166245910', email: 'alexfelicia980@gmail.com' },
  { full_name: 'Alfa Jamiu Al Ilory', whatsapp_number: '+2348135824347', email: 'abdulganiyujamiyuakorede@gmail.com' },
  { full_name: 'Ali Reuben Uchenna', whatsapp_number: '+2348034048840', email: 'reubenali65@gmail.com' },
  { full_name: 'Anisulowo Oladele Joseph', whatsapp_number: '+2347030230935', email: 'anisulowobamidele827@gmail.com' },
  { full_name: 'Atinuke Fausat Odunowo', whatsapp_number: '+2347039138317', email: 'atinukefaosatodunowo@gmail.com' },
  { full_name: 'Augustine Agbator', whatsapp_number: '+18064735290', email: 'agbatoraugustine25@gmail.com' },
  { full_name: 'Ayangbola Michael', whatsapp_number: '+2348050221481', email: 'ayangbolamichaelgbenga@gmail.com' },
  { full_name: 'Balikis Ganiyu', whatsapp_number: '+2348163548017', email: 'balikisganiou@gmail.com' },
  { full_name: 'Bless Joe', whatsapp_number: '+2348148883084', email: 'jossycool74@gmail.com' },
  { full_name: 'Boniface Okechukwu Boniface Agu', whatsapp_number: '+2347039492410', email: 'udeewoagu@gmail.com' },
  { full_name: 'Caroline Orieyineka David', whatsapp_number: '+2348085600398', email: 'carolinedavid561@gmail.com' },
  { full_name: 'Chiamaka Florence Ogunjiofor', whatsapp_number: '+2348167771962', email: 'ogunjioforchiamaka147@gmail.com' },
  { full_name: 'Dauda Ahmad', whatsapp_number: '+2348032670069', email: 'ahamaddauda489@gmail.com' },
  { full_name: 'Dele Telejaye', whatsapp_number: '+17018123575', email: 'deletelejaye@gmail.com' },
  { full_name: 'Dotun Daniyan', whatsapp_number: '+2347069593062', email: 'daniyandotun7@gmail.com' },
  { full_name: 'Ebenezer Gbenga', whatsapp_number: '+2348064196518', email: 'ebenezergbengajessie@gmail.com' },
  { full_name: 'Emeagi Chinyere', whatsapp_number: '+2348068145968', email: 'chinyereebelechukwu1@gmail.com' },
  { full_name: 'Emmanuel', whatsapp_number: '+2347069193367', email: 'nueldare01@gmail.com' },
  { full_name: 'Emmasa Ola Emmanuel', whatsapp_number: '+17062657274', email: 'emmanuelemmasa4@gmail.com' },
  { full_name: 'Falowo Serah', whatsapp_number: '+2348166715869', email: 'serahfalowo1@gmail.com' },
  { full_name: 'Felix Nwokedi', whatsapp_number: '+2348033432775', email: 'nwokedif22@gmail.com' },
  { full_name: 'Folake Awojobi', whatsapp_number: '+2348137242059', email: 'folakemiawojobi930@gmail.com' },
  { full_name: 'Folashade Lawal', whatsapp_number: '+2348064635318', email: 'folasadelawal16@gmail.com' },
  { full_name: 'Francis Monye', whatsapp_number: '+2348038271998', email: 'francismonye40@gmail.com' },
  { full_name: 'Gladys Akinmurele Hafsat Musa', whatsapp_number: '+2348032624755', email: 'hafsat.musa93@gmail.com' },
  { full_name: 'Godgifte Awori Okpahe', whatsapp_number: '+2347040191957', email: 'godgiftawori1@gmail.com' },
  { full_name: 'Henry Ndubuisi Okolie', whatsapp_number: '+2348033422200', email: 'henryndubuisiokolie@gmail2026.com' },
  { full_name: 'Ifeco Holdings', whatsapp_number: '+2347039968498', email: 'ifeco4g@gmail.com' },
  { full_name: 'Ismaila Danladi', whatsapp_number: '+2348152054042', email: 'ismailadanladi03@gmail.com' },
  { full_name: 'Janet Jackson', whatsapp_number: '+2348057031726', email: 'adekunlegbadebo@gmail.com' },
  { full_name: 'Jidonu Elidja', whatsapp_number: '+2347051164377', email: 'jidonuelijah326@gmail.com' },
  { full_name: 'John Agbedo', whatsapp_number: '+2349036952609', email: 'johnagbedo1@gmail.com' },
  { full_name: 'Joseph Ogunleye', whatsapp_number: '+2348056712210', email: 'Olukayodejoseph07@gmail.com' },
  { full_name: 'Joseph Umoren', whatsapp_number: '+2348064734157', email: 'jumoren80@gmail.com' },
  { full_name: 'Kabiru Abdulganiyu', whatsapp_number: '+2348037262272', email: 'kabiruabdulganiyu205@gmail.com' },
  { full_name: 'Kabiru Titilope', whatsapp_number: '+2347055197742', email: 'camara_tmoney@yahoo.com' },
  { full_name: 'Kareemot Oloyede', whatsapp_number: '+2348027272696', email: 'karimotoloyede65@gmail.com' },
  { full_name: 'Kayode Ayinde', whatsapp_number: '+2348062070108', email: 'christopherayinde66@gmail.com' },
  { full_name: 'Kenechukwu Jude', whatsapp_number: '+2348060658089', email: 'bessedkc@gmail.com' },
  { full_name: 'Kike Lameed', whatsapp_number: '+2348027170871', email: 'kikelameed4@gmail.com' },
  { full_name: 'Komolafe Henry', whatsapp_number: '+2347032435727', email: 'komolafehenry1234@gmail.com' },
  { full_name: 'Kuju Solomon Yemayinse', whatsapp_number: '+2349034190105', email: 'kujusolomon71@gmail.com' },
  { full_name: 'Lawal Itopa Ismaila', whatsapp_number: '+2348167406599', email: 'lawalismaila475@gm.com' },
  { full_name: 'Lawal Saliu', whatsapp_number: '+2347033051803', email: 'saliulawal01@gmail.com' },
  { full_name: 'Mohamed Bashir', whatsapp_number: '+2348066268873', email: 'Ummeebashir2016@gmail.com' },
  { full_name: 'Modina Bola Sulaiman', whatsapp_number: '+2349038330094', email: 'sulaimonbola@gmail.com' },
  { full_name: 'Muhammad Haliru Bunza', whatsapp_number: '+2347034770747', email: 'mhalirubunza@gmail.com' },
  { full_name: 'Muhammadu Aliyurijau', whatsapp_number: '+2348163509203', email: 'muhammadualiyu066@gmail.com' },
  { full_name: 'Musibau Adekola', whatsapp_number: '+2348063222828', email: 'musbau@gmail.com' },
  { full_name: 'Mutiu Waheed', whatsapp_number: '+2347037737190', email: 'mutiuwaheed620@gmail.com' },
  { full_name: 'Ngozi Omega', whatsapp_number: '+2347064533500', email: 'ikenyib95@gmail.com' },
  { full_name: 'Ngozi Victor', whatsapp_number: '+2348060878473', email: 'ngozivictor108@gmail.com' },
  { full_name: 'Ogunjimi Olapeju Ojelabi', whatsapp_number: '+2348139176447', email: 'ceciliaolapejuojelabi@gmail.com' },
  { full_name: 'Olajide Ayodele', whatsapp_number: '+2349052087016', email: 'olajideayodele2000@gmail.com' },
  { full_name: 'Oladele Daniel', whatsapp_number: '+18152148977', email: 'damideleoladele@gmail.com' },
  { full_name: 'Olawale Joseph', whatsapp_number: '+2348053582889', email: 'josepholawalegoal@gmail.com' },
  { full_name: 'Olurounke Mary', whatsapp_number: '+2347047107962', email: 'maryolurounke@gmail.com' },
  { full_name: 'Oluwatoyin Matthew', whatsapp_number: '+2347032614540', email: 'toyinmatts85@gmail.com' },
  { full_name: 'Omoboriowo Damilola', whatsapp_number: '+2347054935208', email: 'boriowo.dami@gmail.com' },
  { full_name: 'Ossy', whatsapp_number: '+2348025985966', email: 'amadiossychukdz@gmail.com' },
  { full_name: 'Oyelami Mathew', whatsapp_number: '+2347057563385', email: 'oyelamiolabunmi@gmail.com' },
  { full_name: 'Peter Sumaila', whatsapp_number: '+2349065408166', email: 'petersumaila499@gmail.com' },
  { full_name: 'Rachel Adeyemo', whatsapp_number: '+2347062661148', email: 'radeyemo19@gmail.com' },
  { full_name: 'Razaq Bisiriyu', whatsapp_number: '+2348028288383', email: 'farmersgains@gmail.com' },
  { full_name: 'Samuel Enogun', whatsapp_number: '+2347082791824', email: 'enogunsamuel@gmail.com' },
  { full_name: 'Samuel Oladele Aleibah', whatsapp_number: '+2349022992946', email: 'samueloladelealeiba9@gmail.com' },
  { full_name: 'Samuel Samuel', whatsapp_number: '+2347035050638', email: 'samuelobasi099@gmail.com' },
  { full_name: 'Samuel Teidinyo', whatsapp_number: '+17039517495', email: 'teidinyosamuel@gmail.com' },
  { full_name: 'Shittu Fatimoh', whatsapp_number: '+2348084930747', email: 'shittufatimoh295@gmail.com' },
  { full_name: 'Suleiman Abubakar Bio', whatsapp_number: '+2348058752221', email: 'suleimanabubakarbio@gmail.com' },
  { full_name: 'Taiwo Adepoju', whatsapp_number: '+2347072069652', email: 'adepojutaiwogabreal@gmail.com' },
  { full_name: 'Taiwo Aje', whatsapp_number: '+2348167205688', email: 'taiwoaje386@gmail.com' },
  { full_name: 'Tajudeen Adesoye', whatsapp_number: '+2348032491631', email: 'adesoyetajudeen32@gmail.com' },
  { full_name: 'Taofeek Adesina Iseotan', whatsapp_number: '+2348025919567', email: 'iseotanadeshina27@gmail.com' },
  { full_name: 'Tina Esohe', whatsapp_number: '+2347033666184', email: 'mm717740@gmail.com' },
  { full_name: 'Ukah Gabriel', whatsapp_number: '+2348108681859', email: 'gabrielukah50@gmail.com' },
  { full_name: 'Umar Ogbo Bala', whatsapp_number: '+2348067846032', email: 'Balaumar17@yahoo.com' },
  { full_name: 'Ushie Elizabeth', whatsapp_number: '+2349023572616', email: 'Elizabethushie81@gmail.com' },
  { full_name: 'Victor Achima', whatsapp_number: '+17089015895', email: 'victorachima8@gmail.com' },
  { full_name: 'Victor Okeke', whatsapp_number: '+2348039482207', email: 'victorokeke818@gmail.com' },
  { full_name: 'Woli Rau u Jah', whatsapp_number: '+2348147161048', email: 'lonpemary771@gmail.com' },
  { full_name: 'Yakubu Aighufue', whatsapp_number: '+2348079927370', email: 'yakubuaighufue1@gmail.com' },
  { full_name: 'Yemi Tijani', whatsapp_number: '+2347049480910', email: 'adeyemitijani426@gmail.com' },
  { full_name: 'YK Balogun', whatsapp_number: '+2348030470486', email: 'yekinnikola111@gmail.com' }
];

const LOCAL_STORAGE_FILE = path.join(process.cwd(), 'config', 'webinar_leads.json');

function loadLocalLeads(): WebinarLead[] {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read webinar_leads.json:', err);
  }
  return [];
}

function saveLocalLeads(leads: WebinarLead[]): void {
  try {
    const parentDir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save webinar_leads.json:', err);
  }
}

export function computeStatsFromLeads(leads: WebinarLead[]): WebinarLeadsStats {
  const stats: WebinarLeadsStats = {
    total: leads.length,
    not_called: 0,
    registered: 0,
    needs_follow_up: 0,
    call_back_requested: 0,
    not_interested: 0,
    no_answer: 0,
    wrong_number: 0
  };

  for (const lead of leads) {
    switch (lead.call_status) {
      case 'Not Called':
        stats.not_called++;
        break;
      case 'Called — Registered':
        stats.registered++;
        break;
      case 'Called — Needs Follow Up':
        stats.needs_follow_up++;
        break;
      case 'Called — Call Back Requested':
        stats.call_back_requested++;
        break;
      case 'Called — Not Interested':
        stats.not_interested++;
        break;
      case 'Called — No Answer':
        stats.no_answer++;
        break;
      case 'Called — Wrong Number':
        stats.wrong_number++;
        break;
      default:
        stats.not_called++;
    }
  }

  return stats;
}

export async function initWebinarLeadsTable(pool: pg.Pool | null): Promise<void> {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS webinar_leads (
          id BIGSERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          whatsapp_number TEXT,
          email TEXT,
          call_status TEXT DEFAULT 'Not Called',
          call_notes TEXT,
          called_at TIMESTAMPTZ,
          follow_up_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_webinar_leads_status ON webinar_leads(call_status);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_webinar_leads_name ON webinar_leads(full_name);
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
        DROP TRIGGER IF EXISTS trigger_webinar_leads_updated_at ON webinar_leads;
        CREATE TRIGGER trigger_webinar_leads_updated_at
        BEFORE UPDATE ON webinar_leads
        FOR EACH ROW
        EXECUTE FUNCTION update_webinar_leads_updated_at();
      `);

      console.log('[PostgreSQL Migration SUCCESS] webinar_leads table, indexes, and trigger ready.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[PostgreSQL Migration WARNING] webinar_leads table setup warning:', err);
  }
}

export async function getWebinarLeads(
  pool: pg.Pool | null,
  options?: { status?: string; search?: string }
): Promise<{ leads: WebinarLead[]; stats: WebinarLeadsStats }> {
  const { status, search } = options || {};

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
        FROM webinar_leads;
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
        FROM webinar_leads
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

      return { leads, stats };
    } catch (pgErr) {
      console.warn('PostgreSQL query error, falling back to local storage:', pgErr);
    }
  }

  // Fallback in-memory/file storage
  const allLeads = loadLocalLeads();
  const stats = computeStatsFromLeads(allLeads);

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
        FROM webinar_leads;
      `);
      const sRow = statsRes.rows[0] || {};
      return {
        total: parseInt(sRow.total || '0', 10),
        not_called: parseInt(sRow.not_called || '0', 10),
        registered: parseInt(sRow.registered || '0', 10),
        needs_follow_up: parseInt(sRow.needs_follow_up || '0', 10),
        call_back_requested: parseInt(sRow.call_back_requested || '0', 10),
        not_interested: parseInt(sRow.not_interested || '0', 10),
        no_answer: parseInt(sRow.no_answer || '0', 10),
        wrong_number: parseInt(sRow.wrong_number || '0', 10)
      };
    } catch (err) {
      console.warn('Postgres stats query failed, fallback to local storage:', err);
    }
  }

  const allLeads = loadLocalLeads();
  return computeStatsFromLeads(allLeads);
}

export async function updateLeadStatus(
  pool: pg.Pool | null,
  id: string | number,
  newStatus: WebinarCallStatus
): Promise<WebinarLead | null> {
  if (pool) {
    try {
      const res = await pool.query(`
        UPDATE webinar_leads
        SET
          call_status = $1,
          called_at = CASE
            WHEN $1 != 'Not Called'
            THEN NOW()
            ELSE called_at
          END,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *;
      `, [newStatus, id]);

      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
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
        };
      }
    } catch (err) {
      console.warn('PostgreSQL update status failed, fallback to local file:', err);
    }
  }

  const allLeads = loadLocalLeads();
  const idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    const now = new Date().toISOString();
    allLeads[idx].call_status = newStatus;
    if (newStatus !== 'Not Called') {
      allLeads[idx].called_at = now;
    }
    allLeads[idx].updated_at = now;
    saveLocalLeads(allLeads);
    return allLeads[idx];
  }
  return null;
}

export async function updateLeadNotes(
  pool: pg.Pool | null,
  id: string | number,
  notes: string
): Promise<WebinarLead | null> {
  if (pool) {
    try {
      const res = await pool.query(`
        UPDATE webinar_leads
        SET
          call_notes = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *;
      `, [notes, id]);

      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
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
        };
      }
    } catch (err) {
      console.warn('PostgreSQL update notes failed, fallback to local file:', err);
    }
  }

  const allLeads = loadLocalLeads();
  const idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    const now = new Date().toISOString();
    allLeads[idx].call_notes = notes;
    allLeads[idx].updated_at = now;
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
  if (pool) {
    try {
      const res = await pool.query(`
        UPDATE webinar_leads
        SET
          whatsapp_number = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *;
      `, [phone, id]);

      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
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
        };
      }
    } catch (err) {
      console.warn('PostgreSQL update phone failed, fallback to local file:', err);
    }
  }

  const allLeads = loadLocalLeads();
  const idx = allLeads.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    const now = new Date().toISOString();
    allLeads[idx].whatsapp_number = phone;
    allLeads[idx].updated_at = now;
    saveLocalLeads(allLeads);
    return allLeads[idx];
  }
  return null;
}

export async function seedWebinarLeads(pool: pg.Pool | null): Promise<{ count: number; leads: WebinarLead[]; stats: WebinarLeadsStats }> {
  if (pool) {
    try {
      const countCheck = await pool.query('SELECT COUNT(*) FROM webinar_leads;');
      const currentCount = parseInt(countCheck.rows[0]?.count || '0', 10);
      if (currentCount === 0) {
        // Build values for batch insert
        const valuesArr: unknown[] = [];
        const placeholders: string[] = [];

        SEED_WEBINAR_LEADS.forEach((lead, i) => {
          const offset = i * 3;
          placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
          valuesArr.push(lead.full_name, lead.whatsapp_number, lead.email);
        });

        await pool.query(`
          INSERT INTO webinar_leads (full_name, whatsapp_number, email)
          VALUES ${placeholders.join(', ')};
        `, valuesArr);

        console.log(`[Seed SUCCESS] Inserted ${SEED_WEBINAR_LEADS.length} webinar leads into PostgreSQL.`);
      }
      const res = await getWebinarLeads(pool);
      return { count: res.leads.length, leads: res.leads, stats: res.stats };
    } catch (err) {
      console.warn('PostgreSQL seed failed, falling back to local file storage:', err);
    }
  }

  // Fallback file storage
  const currentLocal = loadLocalLeads();
  if (currentLocal.length === 0) {
    const now = new Date().toISOString();
    const seeded: WebinarLead[] = SEED_WEBINAR_LEADS.map((lead, i) => ({
      id: i + 1,
      full_name: lead.full_name,
      whatsapp_number: lead.whatsapp_number,
      email: lead.email,
      call_status: 'Not Called',
      call_notes: null,
      called_at: null,
      follow_up_date: null,
      created_at: now,
      updated_at: now
    }));
    saveLocalLeads(seeded);
    return {
      count: seeded.length,
      leads: seeded,
      stats: computeStatsFromLeads(seeded)
    };
  }

  return {
    count: currentLocal.length,
    leads: currentLocal,
    stats: computeStatsFromLeads(currentLocal)
  };
}
