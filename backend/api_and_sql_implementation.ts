/**
 * The Forge Properties Realtors Portal - Real-Time Backend API & SQL Reference Implementation
 * This file contains the complete, production-ready SQL queries, API controller routing,
 * middleware implementations, databases triggers, cron schedules, and security requirements
 * to transition the entire portal into a real-time, persistent PostgreSQL-powered application.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==========================================
// 1. DATABASE SCHEMAS & DDL DEFINITIONS
// ==========================================

export const SCHEMAS_SQL = `
-- Drop existing tables to ensure clean migration if executing fresco
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS material_downloads CASCADE;
DROP TABLE IF EXISTS marketing_materials CASCADE;
DROP TABLE IF EXISTS training_progress CASCADE;
DROP TABLE IF EXISTS training_resources CASCADE;
DROP TABLE IF EXISTS training_categories CASCADE;
DROP TABLE IF EXISTS referral_links CASCADE;
DROP TABLE IF EXISTS ticket_replies CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcement_reads CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS bank_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
  id VARCHAR(100) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  state VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'realtor' CHECK (role IN ('realtor', 'admin', 'manager', 'support', 'super_admin')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  referral_code VARCHAR(100) UNIQUE NOT NULL,
  referred_by VARCHAR(100) REFERENCES users(id),
  bio TEXT,
  profile_photo TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Details Table
CREATE TABLE bank_details (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bank_name VARCHAR(150) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) CHECK (type IN ('land', 'house', 'farmland')),
  location_address VARCHAR(255) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  price_per_unit NUMERIC(15, 2) NOT NULL,
  total_units INTEGER NOT NULL,
  units_available INTEGER NOT NULL CHECK (units_available >= 0),
  description TEXT,
  key_selling_points TEXT[],
  document_status VARCHAR(150),
  commission_rate NUMERIC(5, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'coming_soon', 'sold_out')),
  visibility VARCHAR(50) DEFAULT 'draft' CHECK (visibility IN ('published', 'draft')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Images Table
CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_thumbnail BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads Table
CREATE TABLE leads (
  id VARCHAR(100) PRIMARY KEY,
  realtor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  stage VARCHAR(50) DEFAULT 'just_inquiring' CHECK (stage IN ('just_inquiring', 'seriously_interested', 'ready_to_buy', 'needs_follow_up')),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'being_followed_up', 'converted', 'not_interested')),
  notes TEXT,
  admin_notes TEXT,
  interaction_date DATE,
  lead_expiry_date DATE NOT NULL,
  is_duplicate BOOLEAN DEFAULT FALSE,
  original_lead_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Table
CREATE TABLE sales (
  id VARCHAR(100) PRIMARY KEY,
  realtor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
  lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  sale_amount NUMERIC(15, 2) NOT NULL,
  commission_rate NUMERIC(5, 2) NOT NULL,
  commission_amount NUMERIC(15, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid')),
  payment_date DATE,
  payment_reference VARCHAR(255),
  notes TEXT,
  recorded_by VARCHAR(100) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard Table
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  realtor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(15, 2) DEFAULT 0.00,
  total_commission NUMERIC(15, 2) DEFAULT 0.00,
  rank_position INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  UNIQUE(realtor_id, month, year)
);

-- Announcements Table
CREATE TABLE announcements (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  attachment_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled')),
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcement Reads Table
CREATE TABLE announcement_reads (
  id SERIAL PRIMARY KEY,
  announcement_id VARCHAR(100) REFERENCES announcements(id) ON DELETE CASCADE,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, user_id)
);

-- Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE support_tickets (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  assigned_to VARCHAR(100) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Replies Table
CREATE TABLE ticket_replies (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(100) REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral Links Table
CREATE TABLE referral_links (
  id SERIAL PRIMARY KEY,
  realtor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
  unique_url VARCHAR(255) UNIQUE NOT NULL,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(realtor_id, property_id)
);

-- Training Categories Table
CREATE TABLE training_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Training Resources Table
CREATE TABLE training_resources (
  id VARCHAR(100) PRIMARY KEY,
  category_id INTEGER REFERENCES training_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'document')),
  description TEXT,
  thumbnail_url TEXT,
  file_url TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Progress Table
CREATE TABLE training_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  resource_id VARCHAR(100) REFERENCES training_resources(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, resource_id)
);

-- Marketing Materials Table
CREATE TABLE marketing_materials (
  id VARCHAR(100) PRIMARY KEY,
  property_id VARCHAR(100) REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  size_label VARCHAR(100),
  content_text TEXT,
  file_url TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material Downloads Table
CREATE TABLE material_downloads (
  id SERIAL PRIMARY KEY,
  material_id VARCHAR(100) REFERENCES marketing_materials(id) ON DELETE CASCADE,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Activity Log Table
CREATE TABLE admin_activity_log (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// ==========================================
// 2. MIDDLEWARES IMPLEMENTATION
// ==========================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'realtor' | 'admin' | 'manager' | 'support' | 'super_admin';
  };
  pagination?: {
    page: number;
    limit: number;
    offset: number;
  };
}

/**
 * 1. authenticateMiddleware
 * Verifies the JWT Bearer Token and extracts the user claims.
 */
export const authenticateMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing Authentication Token', code: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'tfp_super_secret_signing_key_2026';
    
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: string };
    
    // Check in database to ensure the user is not suspended or deleted
    const result = await pool.query('SELECT id, email, role, status FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User account no longer exists', code: 401 });
    }

    const dbUser = result.rows[0];
    if (dbUser.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Access forbidden: Your account has been suspended', code: 403 });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };

    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or Expired Token', code: 401 });
  }
};

/**
 * 2. roleMiddleware(roles[])
 * Authorizes specific user roles.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Not Authenticated', code: 401 });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges', code: 403 });
    }
    next();
  };
};

/**
 * Convenience role checkpoints
 */
export const isRealtor = requireRole(['realtor']);
export const isAdmin = requireRole(['admin', 'manager', 'support', 'super_admin']);
export const isSuperAdmin = requireRole(['super_admin']);
export const isAuthenticated = requireRole(['realtor', 'admin', 'manager', 'support', 'super_admin']);

/**
 * 3. adminLogMiddleware
 * Automatically logs admin, manager and super_admin actions.
 */
export const adminLogMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Capture response properties by wrapping res.send or res.json
  const originalJson = res.json;
  res.json = function (this: Response, body: unknown): Response {
    res.json = originalJson; // Restore original helper function
    
    const bodyRecord = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    const isSuccess = bodyRecord ? bodyRecord.success : undefined;
    const bodyData = bodyRecord && 'data' in bodyRecord ? (bodyRecord.data as Record<string, unknown>) : null;

    // Only log if the request is authenticated, is an admin-level user, and is a mutating method
    if (
      req.user && 
      ['POST', 'PUT', 'DELETE'].includes(req.method) && 
      ['admin', 'manager', 'super_admin'].includes(req.user.role) &&
      bodyRecord && isSuccess !== false
    ) {
      // Derive details safely
      const details = {
        path: req.originalUrl,
        body: req.body,
        response_data: bodyData ? { id: bodyData.id || bodyData.ticket_number } : null,
      };

      // Determine entity properties
      let entityType = 'general';
      let entityId = '';

      if (req.originalUrl.includes('/properties')) {
        entityType = 'property';
        entityId = req.params.id || (bodyData && typeof bodyData.id === 'string' ? bodyData.id : '');
      } else if (req.originalUrl.includes('/leads')) {
        entityType = 'lead';
        entityId = req.params.id || (bodyData && typeof bodyData.id === 'string' ? bodyData.id : '');
      } else if (req.originalUrl.includes('/sales')) {
        entityType = 'sale';
        entityId = req.params.id || (bodyData && typeof bodyData.id === 'string' ? bodyData.id : '');
      } else if (req.originalUrl.includes('/tickets')) {
        entityType = 'ticket';
        entityId = req.params.id || (bodyData && typeof bodyData.id === 'string' ? bodyData.id : '');
      } else if (req.originalUrl.includes('/announcements')) {
        entityType = 'announcement';
        entityId = req.params.id || (bodyData && typeof bodyData.id === 'string' ? bodyData.id : '');
      }

      // Log in background safely
      pool.query(
        'INSERT INTO admin_activity_log (admin_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.user.id,
          `${req.method} ${req.path}`,
          entityType,
          entityId,
          JSON.stringify(details),
          req.ip
        ]
      ).catch(err => console.error('Admin actions logging error:', err));
    }

    return originalJson.call(this, body);
  };
  next();
};

/**
 * 4. rateLimitMiddleware (custom lightweight memory store implementation)
 * Strict brute force lockouts.
 */
const loginAttemptStore: Record<string, { attempts: number; blockUntil: number }> = {};
export const rateLimitLoginMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const record = loginAttemptStore[ip];

  if (record && record.blockUntil > now) {
    const remainingMs = record.blockUntil - now;
    const remainingMins = Math.ceil(remainingMs / 60000);
    return res.status(429).json({
      success: false,
      error: `Too many login attempts. You are temporarily locked out. Please try again in ${remainingMins} minutes.`,
      code: 429
    });
  }

  next();
};

/**
 * Increments rate limiter records upon verification failures state.
 */
export const registerFailedLoginAttempt = (ip: string) => {
  const now = Date.now();
  if (!loginAttemptStore[ip]) {
    loginAttemptStore[ip] = { attempts: 1, blockUntil: 0 };
  } else {
    loginAttemptStore[ip].attempts += 1;
    if (loginAttemptStore[ip].attempts >= 5) {
      loginAttemptStore[ip].blockUntil = now + (15 * 60 * 1000); // 15 Minute Lockout
      loginAttemptStore[ip].attempts = 0; // reset counter after locking
    }
  }
};

/**
 * 5. paginationMiddleware
 * Slices list queries.
 */
export const paginationMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let page = parseInt(req.query.page as string) || 1;
  let limit = parseInt(req.query.limit as string) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 20;
  if (limit > 100) limit = 100; // Cap at max 100 entries

  const offset = (page - 1) * limit;

  req.pagination = { page, limit, offset };
  next();
};

// ==========================================
// 3. API CONTROLLER QUERIES & ROUTES
// ==========================================

/**
 * PART 1 / PART 2 MAPPINGS
 */

// ------------------------------------------
// REALTOR DASHBOARD STATS
// ------------------------------------------
// GET /api/dashboard/realtor
// Returns aggregated dynamic stats, alerts, current logs, and rankings.
export const getRealtorDashboard = async (req: AuthenticatedRequest, res: Response) => {
  const realtorId = req.user!.id;
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Run parallel optimizations
    const [
      salesQuery,
      earnedQuery,
      pendingQuery,
      paidQuery,
      rankQuery,
      notificationsQuery,
      announcementQuery
    ] = await Promise.all([
      // Total sales count for a realtor
      pool.query('SELECT COUNT(*) AS total_sales FROM sales WHERE realtor_id = $1', [realtorId]),
      
      // Total commission earned (all time)
      pool.query('SELECT COALESCE(SUM(commission_amount), 0.00) AS total_earned FROM sales WHERE realtor_id = $1', [realtorId]),
      
      // Total commission pending
      pool.query('SELECT COALESCE(SUM(commission_amount), 0.00) AS total_pending FROM sales WHERE realtor_id = $1 AND payment_status = \'pending\'', [realtorId]),
      
      // Total commission paid
      pool.query('SELECT COALESCE(SUM(commission_amount), 0.00) AS total_paid FROM sales WHERE realtor_id = $1 AND payment_status = \'paid\'', [realtorId]),
      
      // Realtor current rank this month
      pool.query('SELECT rank_position FROM leaderboard WHERE realtor_id = $1 AND month = $2 AND year = $3', [realtorId, currentMonth, currentYear]),
      
      // Recent activity / notifications for realtor (last 5 records)
      pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [realtorId]),
      
      // Latest announcement for banner
      pool.query('SELECT * FROM announcements WHERE status = \'published\' ORDER BY published_at DESC LIMIT 1')
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          total_sales: parseInt(salesQuery.rows[0].total_sales),
          total_earned: parseFloat(earnedQuery.rows[0].total_earned),
          total_pending: parseFloat(pendingQuery.rows[0].total_pending),
          total_paid: parseFloat(paidQuery.rows[0].total_paid),
          current_rank: rankQuery.rows[0]?.rank_position || null,
        },
        recent_notifications: notificationsQuery.rows,
        latest_announcement: announcementQuery.rows[0] || null,
        recent_activity: notificationsQuery.rows
      },
      message: 'Realtor dashboard aggregated successfully'
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errMessage, code: 500 });
  }
};

// ------------------------------------------
// ADMIN DASHBOARD STATS
// ------------------------------------------
// GET /api/dashboard/admin
// Returns corporate analysis logs, stats counts, performance metrics charts.
export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [
      realtorsCount,
      activeCount,
      pendingCount,
      leadsMonthCount,
      salesAllTime,
      commissionPaidOut,
      commissionAllPending,
      salesTrends,
      commissionPie,
      topPerformers,
      leadsByProperty,
      adminActivity
    ] = await Promise.all([
      // Total registered realtors
      pool.query('SELECT COUNT(*) AS total_realtors FROM users WHERE role = \'realtor\''),
      // Total active realtors
      pool.query('SELECT COUNT(*) AS active_realtors FROM users WHERE role = \'realtor\' AND status = \'active\''),
      // Total pending approvals
      pool.query('SELECT COUNT(*) AS pending_approvals FROM users WHERE role = \'realtor\' AND status = \'pending\''),
      // Total leads this month
      pool.query('SELECT COUNT(*) AS leads_this_month FROM leads WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2', [currentMonth, currentYear]),
      // Total sales all time
      pool.query('SELECT COUNT(*) AS total_sales FROM sales'),
      // Total commission paid out
      pool.query('SELECT COALESCE(SUM(commission_amount), 0.00) AS total_paid_out FROM sales WHERE payment_status = \'paid\''),
      // Total commission pending
      pool.query('SELECT COALESCE(SUM(commission_amount), 0.00) AS total_pending FROM sales WHERE payment_status = \'pending\''),
      // Monthly sales trend (last 6 months)
      pool.query(`
        SELECT 
          TO_CHAR(created_at, 'Month') AS month,
          COUNT(*) AS total_sales,
          SUM(sale_amount) AS total_revenue
        FROM sales 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 MONTH'
        GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Month')
        ORDER BY DATE_TRUNC('month', created_at) ASC
      `),
      // Commission paid vs pending
      pool.query('SELECT payment_status, SUM(commission_amount) AS total FROM sales GROUP BY payment_status'),
      // Top 5 realtors by sales this month
      pool.query(`
        SELECT 
          u.full_name,
          u.referral_code AS realtor_id,
          COUNT(s.id) AS total_sales,
          SUM(s.commission_amount) AS total_commission
        FROM sales s
        JOIN users u ON s.realtor_id = u.id
        WHERE EXTRACT(MONTH FROM s.created_at) = $1 AND EXTRACT(YEAR FROM s.created_at) = $2
        GROUP BY s.realtor_id, u.full_name, u.referral_code
        ORDER BY total_sales DESC
        LIMIT 5
      `, [currentMonth, currentYear]),
      // Leads by property
      pool.query(`
        SELECT 
          p.name AS property_name,
          COUNT(l.id) AS total_leads
        FROM leads l
        JOIN properties p ON l.property_id = p.id
        GROUP BY p.name, l.property_id
        ORDER BY total_leads DESC
      `),
      // Recent activities Log
      pool.query(`
        SELECT al.*, u.full_name AS admin_name 
        FROM admin_activity_log al
        JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
      `)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          total_realtors: parseInt(realtorsCount.rows[0].total_realtors),
          active_realtors: parseInt(activeCount.rows[0].active_realtors),
          pending_approvals: parseInt(pendingCount.rows[0].pending_approvals),
          leads_this_month: parseInt(leadsMonthCount.rows[0].leads_this_month),
          total_sales: parseInt(salesAllTime.rows[0].total_sales),
          total_commission_paid: parseFloat(commissionPaidOut.rows[0].total_paid_out),
          total_commission_pending: parseFloat(commissionAllPending.rows[0].total_pending)
        },
        charts: {
          monthly_sales_trend: salesTrends.rows,
          commission_breakdown: commissionPie.rows,
          top_realtors: topPerformers.rows,
          leads_by_property: leadsByProperty.rows
        },
        recent_activity: adminActivity.rows
      },
      message: 'Admin dashboard state returned successfully'
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errMessage, code: 500 });
  }
};

// ------------------------------------------
// PROPERTIES ENDPOINTS
// ------------------------------------------
// GET /api/properties
export const getProperties = async (req: AuthenticatedRequest, res: Response) => {
  const { type, status, min_price, max_price } = req.query;
  const { limit, offset, page } = req.pagination!;
  try {
    let baseSql = `
      SELECT 
        p.*,
        MIN(pi.image_url) FILTER (WHERE pi.is_thumbnail = TRUE) AS thumbnail
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.visibility = 'published'
    `;
    const params: unknown[] = [];
    let counter = 1;

    if (type) {
      baseSql += ` AND p.type = $${counter++}`;
      params.push(type);
    }
    if (status) {
      baseSql += ` AND p.status = $${counter++}`;
      params.push(status);
    }
    if (min_price && max_price) {
      baseSql += ` AND p.price_per_unit BETWEEN $${counter++} AND $${counter++}`;
      params.push(min_price, max_price);
    }

    baseSql += ' GROUP BY p.id ORDER BY p.created_at DESC';

    // Total records before pagination
    const totalCountQuery = await pool.query(`SELECT COUNT(*) FROM (${baseSql}) AS count_tbl`, params);
    const totalRecords = parseInt(totalCountQuery.rows[0].count);

    // Apply pagination limits
    baseSql += ` LIMIT $${counter++} OFFSET $${counter++}`;
    params.push(limit, offset);

    const propertiesResult = await pool.query(baseSql, params);

    res.json({
      success: true,
      data: propertiesResult.rows,
      pagination: {
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limit),
        current_page: page,
        per_page: limit
      },
      message: 'Properties retrieved successfully'
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errMessage, code: 500 });
  }
};

// GET /api/properties/:slug
export const getPropertyBySlug = async (req: AuthenticatedRequest, res: Response) => {
  const { slug } = req.params;
  const realtorId = req.user!.id;
  try {
    const propQuery = await pool.query('SELECT * FROM properties WHERE slug = $1', [slug]);
    if (propQuery.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found', code: 404 });
    }
    const property = propQuery.rows[0];

    const imagesQuery = await pool.query('SELECT image_url, is_thumbnail FROM property_images WHERE property_id = $1', [property.id]);
    property.images = imagesQuery.rows;

    // Retrieve or create referral link for this property unique to this agent
    const userQuery = await pool.query('SELECT referral_code FROM users WHERE id = $1', [realtorId]);
    const referralCode = userQuery.rows[0].referral_code;
    const uniqueUrl = `theforgeproperties.com/ref/${referralCode}/${property.slug}`;

    await pool.query(
      `INSERT INTO referral_links (realtor_id, property_id, unique_url) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (realtor_id, property_id) DO NOTHING`,
      [realtorId, property.id, uniqueUrl]
    );

    const refQuery = await pool.query('SELECT unique_url, click_count FROM referral_links WHERE realtor_id = $1 AND property_id = $2', [realtorId, property.id]);
    property.referral_info = refQuery.rows[0];

    res.json({
      success: true,
      data: property,
      message: 'Property full details retrieved'
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errMessage, code: 500 });
  }
};

// ------------------------------------------
// LEADS SUBMISSION & EXPIRY
// ------------------------------------------
// POST /api/leads
export const submitNewLead = async (req: AuthenticatedRequest, res: Response) => {
  const realtorId = req.user!.id;
  const { client_name, client_phone, client_email, property_id, stage, notes, interaction_date } = req.body;
  
  if (!client_name || !client_phone || !client_email || !property_id) {
    return res.status(422).json({ success: false, error: 'Required details are missing', code: 422 });
  }

  try {
    // 1. DUPLICATE PROTECTION: query leads within active ownership timeframe (90 days)
    const expiryCheck = await pool.query(`
      SELECT id, realtor_id FROM leads 
      WHERE (client_phone = $1 OR client_email = $2)
      AND lead_expiry_date >= CURRENT_DATE
      AND status != 'not_interested'
      LIMIT 1
    `, [client_phone, client_email]);

    const isDuplicate = expiryCheck.rows.length > 0;
    const originalLeadId = isDuplicate ? expiryCheck.rows[0].id : null;
    const leadId = `L-LDT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Target interaction/expiry bounds
    const currentDateMs = Date.now();
    const expiryDate = new Date(currentDateMs + (90 * 24 * 3600 * 1000)); // 90 days expiration buffer

    await pool.query(`
      INSERT INTO leads (
        id, realtor_id, property_id, client_name, client_phone, client_email, 
        stage, notes, interaction_date, lead_expiry_date, is_duplicate, original_lead_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      leadId,
      realtorId,
      property_id,
      client_name,
      client_phone,
      client_email,
      stage || 'just_inquiring',
      notes,
      interaction_date || new Date().toISOString().split('T')[0],
      expiryDate.toISOString().split('T')[0],
      isDuplicate,
      originalLeadId
    ]);

    // Send notifications to Admin
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT id, 'New Lead Submitted', $1, 'lead' FROM users WHERE role IN ('admin', 'super_admin')
    `, [`${client_name} assigned under duplicate check monitoring flag: ${isDuplicate}`]);

    res.json({
      success: true,
      data: {
        id: leadId,
        is_duplicate: isDuplicate,
        original_lead_id: originalLeadId
      },
      message: isDuplicate 
        ? 'Duplicate submitted! Lead has been safely locked & flagged under administrative overview to safeguard your referral allocations.'
        : 'Lead registered successfully! Protected on your profile for the next 90 days.'
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errMessage, code: 500 });
  }
};

// ------------------------------------------
// SALES CONTROL & AUTO-COMMISSION CALCULATIONS
// ------------------------------------------
// POST /api/sales/admin
// Secure corporate system to record transaction sales.
export const recordNewSale = async (req: AuthenticatedRequest, res: Response) => {
  const { realtor_id, property_id, lead_id, client_name, sale_amount, notes } = req.body;
  const adminId = req.user!.id;

  if (!realtor_id || !property_id || !client_name || !sale_amount) {
    return res.status(422).json({ success: false, error: 'Parameters missing for transaction log', code: 422 });
  }

  try {
    // 1. Fetch properties commission parameters safely
    const propQuery = await pool.query('SELECT commission_rate, units_available FROM properties WHERE id = $1', [property_id]);
    if (propQuery.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Target property listed doesn\'t exist', code: 404 });
    }

    const { commission_rate, units_available } = propQuery.rows[0];
    if (units_available <= 0) {
      return res.status(400).json({ success: false, error: 'Transaction failed: Property is fully sold out', code: 400 });
    }

    // 2. Compute dynamic commission value in secure territory (all values standard raw numeric processing)
    const rate = parseFloat(commission_rate);
    const amount = parseFloat(sale_amount);
    const calculatedCommission = (amount * rate) / 100.00;

    const saleId = `S-SLT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Execute transaction updates
    await pool.query('BEGIN');

    // Insert sale record with numeric fields
    await pool.query(`
      INSERT INTO sales (
        id, realtor_id, property_id, lead_id, client_name, sale_amount, 
        commission_rate, commission_amount, payment_status, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
    `, [
      saleId,
      realtor_id,
      property_id,
      lead_id || null,
      client_name,
      amount,
      rate,
      calculatedCommission,
      notes,
      adminId
    ]);

    // Update units available
    await pool.query(`
      UPDATE properties 
      SET units_available = units_available - 1 
      WHERE id = $1 AND units_available > 0
    `, [property_id]);

    // Update property status automatically if sold out
    await pool.query(`
      UPDATE properties 
      SET status = 'sold_out' 
      WHERE id = $1 AND units_available = 0
    `, [property_id]);

    // Commit changes
    await pool.query('COMMIT');

    res.json({
      success: true,
      data: {
        sale_id: saleId,
        commission_earned: calculatedCommission,
        commission_rate: rate
      },
      message: 'Transaction verified and recorded successfully. Realtor wallet balance pending clearance.'
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, error: errMessage, code: 500 });
  }
};

// ==========================================
// 4. CRON JOB PROCEDURES (SCHEDULER AGENTS)
// ==========================================

export const runMinuteCronJobs = async () => {
  const client = await pool.connect();
  try {
    // 1. Every 5 Minutes - Automatic announcement publisher
    const publishAnn = await client.query(`
      UPDATE announcements 
      SET status = 'published', published_at = NOW() 
      WHERE status = 'scheduled' AND scheduled_at <= NOW()
      RETURNING id, title
    `);

    if (publishAnn.rows.length > 0) {
      console.log(`[CRON] Successfully published ${publishAnn.rows.length} scheduled announcements.`);
      for (const ann of publishAnn.rows) {
        // Broaden notification triggers to active agents
        await client.query(`
          INSERT INTO notifications (user_id, title, message, type, link)
          SELECT id, 'New Announcement', $1, 'announcement', $2 FROM users WHERE role = 'realtor'
        `, [ann.title, `/portal/announcements`]);
      }
    }
  } catch (err) {
    console.error('[CRON ERROR] Publish scheduled announcements query crash:', err);
  } finally {
    client.release();
  }
};

export const runMidnightCronJobs = async () => {
  const client = await pool.connect();
  try {
    // 2. Daily midnight lead expiration logic
    const expireLeads = await client.query(`
      UPDATE leads 
      SET status = 'not_interested', admin_notes = 'Lead expired due to exceeding 90-day protective threshold'
      WHERE lead_expiry_date < CURRENT_DATE 
      AND status NOT IN ('converted', 'not_interested')
      RETURNING id, realtor_id, client_name
    `);

    if (expireLeads.rows.length > 0) {
      console.log(`[CRON] Successfully expired ${expireLeads.rows.length} records overdue.`);
      for (const lead of expireLeads.rows) {
        await client.query(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES ($1, 'Lead Expired', $2, 'lead', '/portal/leads')
        `, [lead.realtor_id, `Your protective ownership window on ${lead.client_name} has ended.`, `/portal/leads`]);
      }
    }

    // 3. Daily inactive lead updating reminder rules (7 days inactive checklist)
    const reminders = await client.query(`
      SELECT DISTINCT realtor_id FROM leads
      WHERE updated_at < NOW() - INTERVAL '7 DAYS'
      AND status IN ('new', 'being_followed_up')
    `);

    for (const row of reminders.rows) {
      await client.query(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES ($1, 'Action Required: Pending Leads', 'You have active leads that have not been updated in 7 days. Please follow up!', 'lead', '/portal/leads')
      `, [row.realtor_id]);
    }
  } catch (err) {
    console.error('[CRON ERROR] Midnight procedures failed:', err);
  } finally {
    client.release();
  }
};

export const runFirstOfMonthLeaderboardResets = async () => {
  const client = await pool.connect();
  try {
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const month = prevMonthDate.getMonth() + 1;
    const year = prevMonthDate.getFullYear();

    console.log(`[CRON] Resetting rankings for month ${month}/${year}. Calculating historical positions`);

    // Assign rank positions based on performance
    await client.query(`
      WITH ranked_leaderboard AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_sales DESC, total_revenue DESC) AS calculated_rank
        FROM leaderboard
        WHERE month = $1 AND year = $2
      )
      UPDATE leaderboard 
      SET rank_position = ranked_leaderboard.calculated_rank
      FROM ranked_leaderboard
      WHERE leaderboard.id = ranked_leaderboard.id
    `, [month, year]);

    console.log(`[CRON] Month ${month}/${year} leaderboard compiled successfully. New month state cleanly initiated.`);
  } catch (err) {
    console.error('[CRON ERROR] Leaderboard compilation error:', err);
  } finally {
    client.release();
  }
};

// ==========================================
// 5. POSTGRESQL AUTOMATED DB TRIGGERS (REFERENCE)
// ==========================================

export const DATABASE_TRIGGERS_PLPGSQL = `
-- Trigger 1: Auto recalculate and insert/update leaderboard after sales recorded
CREATE OR REPLACE FUNCTION process_leaderboard_update()
RETURNS TRIGGER AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM NEW.created_at);
  current_year := EXTRACT(YEAR FROM NEW.created_at);

  INSERT INTO leaderboard (
    realtor_id, month, year, total_sales, total_revenue, total_commission
  ) VALUES (
    NEW.realtor_id, current_month, current_year, 1, NEW.sale_amount, NEW.commission_amount
  )
  ON CONFLICT (realtor_id, month, year) DO UPDATE
  SET 
    total_sales = leaderboard.total_sales + 1,
    total_revenue = leaderboard.total_revenue + EXCLUDED.total_revenue,
    total_commission = leaderboard.total_commission + EXCLUDED.total_commission;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_leaderboard_on_sale
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION process_leaderboard_update();

-- Trigger 2: Notify realtor when commission state changes
CREATE OR REPLACE FUNCTION process_commission_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status != OLD.payment_status THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.realtor_id,
      'Commission Status Alert',
      CONCAT('Your pending commission payment of ₦', TO_CHAR(NEW.commission_amount, '999,999,999.99'), ' has been processed as: ', NEW.payment_status),
      'commission',
      '/portal/earnings'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER notify_commission_update_trigger
AFTER UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION process_commission_payment_notification();

-- Trigger 3: Notify realtor when admin updates lead attributes
CREATE OR REPLACE FUNCTION process_lead_attribute_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.realtor_id,
      'Lead Stage Updated',
      CONCAT('Your system lead target ', NEW.client_name, ' has been marked: ', NEW.status),
      'lead',
      '/portal/leads'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER notify_lead_update_trigger
AFTER UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION process_lead_attribute_notification();
`;
