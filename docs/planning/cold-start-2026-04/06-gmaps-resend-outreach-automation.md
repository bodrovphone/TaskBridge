# Task 06 — Google Maps → Resend cold outreach automation

**Effort:** 2-3 days for v1 (single script), then ongoing operation
**Priority:** P0 — this is the engine that feeds Task 04 (supply seeding)
**Owner:** Alex

## Why this task

We need to seed supply by reaching out to Bulgarian tradespeople. alo.bg has heavy captcha (it's their business model). Google Maps has the same pros, with **public** name + phone + website + sometimes email. We already use Apify for Google Maps in another project, so we reuse the technique.

Outreach goes via Resend (transactional email). Service-by-service, city-by-city, driven by the supply-gap heatmap from Task 02.

## End-to-end flow

```
[Heatmap — Task 02]                  pick a (city × sub_category) cell
        ↓
[Apify Google Maps actor]            search "ремонт апартаменти София" → N raw leads
        ↓
[Enrichment + filter]                follow website, extract email; skip chains, no-email, dups
        ↓
[Match to real open task]            find a TruDify task in same (city × sub_cat) for the email body
        ↓
[outreach_leads table]               persist lead + status='queued'
        ↓
[Sender worker — Resend]             rate-limited send, 1 email per 30s, max 50/day on warm-up
        ↓
[Resend webhook]                     opened, clicked, bounced, complained → write back to DB
        ↓
[Conversion tracking]                if user registers on trudify.com with same email → mark converted
```

## Data model

Two new tables in Supabase. One config table (campaigns) and one per-lead table.

```sql
create table public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  sub_category text not null,
  gmaps_query text not null,          -- e.g. "ремонт апартаменти София"
  language text not null default 'bg',-- bg, ru, uk
  task_id uuid references public.tasks(id), -- the bait task
  apify_run_id text,                  -- for traceability
  status text not null default 'draft', -- draft, running, sent, paused, done
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table public.outreach_leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.outreach_campaigns(id) on delete cascade,
  business_name text not null,
  contact_name text,
  email text not null,
  phone text,
  website text,
  gmaps_url text,
  rating numeric,
  reviews_count int,
  raw_data jsonb,                     -- full Apify row, for debugging

  -- Outreach state
  status text not null default 'queued',  -- queued, sent, bounced, opened, clicked, replied, unsubscribed, converted, skipped
  skip_reason text,
  resend_message_id text,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  unsubscribed_at timestamptz,
  converted_user_id uuid references public.users(id),
  converted_at timestamptz,

  created_at timestamptz not null default now(),
  unique (campaign_id, email)
);

create index on public.outreach_leads (campaign_id, status);
create index on public.outreach_leads (email);
```

Add a unique guard so we never email the same address across two different campaigns within 90 days:

```sql
create index outreach_leads_email_recent on public.outreach_leads (email, sent_at desc) where sent_at is not null;
```

## Components to build

### 1. Apify wrapper (Node script)

A small script `scripts/outreach/fetch_leads.ts` that:
- Takes `(city, sub_category, gmaps_query, language)` as arguments
- Calls the Apify actor (e.g. `compass/google-maps-extractor`) via API
- Waits for finish, gets results
- Inserts into `outreach_leads` with status='queued', linking to the campaign

Config table for query templates (so we don't hardcode):

```ts
// scripts/outreach/queries.ts
export const queries: Record<string, Record<string, string>> = {
  cleaning: {
    sofia:  "почистване на апартаменти София",
    varna:  "почистване на апартаменти Варна",
    burgas: "професионално почистване Бургас",
  },
  electrician: {
    sofia:  "електротехник София",
    varna:  "електротехник Варна",
  },
  // ... add as we expand
};
```

### 2. Filter & dedupe step

After Apify returns results:
- Drop leads with no email → mark `skipped`, reason "no_email"
- Drop chains (big franchises) → maintain a small denylist of names like "ALSO", "Praktiker", "Mr. Bricolage"
- Drop government / non-commercial domains (.gov.bg)
- Drop emails matching pattern `info@`, `office@` if you want only owner-style emails (optional, debatable)
- Drop duplicates against `users.email` (already on TruDify) → mark `skipped`, reason "already_user"
- Drop duplicates against `outreach_leads.email` sent within 90 days → mark `skipped`, reason "recent_outreach"

### 3. Email generator + sender

Script `scripts/outreach/send.ts` that:
- Reads next N queued leads (default 50/day)
- Generates personalised email per lead (template below)
- Sends via Resend, rate-limited 1 per 30 seconds (or a queue with delay)
- Updates `outreach_leads` with `resend_message_id`, `sent_at`, `status='sent'`

**Email template (Bulgarian, default):**

```
From: Alex from TruDify <alex@outreach.trudify.com>
Reply-To: alex@trudify.com
Subject: Имам клиент за вас в [city] — [sub_category]

Здравейте, [business_name]!

Намерих ви в Google Maps — предлагате [sub_category] в [city].

Имам клиент на TruDify, който търси точно това:
[task_title]
👉 [https://trudify.com/bg/tasks/{task_id}]

TruDify е платформа за услуги в България. Регистрацията е безплатна, без комисиона, без скрити такси. Можете да отговорите директно на клиента.

Ако не ви интересува — извинявам се за безпокойството. Можете да се отпишете тук: [unsubscribe_url]

Поздрави,
Алекс
TruDify
```

Variants for `ru` and `uk` use the same structure with translated copy.

### 4. Resend webhook handler

Supabase Edge Function `/functions/resend-webhook` that listens for Resend events:
- `email.opened` → set `opened_at`, status='opened' (if currently 'sent')
- `email.clicked` → set `clicked_at`, status='clicked'
- `email.bounced` → status='bounced', do not retry
- `email.complained` → status='unsubscribed', add to global suppression list

### 5. Conversion tracking

Add a Supabase trigger on `users` insert: if the new user's email matches an `outreach_leads.email` row with status in ('sent','opened','clicked'), update that lead to `status='converted'`, set `converted_user_id`, `converted_at`.

This lets us measure outreach → registration conversion accurately.

## Email sending hygiene (CRITICAL — don't skip)

Cold email gets your domain blacklisted fast if you're sloppy. Rules:

- **Use a subdomain dedicated to outreach** — `outreach.trudify.com` or `mail.trudify.com`. Set SPF, DKIM, DMARC for that subdomain. Never send cold email from your main domain (`trudify.com`) — keep that for transactional notifications only.
- **Warm up:** start at 20 emails/day for week 1, 50/day week 2, 100/day week 3+.
- **Bounce rate < 3%.** If higher, pause immediately and check email validation.
- **Optional but recommended:** validate emails before sending with a service like ZeroBounce or NeverBounce (~$0.005/email).
- **Always include working unsubscribe link.** GDPR + CAN-SPAM. Build a `/unsubscribe?token=...` page that adds the email to a global suppression table.
- **Reply handling:** monitor the inbox of the From address. Real humans will reply with questions or "unsubscribe me". Reply quickly and respectfully.

## CLI usage (target ergonomics)

```bash
# Step 1: fetch leads from Google Maps
npm run outreach:fetch -- --city=sofia --subcategory=cleaning --task-id=<uuid>

# Step 2: review what was fetched (manual sanity check on the first batch)
npm run outreach:review -- --campaign-id=<uuid>

# Step 3: send emails
npm run outreach:send -- --campaign-id=<uuid> --max=50

# Step 4: see results
npm run outreach:report -- --campaign-id=<uuid>
```

## Success metrics (after first 3 campaigns ~ 150 emails)

| Metric | Healthy | Concerning |
|---|---|---|
| Bounce rate | < 3% | > 5% (pause and fix) |
| Open rate | > 25% | < 15% |
| Click rate (on task link) | > 5% | < 2% |
| Registration rate | > 3% | < 1% |
| Application rate | > 1% | < 0.3% |

Numbers below "concerning" → don't scale, fix the message or the source first.

## Risks

- **Domain reputation.** Mitigation: subdomain, warm-up, validation, low daily volume.
- **GDPR complaints.** Mitigation: unsubscribe link, legitimate interest (B2B context), don't store data forever (delete leads with no engagement after 6 months).
- **Apify costs.** ~$0.005-0.02 per result depending on actor. 1000 leads ≈ $5-20. Budget cap per campaign.
- **Wasting effort on cells with no demand.** Only run campaigns for cells where the heatmap (Task 02) shows real customer demand.

## Phase 2 ideas (after v1 is stable)

- **Drip sequences:** if no reply after 5 days, send follow-up; if no reply after 12 days, send "last call".
- **A/B subject lines.** Need 100+ sends per variant for signal — not worth before scale.
- **Multi-channel:** if email bounces but lead has phone, queue for SMS or Viber outreach (manual or via tool).
- **Supabase scheduled job** to send a daily batch automatically without manual CLI.

## Files likely affected / created

- `scripts/outreach/fetch_leads.ts` — Apify wrapper
- `scripts/outreach/send.ts` — Resend sender
- `scripts/outreach/queries.ts` — query templates
- `scripts/outreach/templates/` — email templates (bg, ru, uk)
- `scripts/outreach/filters.ts` — denylist + dedupe logic
- `supabase/migrations/<timestamp>_outreach_tables.sql`
- `supabase/functions/resend-webhook/index.ts`
- `supabase/functions/unsubscribe/index.ts` (or a Next.js route)
- `app/[lang]/unsubscribe/page.tsx` — public unsubscribe page
- `.env` additions: `APIFY_TOKEN`, `APIFY_ACTOR_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`

## Done when

- All 5 components run end-to-end on a single test campaign (e.g., Sofia × cleaning, 30 leads)
- Resend domain (`outreach.trudify.com` or similar) is configured with SPF/DKIM/DMARC
- Webhook updates lead status correctly for sent/opened/clicked/bounced
- Conversion tracking wires registered users to their outreach lead
- Documented runbook: how to start a new campaign in 5 minutes

---
**Created:** 2026-04-26
