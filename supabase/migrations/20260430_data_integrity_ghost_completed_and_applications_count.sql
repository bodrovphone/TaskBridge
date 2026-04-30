-- Cold-start (April 2026) Task 03: data integrity fixes.
--
-- Fix 1 — Ghost completed tasks
--   29 rows currently have status='completed' but completed_at IS NULL. Pattern
--   confirms seed data: batch updated_at clusters on 2026-02-19 / 2026-03-23,
--   none have accepted_application_id. Cancel them (reversible, audit-friendly,
--   removes them from completion metrics) and add a CHECK constraint.
--
-- Fix 2 — applications_count counter drift
--   15+ tasks show counter > real count. No DB trigger exists; counter was
--   maintained only in application code which missed paths. Recompute now and
--   install a DB trigger so it stays correct regardless of code path.

-- ===========================================================================
-- FIX 1: ghost completed tasks
-- ===========================================================================

UPDATE public.tasks
   SET status              = 'cancelled',
       cancelled_at        = COALESCE(updated_at, NOW()),
       cancellation_reason = 'seed-data-cleanup-2026-04-30'
 WHERE status = 'completed'
   AND completed_at IS NULL;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_completed_status_consistency
  CHECK ((status = 'completed') = (completed_at IS NOT NULL));

-- ===========================================================================
-- FIX 2: applications_count drift + trigger
-- ===========================================================================

-- One-shot recompute.
UPDATE public.tasks t
   SET applications_count = sub.real_count
  FROM (
    SELECT task_id, COUNT(*)::int AS real_count
      FROM public.applications
     GROUP BY task_id
  ) AS sub
 WHERE t.id = sub.task_id
   AND t.applications_count IS DISTINCT FROM sub.real_count;

-- Tasks with no applications at all but a non-zero counter.
UPDATE public.tasks t
   SET applications_count = 0
 WHERE t.applications_count <> 0
   AND NOT EXISTS (SELECT 1 FROM public.applications a WHERE a.task_id = t.id);

-- Trigger function: keep applications_count in sync on INSERT / DELETE / UPDATE.
CREATE OR REPLACE FUNCTION public.applications_count_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tasks
       SET applications_count = applications_count + 1
     WHERE id = NEW.task_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tasks
       SET applications_count = GREATEST(applications_count - 1, 0)
     WHERE id = OLD.task_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.task_id IS DISTINCT FROM NEW.task_id THEN
    -- An application moving between tasks (very rare). Adjust both sides.
    UPDATE public.tasks
       SET applications_count = GREATEST(applications_count - 1, 0)
     WHERE id = OLD.task_id;
    UPDATE public.tasks
       SET applications_count = applications_count + 1
     WHERE id = NEW.task_id;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS applications_count_sync_trg ON public.applications;
CREATE TRIGGER applications_count_sync_trg
AFTER INSERT OR UPDATE OF task_id OR DELETE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.applications_count_sync();

COMMENT ON FUNCTION public.applications_count_sync() IS
  'Keeps tasks.applications_count in sync with applications row count. '
  'Installed 2026-04-30 (cold-start Task 03) after counter was found drifted; '
  'previously the counter was maintained only in application code.';
