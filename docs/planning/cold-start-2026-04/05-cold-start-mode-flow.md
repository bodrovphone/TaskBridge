# Task 05 — Cold-start mode: optional flow steps

**Effort:** 3-5 days
**Priority:** P1 (do AFTER Task 01 has measurement data)
**Owner:** Alex

## Why this task

Today the flow is rigid: `task → apply → accept → complete → review`. Each step blocks the next. In a cold-start marketplace with low traffic, this rigid flow leaks users at every step. The flow is appropriate for a mature, high-volume platform with payments and trust signals — not for our current state.

This task introduces a **"cold-start mode" feature flag** that makes apply / accept / complete / review **optional** and **non-blocking**. We log everything for analytics, but never gate progress on it. Once liquidity is healthy (target: ≥ 10 real tasks/day with engagement), we turn the flag off and re-introduce the gates.

**Pre-requisite:** ship Task 01 first and collect ≥ 2 weeks of click-vs-apply data. If "Show contact" clicks ≫ applications, we know the gate is the friction → green light for this task.

## Scope of changes

### A. Apply step → optional

- Customer contact is visible after one click (already done in Task 01).
- "Apply with price" remains in the UI but is **secondary action**, not primary.
- A pro can express interest without committing a price. Customer sees who is interested.

### B. Accept step → optional

- Customer can see all interested pros and contact any of them off-platform.
- "Accept this pro" still exists as an explicit action, but the flow doesn't require it.
- Internal data: track accepted vs. silently-hired (we may never know the latter — fine).

### C. Complete step → optional

- "Mark complete" is a button the customer can press whenever, never required.
- After 30 days of inactivity, auto-archive task as "abandoned" instead of forcing completion.
- Reviews are tied to completion — so if completion is rare, reviews are rare. Accept this for now.

### D. Review step → optional (already mostly is)

- After completion, prompt for review but don't lock anything if skipped.

## Feature flag

Add a runtime feature flag `cold_start_mode` (env variable, or row in `app_settings` table — there's already such a table with comment "Simple key-value store for app-wide settings").

```sql
INSERT INTO public.app_settings (key, value)
VALUES ('cold_start_mode', 'true')
ON CONFLICT (key) DO UPDATE SET value = 'true';
```

All UI gates check this flag and either enforce or skip the gate.

## Telemetry to add

So we can measure if cold-start mode actually helps:

- `task_interest_clicks` (from Task 01)
- `task_contact_revealed_at` per (task, pro) pair
- `applications` (existing)
- `applications_accepted` (existing, count where status='accepted')
- `tasks_completed_real` (status='completed' AND completed_at IS NOT NULL — see Task 03)
- `off_platform_hires_estimated` — derive from "interest revealed but task abandoned without explicit completion"

Build a simple weekly report:

```
Week of <date>:
  New tasks: X
  Tasks with ≥ 1 interest click: Y
  Tasks with ≥ 1 application: Z
  Tasks accepted: W
  Tasks completed (real): V
```

## Risks

- **Trust:** customers may worry about pros contacting them without an "official" application. Mitigation: clear UI hint that they can ignore unwanted pros and block.
- **Data quality:** we will not know who really got hired. Accepted trade-off in cold-start.
- **Spam:** pros who reveal contact and then mass-call. Mitigation: rate limit reveals per pro per day (e.g., 10/day). Ban policy unchanged.
- **Reverting:** when we switch the flag off later, customers and pros may have learned the loose flow. Plan a UX migration period.

## Files likely affected

- Task detail page (`/[lang]/tasks/[id]`)
- Customer dashboard (`/[lang]/dashboard/...`)
- Task status state machine (search for `task.status` updates)
- Notifications (some templates may need new copy)
- Feature flag wiring (`app_settings` reads, or a config util)
- Migration in `supabase/migrations/` for new event tables / columns

## Done when

- Feature flag `cold_start_mode` exists and gates all four steps
- Flag is ON in production
- Weekly report query / dashboard exists
- 4 weeks of post-launch data captured before deciding next step (turn off / iterate)
