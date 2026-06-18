import pg from 'pg';
import fs from 'fs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL;
let dbPool: pg.Pool | null = null;

if (dbUrl) {
  console.log("Configuring config/database PostgreSQL connection pool...");
  dbPool = new pg.Pool({ connectionString: dbUrl });
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

  // 1. SELECT WHERE email = $1
  if (normalizedText.includes('select') && normalizedText.includes('users') && normalizedText.includes('email = $1')) {
    const emailToFind = (params && params[0] ? String(params[0]).toLowerCase().trim() : '');
    const found = db.users.filter(u => u.email.toLowerCase() === emailToFind);
    return { rows: found };
  }

  // 2. SELECT WHERE referral_code = $1
  if (normalizedText.includes('select') && normalizedText.includes('users') && normalizedText.includes('referral_code = $1')) {
    const codeToFind = (params && params[0] ? String(params[0]).toUpperCase().trim() : '');
    const found = db.users.filter(u => u.referral_code.toUpperCase() === codeToFind);
    return { rows: found };
  }

  // 3. SELECT WHERE role IN ('admin', 'manager', 'support') or general admin lookup
  if (normalizedText.includes('select') && normalizedText.includes('users') && (normalizedText.includes('role') || normalizedText.includes('admin'))) {
    const foundAdmin = db.users.filter(u => ['admin', 'manager', 'support'].includes(u.role));
    return { rows: foundAdmin };
  }

  // 4. INSERT INTO users
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

  // 5. INSERT INTO notifications
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
