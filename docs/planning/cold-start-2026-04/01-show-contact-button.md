# Task 01 — "Show contact" button on task page

**Effort:** 1 day
**Priority:** P0 (smallest test, biggest learning)
**Owner:** Alex

## Why this task

Today, a professional must write a message **and commit a price** before seeing customer contact info. This is heavy friction in a market (BG/RU/UA) that is used to alo.bg / OLX-style flows where the phone is visible immediately.

We suspect this gate is the main reason only 17 applications have been submitted across the platform's life, even when matching invitations were sent. Before doing a big redesign, we want a cheap test.

## What to build

On the task detail page (`/[lang]/tasks/[id]`):

1. Above the existing application form, show a primary button: **"Покажи контакт"** / **"Show contact"** / **"Показать контакт"** (translated per locale).
2. On click:
   - Reveal customer's first name + masked phone (`+359 88 *** **45`) AND a "Reveal full number" link, OR full phone if you prefer (decide based on privacy comfort)
   - Log an event in a new table `task_interest_clicks` (or reuse `notification_logs` with type `interest_revealed`)
3. The application form stays visible below — pros can still submit a formal application if they want.

## Data model

Either:

- **Option A — new table:**
  ```sql
  create table task_interest_clicks (
    id uuid primary key default gen_random_uuid(),
    task_id uuid not null references tasks(id) on delete cascade,
    professional_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (task_id, professional_id)
  );
  create index on task_interest_clicks (task_id);
  create index on task_interest_clicks (professional_id);
  ```
- **Option B — reuse existing analytics** if you already have an event log.

Pick whichever is faster. Don't over-engineer — this is a 1-day spike.

## Privacy / abuse

- Only authenticated pros can click. Anonymous visitors see a "Sign in to see contact" stub.
- Rate limit: 1 click per task per pro (the unique constraint above does it).
- Optional: notify the customer "Pro X opened your contact" — only if you want them to feel the platform is alive. Skip for v1.

## Success metric (1-2 weeks of data)

Compare on tasks created **after the change**:

- `interest_clicks_per_task` vs `applications_per_task`
- If clicks ≫ applications (e.g., 5x more clicks than apps), the apply-gate IS the friction → green light for Task 05.
- If clicks ≈ applications, the gate is not the issue, supply alone is → focus on Task 04.

## Files likely affected

- Task detail page component (search `tasks/[id]` or similar route)
- Application form component
- DB migration in `supabase/migrations/`
- Locale files (`bg.json`, `ru.json`, `uk.json` or wherever translations live)

## Done when

- Button visible and works in all 3 locales
- Clicks are recorded in DB
- Tested with a fake pro account on staging
- Deployed to production
- Simple SQL or admin view exists to compare clicks vs applications per task
