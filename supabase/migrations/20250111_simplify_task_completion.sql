-- Simplify task completion flow
-- Remove the pending_customer_confirmation status in favor of direct completion
-- Either party (professional or customer) can mark a task as completed

-- Update any existing tasks in pending_customer_confirmation to completed
UPDATE tasks
SET
  status = 'completed',
  completed_at = COALESCE(completed_at, completed_by_professional_at, NOW()),
  updated_at = NOW()
WHERE status = 'pending_customer_confirmation';

-- Add comment to clarify the completion flow
COMMENT ON COLUMN tasks.status IS 'Task status. Use "completed" directly when either party marks task done. Reviews handle quality control.';
COMMENT ON COLUMN tasks.completed_by_professional_at IS 'Timestamp when professional marked task complete. For tracking only, not blocking.';
COMMENT ON COLUMN tasks.confirmed_by_customer_at IS 'Deprecated - no longer used. Left for historical data.';
