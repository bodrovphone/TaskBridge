# Task 07 — Build the lead-fetcher and email-sender scripts

**Effort:** 2 days
**Priority:** P0 (this is the working engine for Task 06)
**Owner:** Alex (Claude Code session)
**Reads from:** `06-gmaps-resend-outreach-automation.md` for full architecture, data model, hygiene rules

## Why this task

Task 06 describes the architecture. This task is the concrete build instruction. Two scripts, clearly split:

- **`outreach:fetch`** — autonomous, safe to schedule. Picks an open TruDify task, runs Apify Google Maps actor for that (city × sub-category), filters and saves leads. Writes a markdown log so Alex can see what's happening without opening Supabase.
- **`outreach:send`** — manual, never scheduled. Alex runs it from CLI when he's ready. Sends Resend emails with rate limiting and warm-up caps.

The split is intentional: scheduling lead-fetching is fine (worst case, you waste Apify credits). Scheduling email-sending is dangerous (worst case, you blacklist your domain).

## Components Claude Code should build

### 1. Supabase migration

Tables `outreach_campaigns` and `outreach_leads` — schema in Task 06 §"Data model". Apply via `supabase/migrations/<timestamp>_outreach_tables.sql`.

Plus a small global suppression table:

```sql
create table public.outreach_suppression (
  email text primary key,
  reason text not null,           -- 'unsubscribed', 'bounced', 'complained', 'manual'
  added_at timestamptz not null default now()
);
```

### 2. `scripts/outreach/fetch.ts`

```
npm run outreach:fetch                  # auto-picks an open task that has no recent campaign
npm run outreach:fetch -- --task-id=<uuid>   # explicit task
```

Flow:
1. **Pick a task** — query open tasks that don't already have an `outreach_campaigns` row in the last 30 days. Pick the most recent one. Print its details and confirm.
2. **Write a "started" log** — see §"Markdown log pattern" below.
3. **Build Apify input** — translate `(task.city, task.category/subcategory)` into a Google Maps query using `scripts/outreach/queries.ts`.
4. **Run Apify** — call the Apify API for an actor like `compass/google-maps-extractor`. Wait for finish. Pull results.
5. **Filter** — drop entries with no email, drop chains (denylist), drop `users.email` matches (already TruDify users), drop `outreach_leads.email` sent in last 90 days, drop suppression list matches.
6. **Insert** filtered leads into `outreach_leads` with status='queued' and link to the new `outreach_campaigns` row.
7. **Update the markdown log** with the result summary (total found, kept, skipped reasons).
8. **Optional: write a CSV next to the md** for human review.

Env vars needed: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APIFY_TOKEN`, `APIFY_ACTOR_ID`.

### 3. `scripts/outreach/send.ts`

```
npm run outreach:send                     # picks the most recent campaign with queued leads
npm run outreach:send -- --campaign-id=<uuid>
npm run outreach:send -- --campaign-id=<uuid> --max=20  # default 20 in warm-up phase
npm run outreach:send -- --dry-run                       # render emails to stdout, no send
```

Flow:
1. Print campaign summary and queued lead count. **Require explicit "yes" confirmation in the terminal** before sending. This is the human gate.
2. Read up to `--max` queued leads.
3. For each:
   - Render the email from a template file (`scripts/outreach/templates/bg.html` etc.) with lead-specific variables
   - Send via Resend SDK
   - Save `resend_message_id`, set `status='sent'`, `sent_at`
   - Sleep 30 seconds (configurable rate limit)
4. After batch: write a "sent" entry to the campaign markdown log.

Env vars: `RESEND_API_KEY_OUTREACH`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`, `OUTREACH_DAILY_CAP`.

Note: the project already has a separate `RESEND_API_KEY` for transactional notifications. The outreach key is intentionally a different variable scoped to `outreach.trudify.com` only (Sending access). Do not confuse them.

### 4. Email templates

`scripts/outreach/templates/bg.html`, `ru.html`, `uk.html`. Plain HTML, no fancy CSS (cold email looks better minimal). Each has these placeholders:

- `{{businessName}}`, `{{city}}`, `{{subCategory}}`
- `{{taskTitle}}`, `{{taskUrl}}`
- `{{unsubscribeUrl}}`
- `{{senderName}}` ("Алекс / Alex / Олексій")

Plain-text version too — Resend wants both for deliverability.

### 5. Resend webhook handler

Supabase Edge Function `supabase/functions/resend-webhook/index.ts`. Verifies signature, updates `outreach_leads` based on event type. Detail in Task 06 §"Resend webhook handler".

### 6. Unsubscribe page

Public route `/[lang]/unsubscribe?token=...`. Decodes token (signed JWT containing email + timestamp), shows "you're unsubscribed", inserts into `outreach_suppression`. **Must work without login.**

### 7. Conversion tracking trigger

Supabase trigger on `auth.users` insert: if email matches `outreach_leads.email`, update that lead row.

## Markdown log pattern

Logs live at `data/outreach/runs/`. One file per campaign. Filename: `YYYY-MM-DD__<city>__<sub_category>__<short_task_id>.md`.

**`fetch` writes the file with two sections that get appended:**

```markdown
# Outreach run — Sofia × cleaning

- **Campaign ID:** `2f8c-...`
- **Status:** `in_progress` (will flip to `fetched`, then `sent`)
- **Bait task:** [Apartement Cleaning](https://trudify.com/bg/tasks/34c80cd7-...) (`34c80cd7-...`)
- **City:** sofia
- **Sub-category:** cleaning-services
- **Apify query:** "почистване на апартаменти София"
- **Started:** 2026-04-26 14:23 UTC

## Fetch result — 2026-04-26 14:31

- Apify returned: 87 raw leads
- Kept (have email, not duplicate, not chain): **34**
- Skipped:
  - 41 — no email
  - 8 — already TruDify user
  - 3 — recent outreach (< 90 days)
  - 1 — chain (Praktiker)

- Apify run id: `abc123`
- CSV: `./leads-2f8c.csv`

Status flipped to `fetched`.
```

**`send` appends a section to the same file:**

```markdown
## Send batch — 2026-04-26 16:00

- Sent: **20**
- Remaining queued: 14
- Bounces so far: 0
- Resend daily count after batch: 20 / 50

Status flipped to `sent`.
```

**Plus an index file** at `data/outreach/INDEX.md` that lists all runs, latest first, with status badges. Both scripts append to it.

This is the "in progress / done" tracking the user wants.

## Recommended folder layout

```
scripts/outreach/
├── fetch.ts
├── send.ts
├── lib/
│   ├── supabase.ts         # service-role client
│   ├── apify.ts            # actor wrapper
│   ├── resend.ts           # SDK wrapper + rate limit
│   ├── filters.ts          # denylist, dedupe
│   ├── md-log.ts           # markdown log writer
│   └── token.ts            # signed unsubscribe tokens
├── templates/
│   ├── bg.html
│   ├── bg.txt
│   ├── ru.html
│   ├── ru.txt
│   ├── uk.html
│   └── uk.txt
└── queries.ts              # (city, sub_category) → Apify search query

data/outreach/
├── INDEX.md
└── runs/
    └── 2026-04-26__sofia__cleaning-services__34c80cd7.md
```

Add `data/outreach/runs/*.csv` to `.gitignore` (lead PII shouldn't go to git). Keep the `.md` files in git — they document campaigns over time.

## Hostinger + Resend setup (next step after Claude Code is done)

This is **outside** Claude Code's scope but important. Before sending the first real email:

1. **Pick a subdomain.** Recommended: `outreach.trudify.com` or `mail.trudify.com`. Don't reuse the main domain.
2. **In Hostinger DNS**, add records that Resend will give you:
   - **MX** (so replies route somewhere — even if just to Resend's bounce handler initially)
   - **TXT** for SPF: usually `v=spf1 include:_spf.resend.com -all`
   - **TXT for DKIM** — Resend gives you a `resend._domainkey` value
   - **TXT for DMARC** — start lenient: `v=DMARC1; p=none; rua=mailto:dmarc@trudify.com`
   - **Optional:** a `CNAME` for tracking domain Resend may suggest
3. **In Resend**, add the subdomain as a sending domain. Wait until verification turns green for all four checks.
4. **Send a test email** from the verified subdomain to your own Gmail. Check headers — SPF=pass, DKIM=pass, DMARC=pass. If any fails, fix before doing real outreach.
5. **Configure webhook** in Resend → point to `https://<your-supabase>/functions/v1/resend-webhook`. Save the signing secret to `.env`.
6. **Set Resend daily limit** in your account to your warm-up cap (20 → 50 → 100/day over 3 weeks).

Only when all six are done, run `npm run outreach:send` for the first time.

## Done when

- Migration applied, both tables exist
- `npm run outreach:fetch` end-to-end on a test campaign — log file created, leads in DB
- `npm run outreach:send -- --dry-run` renders one email correctly per locale
- `npm run outreach:send` sends 1-2 emails to your own inbox (with subdomain verified)
- Webhook updates lead status when you open / click your own test email
- Unsubscribe page works (clicks add to suppression table)
- Conversion trigger fires when a "test pro" registers with one of the outreach emails
- Index + per-campaign md log files render readable in any markdown viewer

---
**Created:** 2026-04-26
**Depends on:** Task 06 (for architecture context)
**Blocks:** running real outreach campaigns (until Hostinger DNS + Resend verification done)
