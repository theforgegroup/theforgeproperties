-- ==============================================================================
-- The Forge Properties: WhatsApp Campaign Manager Database Migration (v3 Final Hardened)
-- Script: 001_whatsapp_campaign_manager.sql
-- Description: Production-grade, idempotent SQL migration for WhatsApp Campaign Manager.
-- Security & Hardening:
--   - Single authoritative RBAC via public.admin_users allowlist & hardened is_admin()
--   - Verified Supabase identity via auth.uid() and confirmed email via auth.users.email_confirmed_at
--   - All administrative actions & recovery RPCs restricted strictly to service_role
--   - Queue worker RPC hardened with search_path, explicit permissions, visibility timeout, and claim token lease locking
--   - Expired leases quarantined to uncertain_delivery (no blind resends)
--   - Canonical phone normalization (exact matches; no ambiguous suffix matching)
--   - Reconciles existing webinar_leads without modifying its current RLS policies
-- Safety: Completely non-destructive. Never drops or truncates existing tables.
-- ==============================================================================

-- 0. Ensure required cryptographic extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. CANONICAL PHONE NORMALIZATION FUNCTION
-- Standardizes Nigerian (+234) and international numbers into canonical E.164 (+<digits>)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_phone(p_raw_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_digits TEXT;
BEGIN
  IF p_raw_phone IS NULL THEN
    RETURN NULL;
  END IF;

  v_digits := regexp_replace(p_raw_phone, '[^0-9]', '', 'g');
  IF v_digits = '' THEN
    RETURN '';
  END IF;

  -- Nigerian 11-digit local mobile numbers: 080..., 070..., 090..., 081... -> +234...
  IF length(v_digits) = 11 AND substring(v_digits from 1 for 1) = '0' THEN
    v_digits := '234' || substring(v_digits from 2);
  -- Nigerian 14-digit local prefix format: 234080... -> +234...
  ELSIF length(v_digits) = 14 AND substring(v_digits from 1 for 4) = '2340' THEN
    v_digits := '234' || substring(v_digits from 5);
  END IF;

  RETURN '+' || v_digits;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. SECURE ADMINISTRATOR ALLOWLIST & RLS HELPER FUNCTION
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

-- Helper function: Evaluates whether the calling identity is in admin_users with verified email in auth.users
-- Uses auth.uid() and auth.users.email_confirmed_at directly rather than trusting auth.jwt() claims or user_metadata.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users au
    JOIN auth.users u ON LOWER(u.email) = LOWER(au.email)
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
  );
$$;

-- Harden is_admin function permissions
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
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
-- 3. EXTEND webinar_leads WITH WHATSAPP CONSENT FIELDS
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

-- Safe consent columns: Default FALSE ensures all existing leads remain opted-out
-- until explicit, auditable opt-in consent is recorded.
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
-- 4. CREATE OR UPGRADE whatsapp_campaigns TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_language TEXT NOT NULL DEFAULT 'en',
  template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
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

-- Upgrade status constraint safely for partial schemas
ALTER TABLE public.whatsapp_campaigns
  DROP CONSTRAINT IF EXISTS whatsapp_campaigns_status_check;
ALTER TABLE public.whatsapp_campaigns
  ADD CONSTRAINT whatsapp_campaigns_status_check
  CHECK (status IN ('draft', 'scheduled', 'queued', 'processing', 'paused', 'completed', 'cancelled', 'failed'));

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status
  ON public.whatsapp_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_created_at
  ON public.whatsapp_campaigns(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. CREATE OR UPGRADE whatsapp_campaign_messages QUEUE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  lead_id TEXT,
  recipient_number TEXT NOT NULL,
  recipient_name TEXT NOT NULL DEFAULT 'Valued Investor',
  template_name TEXT NOT NULL,
  template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  queue_status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  attempt_count INT NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts INT NOT NULL DEFAULT 3 CHECK (max_attempts >= 1),
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  claim_token UUID,
  claimed_at TIMESTAMPTZ,
  claimed_by TEXT,
  lease_expires_at TIMESTAMPTZ,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade existing partial schemas by adding concurrency columns if absent
ALTER TABLE public.whatsapp_campaign_messages
  ADD COLUMN IF NOT EXISTS claim_token UUID,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ;

-- Upgrade status check constraint to include uncertain_delivery and opted_out
ALTER TABLE public.whatsapp_campaign_messages
  DROP CONSTRAINT IF EXISTS whatsapp_campaign_messages_queue_status_check;
ALTER TABLE public.whatsapp_campaign_messages
  ADD CONSTRAINT whatsapp_campaign_messages_queue_status_check
  CHECK (queue_status IN ('pending', 'processing', 'sent', 'delivered', 'read', 'failed', 'cancelled', 'skipped', 'opted_out', 'uncertain_delivery'));

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

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lease_expiry
  ON public.whatsapp_campaign_messages(queue_status, lease_expires_at)
  WHERE queue_status = 'processing';

-- ------------------------------------------------------------------------------
-- 6. CREATE whatsapp_opt_outs TABLE (Canonical Global Suppression List)
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
-- 7. CREATE whatsapp_webhook_events TABLE (Idempotent Event Log)
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
-- 8. TIMESTAMPTZ SYNCHRONIZATION TRIGGERS
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
-- 9. HARDENED QUEUE-CLAIM RPC (Visibility Timeout & Claim Token Lease Locking)
-- Restricted strictly to service_role (Express backend/worker)
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
  v_lease_expiry TIMESTAMPTZ;
BEGIN
  -- Strict Input Validation
  IF p_worker_id IS NULL OR trim(p_worker_id) = '' THEN
    RAISE EXCEPTION 'Worker ID must not be empty';
  END IF;

  IF p_batch_size IS NULL OR p_batch_size < 1 OR p_batch_size > 100 THEN
    RAISE EXCEPTION 'Batch size must be between 1 and 100';
  END IF;

  IF p_lease_seconds IS NULL OR p_lease_seconds < 10 OR p_lease_seconds > 3600 THEN
    RAISE EXCEPTION 'Lease duration must be between 10 and 3600 seconds';
  END IF;

  v_lease_expiry := NOW() + (p_lease_seconds || ' seconds')::INTERVAL;

  -- Step 1: Quarantine expired leases to uncertain_delivery with all claim fields cleared
  -- Never blind-resend! If a worker crashed after Meta accepted the message, blind resends duplicate messages.
  UPDATE public.whatsapp_campaign_messages
  SET queue_status = 'uncertain_delivery',
      last_error = 'Worker lease expired while in processing. Quarantined for webhook reconciliation or manual review.',
      claim_token = NULL,
      claimed_at = NULL,
      claimed_by = NULL,
      lease_expires_at = NULL,
      updated_at = NOW()
  WHERE queue_status = 'processing'
    AND lease_expires_at IS NOT NULL
    AND lease_expires_at < NOW();

  -- Step 2: Atomically select and claim strictly eligible pending messages
  RETURN QUERY
  WITH eligible_jobs AS (
    SELECT m.id
    FROM public.whatsapp_campaign_messages m
    JOIN public.whatsapp_campaigns c ON c.id = m.campaign_id
    WHERE c.status IN ('queued', 'processing')
      AND m.queue_status = 'pending'
      AND (m.next_retry_at IS NULL OR m.next_retry_at <= NOW())
      AND m.attempt_count < m.max_attempts
    ORDER BY m.queued_at ASC
    LIMIT p_batch_size
    FOR UPDATE OF m SKIP LOCKED
  ),
  claimed AS (
    UPDATE public.whatsapp_campaign_messages target
    SET queue_status = 'processing',
        attempt_count = target.attempt_count + 1,
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

-- Restricted strictly to service_role
REVOKE ALL ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_whatsapp_queue_batch(TEXT, INT, INT) TO service_role;

-- ------------------------------------------------------------------------------
-- 10. ATOMIC MESSAGE FINALIZATION RPC
-- Enforces active claim token, active lease duration, and clears all lease fields on release
-- Restricted strictly to service_role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.finalize_whatsapp_message(
  p_message_id UUID,
  p_claim_token UUID,
  p_status TEXT,
  p_provider_message_id TEXT DEFAULT NULL,
  p_error TEXT DEFAULT NULL,
  p_next_retry_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rows_updated INT;
BEGIN
  IF p_status NOT IN ('sent', 'failed', 'uncertain_delivery', 'pending', 'cancelled', 'skipped') THEN
    RAISE EXCEPTION 'Invalid target status: %', p_status;
  END IF;

  -- Updates row ONLY if the worker's claim_token matches, status is processing,
  -- and the lease has NOT expired. Rejects stale or crashed worker writes.
  UPDATE public.whatsapp_campaign_messages
  SET queue_status = p_status,
      provider_message_id = COALESCE(p_provider_message_id, provider_message_id),
      last_error = p_error,
      next_retry_at = p_next_retry_at,
      sent_at = CASE WHEN p_status = 'sent' AND sent_at IS NULL THEN NOW() ELSE sent_at END,
      failed_at = CASE WHEN p_status = 'failed' AND failed_at IS NULL THEN NOW() ELSE failed_at END,
      -- Always clear all claim and lease fields on finalization (including when returning to pending)
      claim_token = NULL,
      claimed_at = NULL,
      claimed_by = NULL,
      lease_expires_at = NULL,
      updated_at = NOW()
  WHERE id = p_message_id
    AND claim_token = p_claim_token
    AND queue_status = 'processing'
    AND lease_expires_at IS NOT NULL
    AND lease_expires_at >= NOW();

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated > 0;
END;
$$;

-- Restricted strictly to service_role
REVOKE ALL ON FUNCTION public.finalize_whatsapp_message(UUID, UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_whatsapp_message(UUID, UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM anon;
REVOKE ALL ON FUNCTION public.finalize_whatsapp_message(UUID, UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_whatsapp_message(UUID, UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO service_role;

-- ------------------------------------------------------------------------------
-- 11. ATOMIC STOP OPT-OUT & QUEUE CANCELLATION RPC
-- Canonical phone normalization, exact matches (no ambiguous suffix matching)
-- Restricted strictly to service_role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_whatsapp_opt_out(
  p_phone_number TEXT,
  p_reason TEXT DEFAULT 'STOP keyword received',
  p_source TEXT DEFAULT 'webhook_stop'
)
RETURNS TABLE (
  opted_out_phone TEXT,
  cancelled_messages INT,
  updated_leads INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_canonical_phone TEXT;
  v_cancelled_count INT := 0;
  v_lead_count INT := 0;
BEGIN
  v_canonical_phone := public.normalize_phone(p_phone_number);
  IF v_canonical_phone IS NULL OR v_canonical_phone = '' THEN
    RAISE EXCEPTION 'Invalid phone number for opt-out';
  END IF;

  -- 1. Insert or update global suppression list with canonical phone
  INSERT INTO public.whatsapp_opt_outs (phone_number, reason, source, created_at)
  VALUES (v_canonical_phone, p_reason, p_source, NOW())
  ON CONFLICT (phone_number) DO UPDATE
    SET reason = EXCLUDED.reason,
        source = EXCLUDED.source;

  -- 2. Immediately cancel any pending or processing queued messages for this canonical recipient
  WITH cancelled_rows AS (
    UPDATE public.whatsapp_campaign_messages
    SET queue_status = 'cancelled',
        last_error = 'Recipient opted out via STOP keyword',
        claim_token = NULL,
        claimed_at = NULL,
        claimed_by = NULL,
        lease_expires_at = NULL,
        updated_at = NOW()
    WHERE public.normalize_phone(recipient_number) = v_canonical_phone
      AND queue_status IN ('pending', 'processing')
    RETURNING id
  )
  SELECT count(*) INTO v_cancelled_count FROM cancelled_rows;

  -- 3. Update webinar_leads opt-in to false and set opt_out_at using exact canonical phone match
  WITH updated_lead_rows AS (
    UPDATE public.webinar_leads
    SET whatsapp_opt_in = FALSE,
        whatsapp_opt_out_at = NOW(),
        updated_at = NOW()
    WHERE public.normalize_phone(whatsapp_number) = v_canonical_phone
    RETURNING id
  )
  SELECT count(*) INTO v_lead_count FROM updated_lead_rows;

  RETURN QUERY SELECT v_canonical_phone, v_cancelled_count, v_lead_count;
END;
$$;

-- Restricted strictly to service_role (Admin calls must route via backend)
REVOKE ALL ON FUNCTION public.process_whatsapp_opt_out(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_whatsapp_opt_out(TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.process_whatsapp_opt_out(TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_whatsapp_opt_out(TEXT, TEXT, TEXT) TO service_role;

-- ------------------------------------------------------------------------------
-- 12. MANUAL-REVIEW & RECOVERY RPC FOR UNCERTAIN DELIVERY
-- Restricted strictly to service_role (Admin calls must route via backend)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reconcile_uncertain_message(
  p_message_id UUID,
  p_resolution TEXT,
  p_provider_message_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INT;
BEGIN
  IF p_resolution = 'mark_as_sent' THEN
    UPDATE public.whatsapp_campaign_messages
    SET queue_status = 'sent',
        provider_message_id = COALESCE(p_provider_message_id, provider_message_id),
        sent_at = COALESCE(sent_at, NOW()),
        last_error = CASE WHEN p_notes IS NOT NULL THEN 'Manually reconciled: ' || p_notes ELSE last_error END,
        claim_token = NULL,
        claimed_at = NULL,
        claimed_by = NULL,
        lease_expires_at = NULL,
        updated_at = NOW()
    WHERE id = p_message_id AND queue_status = 'uncertain_delivery';
  ELSIF p_resolution = 'requeue_for_send' THEN
    UPDATE public.whatsapp_campaign_messages
    SET queue_status = 'pending',
        next_retry_at = NOW(),
        attempt_count = 0,
        last_error = CASE WHEN p_notes IS NOT NULL THEN 'Re-queued by admin: ' || p_notes ELSE 'Re-queued from quarantine' END,
        claim_token = NULL,
        claimed_at = NULL,
        claimed_by = NULL,
        lease_expires_at = NULL,
        updated_at = NOW()
    WHERE id = p_message_id AND queue_status = 'uncertain_delivery';
  ELSIF p_resolution = 'mark_as_failed' THEN
    UPDATE public.whatsapp_campaign_messages
    SET queue_status = 'failed',
        failed_at = NOW(),
        last_error = COALESCE(p_notes, 'Marked failed during manual review'),
        claim_token = NULL,
        claimed_at = NULL,
        claimed_by = NULL,
        lease_expires_at = NULL,
        updated_at = NOW()
    WHERE id = p_message_id AND queue_status = 'uncertain_delivery';
  ELSE
    RAISE EXCEPTION 'Invalid resolution action: %', p_resolution;
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

-- Restricted strictly to service_role
REVOKE ALL ON FUNCTION public.reconcile_uncertain_message(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reconcile_uncertain_message(UUID, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.reconcile_uncertain_message(UUID, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_uncertain_message(UUID, TEXT, TEXT, TEXT) TO service_role;

-- ------------------------------------------------------------------------------
-- 13. SUPABASE REALTIME PUBLICATION & REPLICA IDENTITY
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
-- 14. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

-- Backend Service Role Full Access (Express Server & Queue Worker only)
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
-- Only campaigns and campaign messages are visible to verified admins.
-- Opt-outs and raw webhook event payloads are never exposed to client subscriptions.
DROP POLICY IF EXISTS "Admin users can view whatsapp_campaigns" ON public.whatsapp_campaigns;
CREATE POLICY "Admin users can view whatsapp_campaigns"
  ON public.whatsapp_campaigns FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin users can view whatsapp_campaign_messages" ON public.whatsapp_campaign_messages;
CREATE POLICY "Admin users can view whatsapp_campaign_messages"
  ON public.whatsapp_campaign_messages FOR SELECT TO authenticated
  USING (public.is_admin());
