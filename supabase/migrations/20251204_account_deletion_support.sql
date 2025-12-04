-- ============================================
-- Account Deletion Support Migration
-- Enables GDPR-compliant account deletion with review anonymization
-- ============================================

-- ============================================
-- 1. CREATE DELETION AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.deletion_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id UUID NOT NULL,
  deleted_user_email TEXT,
  deletion_method TEXT NOT NULL CHECK (deletion_method IN ('user_request', 'facebook_callback', 'admin')),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- store counts: tasks_cancelled, applications_withdrawn, reviews_anonymized
);

-- Index for compliance queries
CREATE INDEX idx_deletion_audit_log_deleted_at ON public.deletion_audit_log(deleted_at DESC);

-- RLS for deletion audit log (admin only - no user access)
ALTER TABLE public.deletion_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit log (no user policies)
-- This means normal users cannot see this table

-- ============================================
-- 2. MODIFY REVIEWS TABLE FOR ANONYMIZATION
-- ============================================

-- Add display name columns for anonymized users
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS reviewer_display_name TEXT,
ADD COLUMN IF NOT EXISTS reviewee_display_name TEXT;

-- Make reviewer_id nullable (for anonymized reviews)
ALTER TABLE public.reviews
ALTER COLUMN reviewer_id DROP NOT NULL;

-- Make reviewee_id nullable (for reviews about deleted users)
ALTER TABLE public.reviews
ALTER COLUMN reviewee_id DROP NOT NULL;

-- Drop existing foreign key constraints
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewee_id_fkey;

-- Re-create foreign keys with SET NULL instead of CASCADE
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewer_id_fkey
FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewee_id_fkey
FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================
-- 3. HELPER FUNCTION FOR ACCOUNT DELETION
-- ============================================

-- Function to perform account deletion (called from API with service role)
CREATE OR REPLACE FUNCTION delete_user_account(
  p_user_id UUID,
  p_deletion_method TEXT DEFAULT 'user_request'
)
RETURNS JSONB AS $$
DECLARE
  v_user_email TEXT;
  v_tasks_cancelled INTEGER := 0;
  v_applications_withdrawn INTEGER := 0;
  v_reviews_anonymized INTEGER := 0;
  v_avatar_url TEXT;
BEGIN
  -- Get user info before deletion
  SELECT email, avatar_url INTO v_user_email, v_avatar_url
  FROM public.users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- 1. Cancel open tasks (as customer)
  UPDATE public.tasks
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    cancelled_by = p_user_id,
    cancellation_reason = 'Account deleted by user'
  WHERE customer_id = p_user_id
    AND status IN ('draft', 'open');
  GET DIAGNOSTICS v_tasks_cancelled = ROW_COUNT;

  -- 2. Withdraw pending applications
  UPDATE public.applications
  SET
    status = 'withdrawn',
    withdrawn_at = NOW(),
    withdrawal_reason = 'Account deleted by user'
  WHERE professional_id = p_user_id
    AND status = 'pending';
  GET DIAGNOSTICS v_applications_withdrawn = ROW_COUNT;

  -- 3. Anonymize reviews written by this user
  UPDATE public.reviews
  SET reviewer_display_name = 'Deleted User'
  WHERE reviewer_id = p_user_id;
  GET DIAGNOSTICS v_reviews_anonymized = ROW_COUNT;

  -- 4. Anonymize reviews about this user
  UPDATE public.reviews
  SET reviewee_display_name = 'Deleted User'
  WHERE reviewee_id = p_user_id;

  -- 5. Delete messages (CASCADE will handle this, but explicit for clarity)
  DELETE FROM public.messages
  WHERE sender_id = p_user_id OR recipient_id = p_user_id;

  -- 6. Delete notifications (CASCADE will handle this)
  DELETE FROM public.notifications WHERE user_id = p_user_id;

  -- 7. Insert audit log
  INSERT INTO public.deletion_audit_log (
    deleted_user_id,
    deleted_user_email,
    deletion_method,
    metadata
  ) VALUES (
    p_user_id,
    v_user_email,
    p_deletion_method,
    jsonb_build_object(
      'tasks_cancelled', v_tasks_cancelled,
      'applications_withdrawn', v_applications_withdrawn,
      'reviews_anonymized', v_reviews_anonymized,
      'avatar_url', v_avatar_url
    )
  );

  -- 8. Delete the user (this triggers SET NULL on reviews)
  DELETE FROM public.users WHERE id = p_user_id;

  -- Return summary
  RETURN jsonb_build_object(
    'success', true,
    'tasks_cancelled', v_tasks_cancelled,
    'applications_withdrawn', v_applications_withdrawn,
    'reviews_anonymized', v_reviews_anonymized,
    'avatar_url', v_avatar_url
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role only
REVOKE ALL ON FUNCTION delete_user_account FROM PUBLIC;

-- ============================================
-- 4. PRE-FLIGHT CHECK FUNCTION
-- ============================================

-- Function to check if user can delete their account
CREATE OR REPLACE FUNCTION check_account_deletion_blockers(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_blockers JSONB := '[]'::JSONB;
  v_task RECORD;
BEGIN
  -- Check for tasks in progress (as customer)
  FOR v_task IN
    SELECT id, title, status
    FROM public.tasks
    WHERE customer_id = p_user_id
      AND status IN ('in_progress', 'pending_customer_confirmation')
  LOOP
    v_blockers := v_blockers || jsonb_build_object(
      'type', 'task_in_progress',
      'task_id', v_task.id,
      'task_title', v_task.title,
      'task_status', v_task.status,
      'role', 'customer'
    );
  END LOOP;

  -- Check for tasks in progress (as professional)
  FOR v_task IN
    SELECT id, title, status
    FROM public.tasks
    WHERE selected_professional_id = p_user_id
      AND status IN ('in_progress', 'pending_customer_confirmation')
  LOOP
    v_blockers := v_blockers || jsonb_build_object(
      'type', 'task_in_progress',
      'task_id', v_task.id,
      'task_title', v_task.title,
      'task_status', v_task.status,
      'role', 'professional'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'can_delete', jsonb_array_length(v_blockers) = 0,
    'blockers', v_blockers
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. DELETION SUMMARY FUNCTION
-- ============================================

-- Function to get summary of what will be deleted/affected
CREATE OR REPLACE FUNCTION get_deletion_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_open_tasks INTEGER;
  v_pending_applications INTEGER;
  v_reviews_written INTEGER;
  v_reviews_received INTEGER;
  v_messages INTEGER;
  v_notifications INTEGER;
BEGIN
  -- Count open tasks (will be cancelled)
  SELECT COUNT(*) INTO v_open_tasks
  FROM public.tasks
  WHERE customer_id = p_user_id AND status IN ('draft', 'open');

  -- Count pending applications (will be withdrawn)
  SELECT COUNT(*) INTO v_pending_applications
  FROM public.applications
  WHERE professional_id = p_user_id AND status = 'pending';

  -- Count reviews written (will be anonymized)
  SELECT COUNT(*) INTO v_reviews_written
  FROM public.reviews WHERE reviewer_id = p_user_id;

  -- Count reviews received (will show deleted user)
  SELECT COUNT(*) INTO v_reviews_received
  FROM public.reviews WHERE reviewee_id = p_user_id;

  -- Count messages (will be deleted)
  SELECT COUNT(*) INTO v_messages
  FROM public.messages
  WHERE sender_id = p_user_id OR recipient_id = p_user_id;

  -- Count notifications (will be deleted)
  SELECT COUNT(*) INTO v_notifications
  FROM public.notifications WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'open_tasks', v_open_tasks,
    'pending_applications', v_pending_applications,
    'reviews_written', v_reviews_written,
    'reviews_received', v_reviews_received,
    'messages', v_messages,
    'notifications', v_notifications
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
