-- Migration: Add DELETE policy for notifications table
-- Created: 2025-11-09
-- Purpose: Allow users to delete their own notifications

-- Add DELETE policy so users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Verification query (run manually after migration)
-- SELECT * FROM pg_policies WHERE tablename = 'notifications';
