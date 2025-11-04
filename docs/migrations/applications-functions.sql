-- ============================================
-- Database Functions for Applications Count
-- ============================================
-- These functions are used by the applications API to maintain
-- accurate applications_count on tasks table

-- Function to increment applications_count when a new application is submitted
CREATE OR REPLACE FUNCTION increment_applications_count(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tasks
  SET
    applications_count = COALESCE(applications_count, 0) + 1,
    updated_at = NOW()
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement applications_count when an application is withdrawn
CREATE OR REPLACE FUNCTION decrement_applications_count(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tasks
  SET
    applications_count = GREATEST(COALESCE(applications_count, 0) - 1, 0),
    updated_at = NOW()
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate applications_count (for fixing inconsistencies)
CREATE OR REPLACE FUNCTION recalculate_applications_count(task_id UUID)
RETURNS INTEGER AS $$
DECLARE
  app_count INTEGER;
BEGIN
  -- Count non-withdrawn applications
  SELECT COUNT(*)
  INTO app_count
  FROM public.applications
  WHERE
    applications.task_id = recalculate_applications_count.task_id
    AND applications.status != 'withdrawn';

  -- Update task
  UPDATE public.tasks
  SET
    applications_count = app_count,
    updated_at = NOW()
  WHERE id = task_id;

  RETURN app_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_applications_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_applications_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_applications_count(UUID) TO authenticated;
