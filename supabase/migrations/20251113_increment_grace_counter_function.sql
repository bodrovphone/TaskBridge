-- Create RPC function to increment grace period counter
-- This is called when a user creates a new task

CREATE OR REPLACE FUNCTION increment_grace_counter(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET tasks_created_since_last_review = COALESCE(tasks_created_since_last_review, 0) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION increment_grace_counter(UUID) IS
'Increments the grace period counter when a user creates a new task';
