import pg from 'pg';
import fs from 'fs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL;
let dbPool: pg.Pool | null = null;

if (dbUrl) {
  console.log("Configuring config/database PostgreSQL connection pool...");
  dbPool = new pg.Pool({
    connectionString: dbUrl,
    ssl: dbUrl && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
  dbPool.on('error', (err) => {
    console.error('Unexpected error on idle pg client:', err);
  });
} else {
  console.log("Warning: DATABASE_URL not set in config/database. Direct SQL queries will fall back to JSON/In-memory store.");
}

// In-memory / JSON fallback database setup
const MOCK_DB_PATH = path.join(process.cwd(), 'config', 'mock_db.json');

interface MockDbStructure {
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    phone: string;
    state: string;
    password_hash: string;
    role: string;
    status: string;
    referral_code: string;
    referred_by: string | null;
    email_verified: boolean;
    email_verification_token: string;
    created_at: string;
    updated_at: string;
  }>;
  notifications: Array<{
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    link: string;
    created_at: string;
  }>;
}

const loadMockDb = (): MockDbStructure => {
  const defaultDb: MockDbStructure = {
    users: [
      {
        id: "admin-id-1",
        full_name: "Corporate Admin",
        email: "admin@theforge.ng",
        phone: "+2348000000000",
        state: "Lagos",
        password_hash: "$2b$12$abcdefg",
        role: "admin",
        status: "active",
        referral_code: "FORGEADMIN",
        referred_by: null,
        email_verified: true,
        email_verification_token: "token-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    notifications: []
  };

  try {
    const parentDir = path.dirname(MOCK_DB_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (fs.existsSync(MOCK_DB_PATH)) {
      const data = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
      return JSON.parse(data);
    } else {
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
  } catch (error) {
    console.error("Failed to read/write mock JSON database, using in-memory default:", error);
    return defaultDb;
  }
};

const saveMockDb = (db: MockDbStructure) => {
  try {
    const parentDir = path.dirname(MOCK_DB_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to persist mock JSON database:", error);
  }
};

export const query = async (text: string, params?: unknown[]) => {
  if (dbPool) {
    return dbPool.query(text, params);
  }

  // Fallback direct SQL mock query runner
  console.log("[MOCK DB] Executing simulated SQL query:", text, "with params:", params);
  const normalizedText = text.replace(/\s+/g, ' ').trim().toLowerCase();
  const db = loadMockDb();

  // 1. SELECT queries
  if (normalizedText.includes('select') && normalizedText.includes('users')) {
    let found = db.users;
    if (normalizedText.includes("role = 'realtor'")) {
      found = found.filter(u => u.role === 'realtor');
    } else if (normalizedText.includes('email = $1')) {
      const emailToFind = (params && params[0] ? String(params[0]).toLowerCase().trim() : '');
      found = found.filter(u => u.email.toLowerCase() === emailToFind);
    } else if (normalizedText.includes('referral_code = $1')) {
      const codeToFind = (params && params[0] ? String(params[0]).toUpperCase().trim() : '');
      found = found.filter(u => u.referral_code.toUpperCase() === codeToFind);
    } else if (normalizedText.includes('role') && (normalizedText.includes('admin') || normalizedText.includes('manager') || normalizedText.includes('support'))) {
      found = found.filter(u => ['admin', 'manager', 'support'].includes(u.role));
    }
    return { rows: found };
  }

  // 2. INSERT INTO users
  if (normalizedText.includes('insert into users')) {
    const safeParams = params || [];
    const newUser = {
      id: String(safeParams[0] || ''),
      full_name: String(safeParams[1] || '').trim(),
      email: String(safeParams[2] || '').toLowerCase().trim(),
      phone: String(safeParams[3] || '').trim(),
      state: String(safeParams[4] || '').trim(),
      password_hash: String(safeParams[5] || ''),
      role: 'realtor',
      status: 'pending',
      referral_code: String(safeParams[6] || ''),
      referred_by: safeParams[7] ? String(safeParams[7]) : null,
      email_verified: false,
      email_verification_token: String(safeParams[8] || ''),
      password: safeParams[9] ? String(safeParams[9]) : '',
      total_sales: 0,
      total_commission: 0,
      available_balance: 0,
      pending_balance: 0,
      total_clicks: 0,
      total_leads: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveMockDb(db);

    console.log("[MOCK DB] Successfully registered a new user:", newUser.email);
    return {
      rows: [
        {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
          state: newUser.state,
          status: newUser.status,
          referral_code: newUser.referral_code,
          created_at: newUser.created_at
        }
      ]
    };
  }

  // 3. UPDATE users
  if (normalizedText.includes('update users')) {
    const safeParams = params || [];
    // ID is index 15 in user-agent update query
    const idToUpdate = String(safeParams[15] || '');
    const userIndex = db.users.findIndex(u => u.id === idToUpdate);
    if (userIndex !== -1) {
      const u = db.users[userIndex];
      if (safeParams[0] !== undefined && safeParams[0] !== null) u.full_name = String(safeParams[0]);
      if (safeParams[1] !== undefined && safeParams[1] !== null) u.phone = String(safeParams[1]);
      if (safeParams[2] !== undefined && safeParams[2] !== null) u.state = String(safeParams[2]);
      if (safeParams[3] !== undefined && safeParams[3] !== null) u.status = String(safeParams[3]);
      if (safeParams[4] !== undefined && safeParams[4] !== null) u.total_sales = Number(safeParams[4]);
      if (safeParams[5] !== undefined && safeParams[5] !== null) u.total_commission = Number(safeParams[5]);
      if (safeParams[6] !== undefined && safeParams[6] !== null) u.available_balance = Number(safeParams[6]);
      if (safeParams[7] !== undefined && safeParams[7] !== null) u.pending_balance = Number(safeParams[7]);
      if (safeParams[8] !== undefined && safeParams[8] !== null) u.total_clicks = Number(safeParams[8]);
      if (safeParams[9] !== undefined && safeParams[9] !== null) u.total_leads = Number(safeParams[9]);
      const uRecord = u as unknown as Record<string, unknown>;
      if (safeParams[10] !== undefined && safeParams[10] !== null) uRecord.bank_name = String(safeParams[10]);
      if (safeParams[11] !== undefined && safeParams[11] !== null) uRecord.account_number = String(safeParams[11]);
      if (safeParams[12] !== undefined && safeParams[12] !== null) uRecord.account_name = String(safeParams[12]);
      if (safeParams[13] !== undefined && safeParams[13] !== null) uRecord.bio = String(safeParams[13]);
      if (safeParams[14] !== undefined && safeParams[14] !== null) uRecord.profile_photo = String(safeParams[14]);
      u.updated_at = new Date().toISOString();
      db.users[userIndex] = u;
      saveMockDb(db);
      console.log("[MOCK DB] Successfully updated user agent:", u.email);
    }
    return { rows: [] };
  }

  // 4. INSERT INTO notifications
  if (normalizedText.includes('insert into notifications')) {
    // Return empty success structure for mockup
    console.log("[MOCK DB] Skipped layout execution for bulk notifications insertion.");
    return { rows: [] };
  }

  // General fallback
  return { rows: [] };
};

export default {
  query
};
