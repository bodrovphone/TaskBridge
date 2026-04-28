# Outreach run logs

This folder is the human-readable record of cold-outreach campaigns. The
TypeScript scripts under `scripts/outreach/` write here; you read here when you
want to know what happened on a given day without opening Supabase.

## Layout

```
docs/data/outreach/
├── README.md          ← you are here
├── INDEX.md           ← table of all runs, latest first (auto-maintained)
└── runs/
    ├── 2026-04-26__sofia__cleaning-services__34c80cd7.md
    ├── 2026-04-26__sofia__cleaning-services__34c80cd7.csv  ← gitignored (PII)
    └── …
```

**Filename convention** (`scripts/outreach/lib/md-log.ts`):

```
YYYY-MM-DD__<city-slug>__<sub-category-slug>__<short-task-id>.md
```

Markdown files are committed to git — they're the audit trail. CSV files are
gitignored because they contain business contact PII pulled from Google Maps.

## Lifecycle of one campaign

1. `npm run outreach:fetch` writes the file with a header section, then appends
   a `## Fetch result` section once Apify returns and the leads are filtered
   into Supabase. Status flips: `in_progress` → `fetched`.
2. `npm run outreach:send` appends a `## Send batch` section per run. Multiple
   batches accumulate under the same file. Status flips to `sent` when the
   queue drains.
3. `INDEX.md` is rewritten in full each time, with the most recent run at the
   top.

## Why `docs/data/` and not `data/`?

Task 06's spec proposed `data/outreach/`, but the scheduled task
`trudify-outreach-fetch-leads` already wrote to `docs/data/outreach/INDEX.md`
before Task 07 shipped. To keep one source of truth — and because the docs
folder is naturally where humans look for human-readable artefacts — we kept
`docs/data/outreach/`. All scripts under `scripts/outreach/lib/md-log.ts`
resolve paths relative to this folder.

## What's NOT here

- The leads themselves — they live in Supabase tables `outreach_campaigns`,
  `outreach_leads`, `outreach_suppression`. The markdown log only summarises.
- Email templates — those are in `scripts/outreach/templates/`.
- Resend webhook payloads — Supabase Edge Function logs are in the
  Supabase dashboard, not here.

## See also

- `docs/planning/cold-start-2026-04/06-gmaps-resend-outreach-automation.md` — architecture
- `docs/planning/cold-start-2026-04/07-fetcher-and-sender-scripts.md` — build spec + Hostinger DNS checklist
