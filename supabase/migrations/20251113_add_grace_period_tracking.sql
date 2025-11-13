-- Add grace period counter to users table for review enforcement
-- This tracks how many tasks a customer has created since their last review submission

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS tasks_created_since_last_review INTEGER DEFAULT 0;

-- Add index for faster queries on enforcement checks
CREATE INDEX IF NOT EXISTS idx_users_grace_period
ON public.users(id, tasks_created_since_last_review);

-- Add comment for documentation
COMMENT ON COLUMN public.users.tasks_created_since_last_review IS
'Tracks how many tasks created since last review submission (for 3-task grace period enforcement)';
