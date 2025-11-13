-- Customer Remove Professional Tracking Migration
-- This migration adds tables and fields to track customer removals of professionals from tasks

-- =====================================================
-- 1. Add removal tracking fields to applications
-- =====================================================

-- Add removal fields to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS removed_by_customer_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS removal_reason VARCHAR(50),
ADD COLUMN IF NOT EXISTS removal_description TEXT,
ADD COLUMN IF NOT EXISTS days_worked_before_removal INT;

-- Update status check constraint to include 'removed_by_customer'
ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
ADD CONSTRAINT applications_status_check
CHECK (status IN (
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
  'removed_by_customer'
));

-- Add index for querying removed applications
CREATE INDEX IF NOT EXISTS idx_applications_removed_by_customer
ON applications(professional_id, removed_by_customer_at)
WHERE removed_by_customer_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN applications.removed_by_customer_at IS 'Timestamp when customer removed professional from task';
COMMENT ON COLUMN applications.removal_reason IS 'Structured reason for removal (professional_unresponsive, quality_concerns, etc.)';
COMMENT ON COLUMN applications.removal_description IS 'Optional text description providing context';
COMMENT ON COLUMN applications.days_worked_before_removal IS 'Number of days professional worked before being removed';

-- =====================================================
-- 2. Create customer_professional_removals tracking table
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_professional_removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  days_worked INT NOT NULL,
  removed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  month_year VARCHAR(7) NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM'), -- '2025-11' for grouping
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_customer_removals_customer
ON customer_professional_removals(customer_id, removed_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_removals_month
ON customer_professional_removals(customer_id, month_year);

CREATE INDEX IF NOT EXISTS idx_customer_removals_professional
ON customer_professional_removals(professional_id);

CREATE INDEX IF NOT EXISTS idx_customer_removals_task
ON customer_professional_removals(task_id);

-- Add comments
COMMENT ON TABLE customer_professional_removals IS 'Tracks all customer removals of professionals for analytics and rate limiting';
COMMENT ON COLUMN customer_professional_removals.days_worked IS 'Number of days between acceptance and removal';
COMMENT ON COLUMN customer_professional_removals.month_year IS 'Month identifier for rate limiting (e.g., 2025-11)';

-- =====================================================
-- 3. Add removal stats to users table
-- =====================================================

-- Add removal statistics fields for customers
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_professionals_removed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS removals_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_removal_reset DATE,
ADD COLUMN IF NOT EXISTS removal_rate DECIMAL(5,4); -- Range: 0.0000 to 1.0000 (0% to 100%)

-- Add index for customers with high removal rates
CREATE INDEX IF NOT EXISTS idx_users_removal_rate
ON users(removal_rate DESC)
WHERE removal_rate > 0.20; -- Only index users with >20% removal rate

-- Add comments
COMMENT ON COLUMN users.total_professionals_removed IS 'Total number of professionals removed by customer across all time';
COMMENT ON COLUMN users.removals_this_month IS 'Number of removals in current month (resets monthly)';
COMMENT ON COLUMN users.last_removal_reset IS 'Last date when monthly removal counter was reset';
COMMENT ON COLUMN users.removal_rate IS 'Ratio of removals to hired professionals (removed / hired)';

-- =====================================================
-- 4. Create customer_professional_restrictions table
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_professional_restrictions (
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  can_rehire_at TIMESTAMP, -- NULL means never for this task (quality/safety issues)
  reason VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (customer_id, professional_id, task_id)
);

-- Add index for checking restrictions
CREATE INDEX IF NOT EXISTS idx_customer_restrictions_expiry
ON customer_professional_restrictions(customer_id, professional_id, can_rehire_at)
WHERE can_rehire_at IS NOT NULL;

-- Add comments
COMMENT ON TABLE customer_professional_restrictions IS 'Tracks re-hiring restrictions after customer removes professional';
COMMENT ON COLUMN customer_professional_restrictions.can_rehire_at IS 'Timestamp when customer can rehire professional for this task. NULL = permanently restricted (quality/safety issues)';
COMMENT ON COLUMN customer_professional_restrictions.reason IS 'Reason for restriction (e.g., quality_concerns, safety_issues)';

-- =====================================================
-- 5. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE customer_professional_removals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_professional_restrictions ENABLE ROW LEVEL SECURITY;

-- Customers can view their own removals
CREATE POLICY "Customers can view their own removals"
ON customer_professional_removals FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

-- Customers can insert their own removals (via API)
CREATE POLICY "Customers can insert their own removals"
ON customer_professional_removals FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

-- Professionals can view removals where they were removed
CREATE POLICY "Professionals can view removals about them"
ON customer_professional_removals FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

-- Customers can view their own restrictions
CREATE POLICY "Customers can view their own restrictions"
ON customer_professional_restrictions FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

-- Professionals can view restrictions about them
CREATE POLICY "Professionals can view restrictions about them"
ON customer_professional_restrictions FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

-- Customers can insert their own restrictions (via API)
CREATE POLICY "Customers can insert their own restrictions"
ON customer_professional_restrictions FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function to calculate removal rate for a customer
CREATE OR REPLACE FUNCTION calculate_customer_removal_rate(p_customer_id UUID)
RETURNS DECIMAL(5,4) AS $$
DECLARE
  total_hired INT;
  total_removed INT;
BEGIN
  -- Count all professionals hired (tasks that had selected_professional_id)
  SELECT COUNT(DISTINCT selected_professional_id) INTO total_hired
  FROM tasks
  WHERE customer_id = p_customer_id
  AND selected_professional_id IS NOT NULL;

  -- Count removed professionals
  SELECT COUNT(*) INTO total_removed
  FROM customer_professional_removals
  WHERE customer_id = p_customer_id;

  -- Calculate rate (avoid division by zero)
  IF total_hired = 0 THEN
    RETURN 0.0000;
  END IF;

  RETURN ROUND((total_removed::DECIMAL / total_hired::DECIMAL), 4);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_customer_removal_rate IS 'Calculates removal rate for a customer (removed / hired)';

-- Function to check if customer can remove professional (rate limiting)
CREATE OR REPLACE FUNCTION can_customer_remove_professional(p_customer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_month VARCHAR(7);
  removals_count INT;
  max_removals INT := 1; -- As per PRD: stricter than professional (1 vs 2)
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Count removals this month
  SELECT COUNT(*) INTO removals_count
  FROM customer_professional_removals
  WHERE customer_id = p_customer_id
  AND month_year = current_month;

  RETURN removals_count < max_removals;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_customer_remove_professional IS 'Checks if customer can remove professional based on monthly limit (1 per month)';

-- Function to get customer removal stats
CREATE OR REPLACE FUNCTION get_customer_removal_stats(p_customer_id UUID)
RETURNS TABLE (
  removals_this_month INT,
  max_per_month INT,
  total_removals INT,
  removal_rate DECIMAL(5,4),
  can_remove BOOLEAN
) AS $$
DECLARE
  current_month VARCHAR(7);
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');

  RETURN QUERY
  SELECT
    COUNT(*)::INT as removals_this_month,
    1 as max_per_month,
    (SELECT total_professionals_removed FROM users WHERE id = p_customer_id),
    calculate_customer_removal_rate(p_customer_id),
    can_customer_remove_professional(p_customer_id)
  FROM customer_professional_removals
  WHERE customer_id = p_customer_id
  AND month_year = current_month;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_customer_removal_stats IS 'Gets comprehensive removal statistics for a customer';

-- Function to reset monthly removal counters (run via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_removal_counters()
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    removals_this_month = 0,
    last_removal_reset = CURRENT_DATE
  WHERE
    removals_this_month > 0
    AND (
      last_removal_reset IS NULL
      OR last_removal_reset < DATE_TRUNC('month', CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_monthly_removal_counters IS 'Resets monthly removal counters on the 1st of each month (run via cron)';

-- =====================================================
-- 7. Triggers
-- =====================================================

-- Trigger to update removal rate when professional is removed
CREATE OR REPLACE FUNCTION update_customer_removal_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'removed_by_customer'
  IF NEW.status = 'removed_by_customer' AND (OLD.status IS NULL OR OLD.status != 'removed_by_customer') THEN
    -- Get customer_id from task
    DECLARE
      v_customer_id UUID;
    BEGIN
      SELECT customer_id INTO v_customer_id
      FROM tasks
      WHERE id = NEW.task_id;

      -- Update customer stats
      UPDATE users
      SET
        total_professionals_removed = total_professionals_removed + 1,
        removals_this_month = removals_this_month + 1,
        removal_rate = calculate_customer_removal_rate(v_customer_id)
      WHERE id = v_customer_id;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_removal_stats
AFTER UPDATE ON applications
FOR EACH ROW
WHEN (NEW.status = 'removed_by_customer')
EXECUTE FUNCTION update_customer_removal_stats();

COMMENT ON TRIGGER trigger_update_customer_removal_stats ON applications IS 'Automatically updates customer removal statistics when application status changes to removed_by_customer';

-- =====================================================
-- 8. Validation Constraints
-- =====================================================

-- Ensure removal_rate is between 0 and 1
ALTER TABLE users
ADD CONSTRAINT check_removal_rate
CHECK (removal_rate IS NULL OR (removal_rate >= 0 AND removal_rate <= 1));

-- Ensure removal counters are non-negative
ALTER TABLE users
ADD CONSTRAINT check_total_professionals_removed
CHECK (total_professionals_removed >= 0);

ALTER TABLE users
ADD CONSTRAINT check_removals_this_month
CHECK (removals_this_month >= 0);

-- Ensure days_worked is non-negative
ALTER TABLE customer_professional_removals
ADD CONSTRAINT check_days_worked
CHECK (days_worked >= 0);

-- =====================================================
-- 9. Sample Queries (Documentation)
-- =====================================================

-- Query: Get customer's removal stats
-- SELECT * FROM get_customer_removal_stats('<customer_id>');

-- Query: Check if customer can remove professional
-- SELECT can_customer_remove_professional('<customer_id>');

-- Query: Find customers with high removal rates
-- SELECT
--   id,
--   full_name,
--   email,
--   removal_rate,
--   total_professionals_removed
-- FROM users
-- WHERE removal_rate > 0.25
-- ORDER BY removal_rate DESC;

-- Query: Check if customer can re-hire professional for a task
-- SELECT
--   can_rehire_at,
--   reason,
--   CASE
--     WHEN can_rehire_at IS NULL THEN false
--     WHEN can_rehire_at > NOW() THEN false
--     ELSE true
--   END as can_rehire_now
-- FROM customer_professional_restrictions
-- WHERE customer_id = '<customer_id>'
-- AND professional_id = '<professional_id>'
-- AND task_id = '<task_id>';

-- =====================================================
-- 10. Grant Permissions
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON customer_professional_removals TO authenticated;
GRANT SELECT ON customer_professional_restrictions TO authenticated;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION calculate_customer_removal_rate TO authenticated;
GRANT EXECUTE ON FUNCTION can_customer_remove_professional TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_removal_stats TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Customer removal tracking migration completed successfully';
  RAISE NOTICE 'Added removal tracking to applications table';
  RAISE NOTICE 'Created customer_professional_removals table for analytics';
  RAISE NOTICE 'Created customer_professional_restrictions table for re-hiring rules';
  RAISE NOTICE 'Added removal stats to users table';
  RAISE NOTICE 'Created helper functions for rate limiting and stats calculation';
  RAISE NOTICE 'Enabled RLS policies for data security';
END $$;
