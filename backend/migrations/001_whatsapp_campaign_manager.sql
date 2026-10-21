-- ==============================================================================
-- The Forge Properties: WhatsApp Campaign Manager Database Migration
-- Script: 001_whatsapp_campaign_manager.sql
-- Description: Creates WhatsApp campaigns, campaign messages queue, opt-outs, 
--              webhook tracking tables, consent tracking on webinar_leads, 
--              and configures Supabase Row Level Security (RLS).
-- ==============================================================================

-- 1. Extend webinar_leads table with WhatsApp consent fields
ALTER TABLE public.webinar_leads
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_source TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_webinar_leads_whatsapp_opt_in
  ON public.webinar_leads(whatsapp_opt_in);

CREATE INDEX IF NOT EXISTS idx_webinar_leads_whatsapp_opt_out_at
  ON public.webinar_leads(whatsapp_opt_out_at);

-- 2. Create whatsapp_campaigns table
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_language TEXT NOT NULL DEFAULT 'en',
  template_variables JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'queued', 'processing', 'paused', 'completed', 'cancelled')),
  created_by TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  total_recipients INT NOT NULL DEFAULT 0,
  queued_count INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  delivered_count INT NOT NULL DEFAULT 0,
  read_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  opted_out_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status
  ON public.whatsapp_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_created_at
  ON public.whatsapp_campaigns(created_at DESC);

-- 3. Create whatsapp_campaign_messages queue table
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  lead_id BIGINT,
  recipient_number TEXT NOT NULL,
  recipient_name TEXT NOT NULL DEFAULT 'Valued Investor',
  template_name TEXT NOT NULL,
  template_variables JSONB DEFAULT '{}'::jsonb,
  queue_status TEXT NOT NULL DEFAULT 'pending' CHECK (queue_status IN ('pending', 'processing', 'sent', 'delivered', 'read', 'failed', 'cancelled', 'skipped')),
  provider_message_id TEXT,
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
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
  ON public.whatsapp_campaign_messages(provider_message_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_retry
  ON public.whatsapp_campaign_messages(queue_status, next_retry_at)
  WHERE queue_status IN ('pending', 'processing');

-- 4. Create whatsapp_opt_outs table
CREATE TABLE IF NOT EXISTS public.whatsapp_opt_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  reason TEXT,
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_opt_outs_phone
  ON public.whatsapp_opt_outs(phone_number);

-- 5. Create whatsapp_webhook_events deduplication table
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

-- 6. Trigger to automatically keep updated_at in sync
CREATE OR REPLACE FUNCTION public.update_whatsapp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- 7. Configure Supabase Row-Level Security (RLS)
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role bypass for backend queue worker
DROP POLICY IF EXISTS "Service role full access on whatsapp_campaigns" ON public.whatsapp_campaigns;
CREATE POLICY "Service role full access on whatsapp_campaigns"
  ON public.whatsapp_campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on whatsapp_campaign_messages" ON public.whatsapp_campaign_messages;
CREATE POLICY "Service role full access on whatsapp_campaign_messages"
  ON public.whatsapp_campaign_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on whatsapp_opt_outs" ON public.whatsapp_opt_outs;
CREATE POLICY "Service role full access on whatsapp_opt_outs"
  ON public.whatsapp_opt_outs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on whatsapp_webhook_events" ON public.whatsapp_webhook_events;
CREATE POLICY "Service role full access on whatsapp_webhook_events"
  ON public.whatsapp_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated Admin Access
DROP POLICY IF EXISTS "Authenticated users read whatsapp_campaigns" ON public.whatsapp_campaigns;
CREATE POLICY "Authenticated users read whatsapp_campaigns"
  ON public.whatsapp_campaigns
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users read whatsapp_campaign_messages" ON public.whatsapp_campaign_messages;
CREATE POLICY "Authenticated users read whatsapp_campaign_messages"
  ON public.whatsapp_campaign_messages
  FOR SELECT
  TO authenticated
  USING (true);
