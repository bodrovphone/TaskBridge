-- Migration: Sync tasks_completed counter with actual completed tasks
-- Date: 2025-01-12
-- Description: Updates the tasks_completed counter for all professionals
--              to match the actual count of completed tasks they've done.
--              This is a one-time sync to fix stale counter data.

-- Update all users' tasks_completed counter based on actual completed tasks
UPDATE users
SET tasks_completed = (
  SELECT COUNT(*)
  FROM tasks
  WHERE tasks.selected_professional_id = users.id
  AND tasks.status = 'completed'
)
WHERE id IN (
  SELECT DISTINCT selected_professional_id
  FROM tasks
  WHERE selected_professional_id IS NOT NULL
  AND status = 'completed'
);

-- Also set tasks_completed to 0 for professionals who have no completed tasks
-- (in case they had a stale non-zero value)
UPDATE users
SET tasks_completed = 0
WHERE tasks_completed IS NULL
OR (tasks_completed > 0 AND id NOT IN (
  SELECT DISTINCT selected_professional_id
  FROM tasks
  WHERE selected_professional_id IS NOT NULL
  AND status = 'completed'
));

-- Add a comment to document this field
COMMENT ON COLUMN users.tasks_completed IS 'Auto-updated counter of completed tasks. Maintained by task_completed_trigger.';
