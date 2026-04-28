# Task 03 — Data integrity fixes

**Effort:** half day
**Priority:** P1 (cleanup, helps every future report)
**Owner:** Alex

## Why this task

While reviewing data on 2026-04-26 we found two integrity issues that make every metric on the platform untrustworthy:

1. **Ghost completed tasks** — 29 of 32 tasks with `status='completed'` have **no `completed_at` timestamp**. Almost certainly seed/test data with backfilled status. They distort completion rates badly.
2. **`tasks.applications_count` counter drift** — for example one task shows `applications_count = 8` but only 4 rows exist in the `applications` table. The counter is not in sync.

## Fix 1 — Ghost completed tasks

**Decision needed first:** are those 29 tasks real (just missing the timestamp) or fake (seed data)?

```sql
-- Inspect them first
SELECT id, created_at::date, title, city, customer_id, selected_professional_id, accepted_application_id
FROM public.tasks
WHERE status = 'completed' AND completed_at IS NULL
ORDER BY created_at DESC;
```

**If they are seed data** → either delete them, or move them to a dedicated `_seed` flag / soft-deleted state so they don't appear in production metrics.

**If they are real** but the timestamp was never written → backfill `completed_at = updated_at` (or `created_at` as a fallback). Add a NOT NULL constraint going forward, OR a CHECK that `(status='completed') = (completed_at IS NOT NULL)`.

**Recommended migration sketch:**

```sql
-- Option A: backfill if real
UPDATE public.tasks
SET completed_at = COALESCE(updated_at, created_at)
WHERE status = 'completed' AND completed_at IS NULL;

-- Option B: revert if seed
UPDATE public.tasks
SET status = 'open'
WHERE status = 'completed' AND completed_at IS NULL;

-- Then add the invariant
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_completed_status_consistency
  CHECK ((status = 'completed') = (completed_at IS NOT NULL));
```

## Fix 2 — applications_count counter drift

The counter on `public.tasks.applications_count` does not match `count(*)` from the `applications` table for many rows. Likely cause: a trigger that increments on insert but doesn't decrement on delete, OR applications get hard-deleted somewhere bypassing the trigger.

**Steps:**

1. Find all rows where the counter is wrong:
   ```sql
   SELECT t.id, t.applications_count AS counter_value,
          (SELECT COUNT(*) FROM public.applications a WHERE a.task_id = t.id) AS real_count
   FROM public.tasks t
   WHERE t.applications_count IS DISTINCT FROM
         (SELECT COUNT(*) FROM public.applications a WHERE a.task_id = t.id);
   ```
2. Recompute and update:
   ```sql
   UPDATE public.tasks t
   SET applications_count = (SELECT COUNT(*) FROM public.applications a WHERE a.task_id = t.id);
   ```
3. Find the trigger that maintains this counter (check `pg_trigger` on `applications` table) and fix it to handle DELETE and UPDATE properly. Or replace with a view / materialized view if the counter is only used for display.

## Done when

- All `status='completed'` rows either have `completed_at` set or have been moved out of the completed status
- A CHECK constraint guarantees this invariant going forward
- `applications_count` matches `count(*)` from applications for every task
- Trigger (or whatever maintains the counter) handles INSERT, UPDATE, DELETE correctly
- Migration files committed in `supabase/migrations/`
