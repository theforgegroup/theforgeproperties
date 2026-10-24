import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabaseUrl = process.env.SUPABASE_URL || 'https://amoqzkmzoclsyhuigazo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb3F6a216b2Nsc3lodWlnYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxNjUsImV4cCI6MjA4MDYzMjE2NX0.OMocRVGkcm8V0yslfSXUIvx9mMIQ3KLN6_1SGANB3E8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Authoritative corporate administrator allowlist matching public.admin_users
export const ADMIN_ALLOWLIST = new Set<string>([
  'theforgeproperties@gmail.com',
  'admin@theforge.ng'
]);

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    role: string;
    emailConfirmedAt: string;
  };
}

let dbPool: pg.Pool | null = null;
export function setAdminAuthDbPool(pool: pg.Pool | null): void {
  dbPool = pool;
}

/**
 * Middleware to protect admin-only WhatsApp Campaign endpoints.
 * Strictly verifies Supabase Auth identity, ensures email is confirmed,
 * and enforces authoritative membership in public.admin_users.
 * 
 * FAIL-CLOSED SECURITY POLICY:
 * - If the database connection fails or the user store is unreachable,
 *   access is denied (HTTP 503). Never silently falls back to an in-memory list.
 * - Header bypasses (x-admin-auth, x-admin-role, dev headers) are strictly removed.
 * - User-editable metadata claims are never trusted for authorization.
 */
export async function requireAdminAuth(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Reject missing or malformed Authorization header immediately
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid Bearer token is required for administrator access.'
      });
      return;
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token string is empty.'
      });
      return;
    }

    // Cryptographically validate the session token against Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired Supabase authentication session.'
      });
      return;
    }

    // Enforce email confirmation: user MUST have a confirmed email address
    // (Never trust user_metadata or unconfirmed identity)
    const confirmedEmail = user.email ? user.email.trim().toLowerCase() : '';
    const emailConfirmedAt = user.email_confirmed_at;

    if (!confirmedEmail || !emailConfirmedAt) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Administrator identity requires a verified, confirmed email address.'
      });
      return;
    }

    // Fail-closed verification against public.admin_users table
    let isAuthorized = false;

    if (dbPool) {
      try {
        const queryRes = await dbPool.query(
          'SELECT role FROM public.admin_users WHERE LOWER(email) = $1 LIMIT 1',
          [confirmedEmail]
        );
        isAuthorized = queryRes.rows.length > 0;
      } catch (dbErr) {
        console.error('[requireAdminAuth] Database query failed when verifying administrator store:', dbErr);
        // Fail-closed: Never fall back to in-memory list during database failure
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Authoritative administrator directory unavailable. Access denied under fail-closed security policy.'
        });
        return;
      }
    } else {
      // Query Supabase public.admin_users via REST if direct pool is not bound
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('email', confirmedEmail)
          .maybeSingle();

        if (error) {
          console.error('[requireAdminAuth] Supabase query failed when checking admin_users:', error);
          // Fail-closed: Table unreachable or permission denied
          res.status(503).json({
            error: 'Service Unavailable',
            message: 'Authoritative administrator directory unavailable. Access denied under fail-closed security policy.'
          });
          return;
        }

        isAuthorized = Boolean(data && ADMIN_ALLOWLIST.has(confirmedEmail));
      } catch (restErr) {
        console.error('[requireAdminAuth] REST error checking admin_users:', restErr);
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Authoritative administrator directory check failed. Access denied under fail-closed security policy.'
        });
        return;
      }
    }

    if (!isAuthorized) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: account is not registered in the corporate administrator allowlist.'
      });
      return;
    }

    // Authenticated admin context
    req.adminUser = {
      id: user.id,
      email: confirmedEmail,
      role: 'Admin',
      emailConfirmedAt
    };

    next();
  } catch (err) {
    console.error('[requireAdminAuth] Unexpected error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}
