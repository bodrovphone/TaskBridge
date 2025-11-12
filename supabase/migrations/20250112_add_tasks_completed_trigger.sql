-- Migration: Add automatic tasks_completed counter trigger
-- Date: 2025-01-12
-- Description: Creates a database trigger that automatically updates the
--              users.tasks_completed counter when a task status changes
--              to/from 'completed'. This ensures the counter stays in sync
--              with actual completed tasks without requiring application logic.

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_tasks_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- When task status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Only update if there's a selected professional
    IF NEW.selected_professional_id IS NOT NULL THEN
      UPDATE users
      SET tasks_completed = COALESCE(tasks_completed, 0) + 1
      WHERE id = NEW.selected_professional_id;
    END IF;
  END IF;

  -- When task status changes from completed to something else (undo)
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    -- Only update if there's a selected professional
    IF OLD.selected_professional_id IS NOT NULL THEN
      UPDATE users
      SET tasks_completed = GREATEST(COALESCE(tasks_completed, 0) - 1, 0)
      WHERE id = OLD.selected_professional_id;
    END IF;
  END IF;

  -- When selected_professional_id changes on a completed task
  -- (transfer completed task from one professional to another - rare edge case)
  IF NEW.status = 'completed' AND
     OLD.selected_professional_id IS DISTINCT FROM NEW.selected_professional_id THEN

    -- Decrement old professional's counter (if there was one)
    IF OLD.selected_professional_id IS NOT NULL THEN
      UPDATE users
      SET tasks_completed = GREATEST(COALESCE(tasks_completed, 0) - 1, 0)
      WHERE id = OLD.selected_professional_id;
    END IF;

    -- Increment new professional's counter (if there is one)
    IF NEW.selected_professional_id IS NOT NULL THEN
      UPDATE users
      SET tasks_completed = COALESCE(tasks_completed, 0) + 1
      WHERE id = NEW.selected_professional_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS task_completed_trigger ON tasks;

CREATE TRIGGER task_completed_trigger
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_completed();

-- Add comment to document the trigger
COMMENT ON FUNCTION update_tasks_completed() IS
  'Automatically updates users.tasks_completed counter when task status changes. Handles: status -> completed, completed -> other, and selected_professional_id changes.';
