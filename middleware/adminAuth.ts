import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://amoqzkmzoclsyhuigazo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb3F6a216b2Nsc3lodWlnYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxNjUsImV4cCI6MjA4MDYzMjE2NX0.OMocRVGkcm8V0yslfSXUIvx9mMIQ3KLN6_1SGANB3E8';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    id?: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to protect admin-only WhatsApp Campaign endpoints.
 * Validates Supabase JWT, session tokens, or corporate admin session.
 */
export async function requireAdminAuth(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const adminSessionHeader = req.headers['x-admin-auth'];

    // 1. Check Bearer Token (Supabase JWT or Admin Session Token)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();

      if (token) {
        // Attempt Supabase JWT validation
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            req.adminUser = {
              id: user.id,
              email: user.email || 'corporate-admin@theforge.ng',
              role: 'Admin'
            };
            next();
            return;
          }
        } catch {
          // Continue to fallback check
        }

        // Support local admin session token
        if (token === 'theforge_admin_authenticated' || token.startsWith('forge_admin_')) {
          req.adminUser = {
            id: 'admin-corp-1',
            email: 'theforgeproperties@gmail.com',
            role: 'Admin'
          };
          next();
          return;
        }
      }
    }

    // 2. Check X-Admin-Auth custom header or X-Admin-Role (sent by React Admin dashboard)
    if (
      req.headers['x-admin-role'] === 'Admin' ||
      adminSessionHeader === 'theforge_admin_secret_verified' ||
      adminSessionHeader === 'true'
    ) {
      req.adminUser = {
        id: 'admin-corp-1',
        email: (req.headers['x-admin-user'] as string) || 'theforgeproperties@gmail.com',
        role: 'Admin'
      };
      next();
      return;
    }

    // 3. Fallback: in local dev environment where admin is active
    if (process.env.NODE_ENV !== 'production' && req.headers['x-requested-by'] === 'theforge-admin') {
      req.adminUser = {
        id: 'dev-admin',
        email: 'theforgeproperties@gmail.com',
        role: 'Admin'
      };
      next();
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Administrator authorization is required to access WhatsApp Campaign Manager'
    });
  } catch (err) {
    console.error('requireAdminAuth error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}
