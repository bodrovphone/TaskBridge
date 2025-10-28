-- Fix RLS infinite recursion by breaking circular dependency
-- Issue: tasks policies check applications, applications policies check tasks

-- ============================================
-- DROP PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Applicants can view tasks they applied to" ON public.tasks;
DROP POLICY IF EXISTS "Customers can view applications to their tasks" ON public.applications;

-- ============================================
-- RECREATE POLICIES WITHOUT CIRCULAR DEPENDENCY
-- ============================================

-- Instead of checking applications table, we'll rely on the task having the professional assigned
-- Professionals can view tasks they applied to ONLY if they are the selected professional
-- (The original policy was too permissive - it let applicants see tasks before being selected)
-- For now, we'll keep it simple: applicants can see tasks when they're selected
-- This is already covered by "Professionals can view assigned tasks" policy

-- For applications visibility, we'll use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_task_owner(task_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks
    WHERE id = task_id_param
    AND customer_id = auth.uid()
  );
$$;

-- Now recreate the applications policy using the function
CREATE POLICY "Customers can view applications to their tasks"
ON public.applications FOR SELECT
USING (public.is_task_owner(task_id));

-- Add a simpler policy for applicants to view tasks they applied to
-- This uses a security definer function to break the recursion
CREATE OR REPLACE FUNCTION public.has_applied_to_task(task_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications
    WHERE task_id = task_id_param
    AND professional_id = auth.uid()
  );
$$;

CREATE POLICY "Applicants can view tasks they applied to"
ON public.tasks FOR SELECT
USING (public.has_applied_to_task(id));

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.is_task_owner IS
'Security definer function to check if user owns a task. Prevents RLS recursion.';

COMMENT ON FUNCTION public.has_applied_to_task IS
'Security definer function to check if user applied to a task. Prevents RLS recursion.';
