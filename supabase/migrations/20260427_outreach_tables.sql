-- Cold-start initiative (April 2026): outreach automation tables.
-- Owners: scripts/outreach/{fetch,send}.ts and supabase/functions/resend-webhook.
--
-- Three tables:
--   1. outreach_campaigns — one per (city × sub_category × bait task) pull
--   2. outreach_leads     — one row per business email Apify returned and we kept
--   3. outreach_suppression — global do-not-email list (unsubscribes, bounces, complaints)
--
-- Plus a trigger on auth.users insert that flips a matching outreach_leads row to
-- status='converted' when the prospect actually registers on TruDify.
--
-- All three tables are service-role only (no RLS policies for end users). Scripts
-- run with SUPABASE_SERVICE_ROLE_KEY; clients should never touch these directly.

-- ---------------------------------------------------------------------------
-- outreach_campaigns
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outreach_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city            TEXT NOT NULL,
  sub_category    TEXT NOT NULL,
  gmaps_query     TEXT NOT NULL,
  language        TEXT NOT NULL DEFAULT 'bg',  -- bg, ru, uk
  task_id         UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  apify_run_id    TEXT,
  status          TEXT NOT NULL DEFAULT 'draft',
                   -- draft, in_progress, fetched, sent, paused, done, failed
  log_path        TEXT,                         -- relative path to docs/data/outreach/runs/<file>.md
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_task_id
  ON public.outreach_campaigns (task_id);
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_created_at
  ON public.outreach_campaigns (created_at DESC);

ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
-- No policies = no client access. Service role bypasses RLS.

-- ---------------------------------------------------------------------------
-- outreach_leads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outreach_leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         UUID NOT NULL REFERENCES public.outreach_campaigns(id) ON DELETE CASCADE,

  -- Lead identity (from Apify)
  business_name       TEXT NOT NULL,
  contact_name        TEXT,
  email               TEXT NOT NULL,
  phone               TEXT,
  website             TEXT,
  gmaps_url           TEXT,
  rating              NUMERIC,
  reviews_count       INT,
  raw_data            JSONB,

  -- Outreach state
  status              TEXT NOT NULL DEFAULT 'queued',
                       -- queued, sent, bounced, opened, clicked, replied,
                       -- unsubscribed, converted, skipped, failed
  skip_reason         TEXT,
  resend_message_id   TEXT,
  sent_at             TIMESTAMPTZ,
  opened_at           TIMESTAMPTZ,
  clicked_at          TIMESTAMPTZ,
  replied_at          TIMESTAMPTZ,
  unsubscribed_at     TIMESTAMPTZ,
  bounced_at          TIMESTAMPTZ,
  complained_at       TIMESTAMPTZ,
  converted_user_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  converted_at        TIMESTAMPTZ,
  last_error          TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_outreach_leads_campaign_status
  ON public.outreach_leads (campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_email
  ON public.outreach_leads (email);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_email_recent
  ON public.outreach_leads (email, sent_at DESC) WHERE sent_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outreach_leads_resend_message_id
  ON public.outreach_leads (resend_message_id) WHERE resend_message_id IS NOT NULL;

ALTER TABLE public.outreach_leads ENABLE ROW LEVEL SECURITY;
-- No policies = no client access. Service role bypasses RLS.

-- ---------------------------------------------------------------------------
-- outreach_suppression  (global do-not-email list)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outreach_suppression (
  email       TEXT PRIMARY KEY,
  reason      TEXT NOT NULL,        -- 'unsubscribed', 'bounced', 'complained', 'manual'
  source_lead_id UUID REFERENCES public.outreach_leads(id) ON DELETE SET NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.outreach_suppression ENABLE ROW LEVEL SECURITY;
-- No policies = no client access.

-- ---------------------------------------------------------------------------
-- Conversion trigger: when a new auth.users row appears with an email that
-- matches an outreach_leads.email (and the lead has been sent at least once),
-- flip that lead to status='converted'.
--
-- Triggers on auth.users (managed by Supabase Auth) — that's where new
-- registrations land first; the public.users row is created later by the
-- profile-creation flow but the email may be normalized differently, so we
-- match against auth.users.email which is canonical.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.outreach_track_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.outreach_leads
     SET status            = 'converted',
         converted_user_id = NEW.id,
         converted_at      = NOW()
   WHERE LOWER(email) = LOWER(NEW.email)
     AND status IN ('sent', 'opened', 'clicked', 'replied');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS outreach_track_conversion_on_auth_users ON auth.users;
CREATE TRIGGER outreach_track_conversion_on_auth_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.outreach_track_conversion();

COMMENT ON TABLE public.outreach_campaigns IS
  'Cold outreach campaigns (one per city × sub_category × bait task). Service-role access only.';
COMMENT ON TABLE public.outreach_leads IS
  'Per-lead state for cold outreach campaigns. Service-role access only.';
COMMENT ON TABLE public.outreach_suppression IS
  'Global do-not-email list. Populated by unsubscribe page, Resend webhook, and manual entries.';
