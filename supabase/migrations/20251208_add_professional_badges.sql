-- Migration: Add professional badges system
-- Date: 2025-12-08
-- Description: Adds fields for Early Adopter and Top Professional badges,
--              plus a trigger to automatically calculate Top Professional status

-- ============================================
-- 1. Add badge columns to users table
-- ============================================

-- Early Adopter badge (first 10 professionals per category)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_early_adopter BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS early_adopter_categories TEXT[] DEFAULT '{}';

-- Top Professional badge (2+ tasks completed in last 30 days)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_top_professional BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS top_professional_until TIMESTAMPTZ;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS top_professional_tasks_count INT DEFAULT 0;

-- Manual featuring (admin/pro subscribers)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.users.is_early_adopter IS 'True if professional was one of first 10 in any category';
COMMENT ON COLUMN public.users.early_adopter_categories IS 'Array of category slugs where this professional was an early adopter';
COMMENT ON COLUMN public.users.is_top_professional IS 'True if professional completed 2+ tasks in last 30 days';
COMMENT ON COLUMN public.users.top_professional_until IS 'When the Top Professional badge expires (30 days from last qualifying task)';
COMMENT ON COLUMN public.users.top_professional_tasks_count IS 'Cached count of tasks completed in last 30 days';
COMMENT ON COLUMN public.users.is_featured IS 'Manually featured by admin or pro subscription';
COMMENT ON COLUMN public.users.featured_until IS 'When manual featuring expires';

-- ============================================
-- 2. Create index for featured queries
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_featured_badges
ON public.users (is_featured, is_early_adopter, is_top_professional)
WHERE professional_title IS NOT NULL;

-- ============================================
-- 3. Create trigger function for Top Professional badge
-- ============================================

CREATE OR REPLACE FUNCTION update_top_professional_badge()
RETURNS TRIGGER AS $$
DECLARE
  task_count INT;
  prof_id UUID;
BEGIN
  -- Only run when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    prof_id := NEW.selected_professional_id;

    -- Skip if no professional assigned
    IF prof_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Count tasks completed in last 30 days by this professional
    SELECT COUNT(*) INTO task_count
    FROM tasks
    WHERE selected_professional_id = prof_id
      AND status = 'completed'
      AND completed_at >= NOW() - INTERVAL '30 days';

    -- Update professional's badge status
    UPDATE users SET
      is_top_professional = (task_count >= 2),
      top_professional_until = CASE
        WHEN task_count >= 2 THEN NOW() + INTERVAL '30 days'
        ELSE top_professional_until
      END,
      top_professional_tasks_count = task_count
    WHERE id = prof_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Create the trigger
-- ============================================

DROP TRIGGER IF EXISTS top_professional_badge_trigger ON tasks;

CREATE TRIGGER top_professional_badge_trigger
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_top_professional_badge();

-- Add comment to document the trigger
COMMENT ON FUNCTION update_top_professional_badge() IS
  'Automatically updates users Top Professional badge when task status changes to completed. Checks if professional has 2+ completed tasks in last 30 days.';
