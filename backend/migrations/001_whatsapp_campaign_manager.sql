-- ==============================================================================
-- The Forge Properties: WhatsApp Campaign Manager Database Migration (v3 Final)
-- Script: 001_whatsapp_campaign_manager.sql
-- Description: Hardened, idempotent SQL migration for WhatsApp Campaign Manager.
-- Security:
--   - Single consistent RBAC via public.admin_users allowlist & is_admin() function
--   - Queue worker RPC hardened with search_path, explicit permissions, and lease locking
--   - Reconciles existing webinar_leads without modifying its current RLS policies
-- Safety: Completely non-destructive. Never drops or truncates existing tables.
-- ==============================================================================

-- 0. Ensure required cryptographic extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. SECURE ADMINISTRATOR ALLOWLIST & RLS HELPER FUNCTION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Admin', 'SuperAdmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed corporate administrator emails
INSERT INTO public.admin_users (email, role)
VALUES 
  ('theforgeproperties@gmail.com', 'Admin'),
  ('admin@theforge.ng', 'Admin')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function: Evaluates whether the calling identity is in admin_users with verified email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.email = (SELECT auth.jwt() ->> 'email')
      AND (auth.jwt() ->> 'email_confirmed_at') IS NOT NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

DROP POLICY IF EXISTS "Service role manages admin_users" ON public.admin_users;
CREATE POLICY "Service role manages admin_users"
  ON public.admin_users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. EXTEND webinar_leads WITH WHATSAPP CONSENT FIELDS
-- ------------------------------------------------------------------------------
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

-- Safe consent columns: Default FALSE ensures no existing lead is auto-opted-in
ALTER TABLE public.webinar_leads
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_source TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_webinar_leads_whatsapp_opt_in
  ON public.webinar_leads(whatsapp_opt_in);

CREATE INDEX IF NOT EXISTS idx_webinar_leads_whatsapp_opt_out_at
  ON public.webinar_leads(whatsapp_opt_out_at);

CREATE INDEX IF NOT EXISTS idx_webinar_leads_whatsapp_number
  ON public.webinar_leads(whatsapp_number);

-- Note: RLS on webinar_leads is intentionally NOT altered to avoid breaking
-- existing frontend reads and updates in WebinarLeadsView.tsx and webinarLeadsService.ts.

-- ------------------------------------------------------------------------------
-- 3. CREATE whatsapp_campaigns TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_language TEXT NOT NULL DEFAULT 'en',
  template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'scheduled', 'queued', 'processing', 'paused', 'completed', 'cancelled', 'failed')),
  created_by TEXT NOT NULL DEFAULT 'theforgeproperties@gmail.com',
  scheduled_at TIMESTAMPTZ,
  total_recipients INT NOT NULL DEFAULT 0 CHECK (total_recipients >= 0),
  queued_count INT NOT NULL DEFAULT 0 CHECK (queued_count >= 0),
  sent_count INT NOT NULL DEFAULT 0 CHECK (sent_count >= 0),
  delivered_count INT NOT NULL DEFAULT 0 CHECK (delivered_count >= 0),
  read_count INT NOT NULL DEFAULT 0 CHECK (read_count >= 0),
  failed_count INT NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  opted_out_count INT NOT NULL DEFAULT 0 CHECK (opted_out_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status
  ON public.whatsapp_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_created_at
  ON public.whatsapp_campaigns(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. CREATE whatsapp_campaign_messages QUEUE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  lead_id TEXT,
  recipient_number TEXT NOT NULL,
  recipient_name TEXT NOT NULL DEFAULT 'Valued Investor',
  template_name TEXT NOT NULL,
  template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  queue_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (queue_status IN ('pending', 'processing', 'sent', 'delivered', 'read', 'failed', 'cancelled', 'skipped', 'opted_out', 'uncertain_delivery')),
  provider_message_id TEXT,
  attempt_count INT NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts INT NOT NULL DEFAULT 3 CHECK (max_attempts >= 1),
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  -- Concurrency & Lease management
  claim_token UUID,
  claimed_at TIMESTAMPTZ,
  claimed_by TEXT,
  lease_expires_at TIMESTAMPTZ,
  -- Lifecycle timestamps
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign_id
  ON public.whatsapp_campaign_messages(campaign_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_queue_status
  ON public.whatsapp_campaign_messages(queue_status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_recipient_number
  ON public.whatsapp_campaign_messages(recipient_number);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_provider_id
  ON public.whatsapp_campaign_messages(provider_message_id)
  WHERE provider_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_retry
  ON public.whatsapp_campaign_messages(queue_status, next_retry_at)
  WHERE queue_status IN ('pending', 'processing');

-- ------------------------------------------------------------------------------
-- 5. CREATE whatsapp_opt_outs TABLE (Global Suppression List)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_opt_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  reason TEXT,
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_opt_outs_phone
  ON public.whatsapp_opt_outs(phone_number);

-- ------------------------------------------------------------------------------
-- 6. CREATE whatsapp_webhook_events TABLE (Idempotent Event Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'meta_cloud_api',
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_id
  ON public.whatsapp_webhook_events(event_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_created
  ON public.whatsapp_webhook_events(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. TIMESTAMPTZ SYNCHRONIZATION TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_whatsapp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_whatsapp_campaigns_updated_at ON public.whatsapp_campaigns;
CREATE TRIGGER trigger_whatsapp_campaigns_updated_at
BEFORE UPDATE ON public.whatsapp_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_whatsapp_updated_at();

DROP TRIGGER IF EXISTS trigger_whatsapp_messages_updated_at ON public.whatsapp_campaign_messages;
CREATE TRIGGER trigger_whatsapp_messages_updated_at
BEFORE UPDATE ON public.whatsapp_campaign_messages
FOR EACH ROW EXECUTE FUNCTION public.update_whatsapp_updated_at();

-- ------------------------------------------------------------------------------
-- 8. HARDENED QUEUE-CLAIM RPC (Visibility Timeout & Claim Token Lease Locking)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_whatsapp_queue_batch(
  p_worker_id TEXT,
  p_batch_size INT DEFAULT 25,
  p_lease_seconds INT DEFAULT 300
)
RETURNS TABLE (
  id UUID,
  campaign_id UUID,
  lead_id TEXT,
  recipient_number TEXT,
  recipient_name TEXT,
  template_name TEXT,
  template_variables JSONB,
  queue_status TEXT,
  attempt_count INT,
  max_attempts INT,
  claim_token UUID,
  lease_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_lease_expiry TIMESTAMPTZ := NOW() + (p_lease_seconds || ' seconds')::INTERVAL;
BEGIN
  RETURN QUERY
  WITH eligible_jobs AS (
    SELECT m.id
    FROM public.whatsapp_campaign_messages m
    JOIN public.whatsapp_campaigns c ON c.id = m.campaign_id
    WHERE c.status IN ('queued', 'processing')
      AND (
        -- 1. Normal pending messages ready for dispatch
        (m.queue_status = 'pending' AND (m.next_retry_at IS NULL OR m.next_retry_at <= NOW()))
        OR
        -- 2. Stale worker recovery: message was 'processing' but lease has expired
        (m.queue_status = 'processing' AND m.lease_expires_at IS NOT NULL AND m.lease_expires_at < NOW())
      )
      AND m.attempt_count < m.max_attempts
    ORDER BY m.queued_at ASC
    LIMIT p_batch_size
    FOR UPDATE OF m SKIP LOCKED
  ),
  claimed AS (
    UPDATE public.whatsapp_campaign_messages target
    SET queue_status = 'processing',
        claim_token = gen_random_uuid(),
        claimed_at = NOW(),
        claimed_by = p_worker_id,
        lease_expires_at = v_lease_expiry,
        updated_at = NOW()
    FROM eligible_jobs
    WHERE target.id = eligible_jobs.id
    RETURNING target.*
  )
  SELECT 
    c.id,
    c.campaign_id,
    c.lead_id,
    c.recipient_number,
    c.recipient_name,
    c.template_name,
    c.template_variables,
    c.queue_status,
    c.attempt_count,
    c.max_attempts,
    c.claim_token,
    c.lease_expires_at
  FROM claimed c;
END;
$$;

-- Security hardening on RPC execution:
REVOKE ALL ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) TO service_role;

-- ------------------------------------------------------------------------------
-- 9. SUPABASE REALTIME PUBLICATION & REPLICA IDENTITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.whatsapp_campaigns REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_campaign_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'whatsapp_campaigns'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_campaigns;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'whatsapp_campaign_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_campaign_messages;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

-- Backend Service Role Bypass (Express Server & Queue Worker only)
DROP POLICY IF EXISTS "Service role full access on whatsapp_campaigns" ON public.whatsapp_campaigns;
CREATE POLICY "Service role full access on whatsapp_campaigns"
  ON public.whatsapp_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on whatsapp_campaign_messages" ON public.whatsapp_campaign_messages;
CREATE POLICY "Service role full access on whatsapp_campaign_messages"
  ON public.whatsapp_campaign_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on whatsapp_opt_outs" ON public.whatsapp_opt_outs;
CREATE POLICY "Service role full access on whatsapp_opt_outs"
  ON public.whatsapp_opt_outs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on whatsapp_webhook_events" ON public.whatsapp_webhook_events;
CREATE POLICY "Service role full access on whatsapp_webhook_events"
  ON public.whatsapp_webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- SECURE ADMIN READ ACCESS (Only verified members of public.admin_users)
DROP POLICY IF EXISTS "Admin users can view whatsapp_campaigns" ON public.whatsapp_campaigns;
CREATE POLICY "Admin users can view whatsapp_campaigns"
  ON public.whatsapp_campaigns FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin users can view whatsapp_campaign_messages" ON public.whatsapp_campaign_messages;
CREATE POLICY "Admin users can view whatsapp_campaign_messages"
  ON public.whatsapp_campaign_messages FOR SELECT TO authenticated
  USING (public.is_admin());
