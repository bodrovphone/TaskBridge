-- Migration: Add 'unclear' budget type option
-- Date: 2025-10-30
-- Description: Add 'unclear' as a valid budget_type option for customers who are unsure about pricing

-- Drop the existing check constraint
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_budget_type_check;

-- Add the new check constraint with 'unclear' included
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_budget_type_check
CHECK (budget_type IN ('fixed', 'hourly', 'negotiable', 'unclear'));

-- Update the default to 'unclear' for new tasks
ALTER TABLE public.tasks
ALTER COLUMN budget_type SET DEFAULT 'unclear';

-- Add a comment explaining the budget_type values
COMMENT ON COLUMN public.tasks.budget_type IS
'Budget type: fixed (fixed price), hourly (hourly rate), negotiable (open for discussion), unclear (customer unsure about pricing)';
