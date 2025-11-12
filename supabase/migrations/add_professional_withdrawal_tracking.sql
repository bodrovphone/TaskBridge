-- Professional Withdrawal Tracking Migration
-- This migration adds tables and fields to track professional withdrawals from accepted tasks

-- =====================================================
-- 1. Add withdrawal tracking fields to applications
-- =====================================================

-- Add withdrawal fields to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS withdraw_reason VARCHAR(50),
ADD COLUMN IF NOT EXISTS withdraw_description TEXT,
ADD COLUMN IF NOT EXISTS withdraw_timing_impact VARCHAR(20); -- 'low', 'medium', 'high'

-- Add index for querying withdrawn applications
CREATE INDEX IF NOT EXISTS idx_applications_withdrawn
ON applications(professional_id, withdrawn_at)
WHERE withdrawn_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN applications.withdrawn_at IS 'Timestamp when professional withdrew from accepted task';
COMMENT ON COLUMN applications.withdraw_reason IS 'Structured reason for withdrawal (health_emergency, capacity_issue, etc.)';
COMMENT ON COLUMN applications.withdraw_description IS 'Optional text description providing context';
COMMENT ON COLUMN applications.withdraw_timing_impact IS 'Impact level based on time since acceptance: low (<2hrs), medium (<24hrs), high (>24hrs)';

-- =====================================================
-- 2. Create professional_withdrawals tracking table
-- =====================================================

CREATE TABLE IF NOT EXISTS professional_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  timing_impact VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
  hours_since_acceptance DECIMAL(10,2) NOT NULL,
  withdrew_at TIMESTAMP NOT NULL DEFAULT NOW(),
  month_year VARCHAR(7) NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM'), -- '2025-11' for grouping
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_professional_withdrawals_professional
ON professional_withdrawals(professional_id, withdrew_at DESC);

CREATE INDEX IF NOT EXISTS idx_professional_withdrawals_month
ON professional_withdrawals(professional_id, month_year);

CREATE INDEX IF NOT EXISTS idx_professional_withdrawals_task
ON professional_withdrawals(task_id);

-- Add comments
COMMENT ON TABLE professional_withdrawals IS 'Tracks all professional withdrawals from accepted tasks for analytics and rate limiting';
COMMENT ON COLUMN professional_withdrawals.timing_impact IS 'low = <2hrs (no penalty), medium = <24hrs, high = >24hrs (reputation hit)';
COMMENT ON COLUMN professional_withdrawals.hours_since_acceptance IS 'Time between acceptance and withdrawal in hours';
COMMENT ON COLUMN professional_withdrawals.month_year IS 'Month identifier for rate limiting (e.g., 2025-11)';

-- =====================================================
-- 3. Add withdrawal stats to users table
-- =====================================================

-- Add withdrawal statistics fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_withdrawals INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS withdrawals_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_withdrawal_reset DATE,
ADD COLUMN IF NOT EXISTS withdrawal_rate DECIMAL(5,4); -- Range: 0.0000 to 1.0000 (0% to 100%)

-- Add index for professionals with high withdrawal rates
CREATE INDEX IF NOT EXISTS idx_users_withdrawal_rate
ON users(withdrawal_rate DESC)
WHERE withdrawal_rate > 0.15; -- Only index users with >15% withdrawal rate

-- Add comments
COMMENT ON COLUMN users.total_withdrawals IS 'Total number of withdrawals across all time';
COMMENT ON COLUMN users.withdrawals_this_month IS 'Number of withdrawals in current month (resets monthly)';
COMMENT ON COLUMN users.last_withdrawal_reset IS 'Last date when monthly withdrawal counter was reset';
COMMENT ON COLUMN users.withdrawal_rate IS 'Ratio of withdrawals to accepted applications (withdrawn / total_accepted)';

-- =====================================================
-- 4. Create professional_task_cooloffs table
-- =====================================================

CREATE TABLE IF NOT EXISTS professional_task_cooloffs (
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  can_reapply_at TIMESTAMP, -- NULL means never (for quality/safety withdrawals)
  cooloff_reason VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (professional_id, task_id)
);

-- Add index for checking cooloffs
CREATE INDEX IF NOT EXISTS idx_cooloffs_expiry
ON professional_task_cooloffs(professional_id, can_reapply_at)
WHERE can_reapply_at IS NOT NULL;

-- Add comments
COMMENT ON TABLE professional_task_cooloffs IS 'Tracks re-application restrictions after withdrawal';
COMMENT ON COLUMN professional_task_cooloffs.can_reapply_at IS 'Timestamp when professional can reapply. NULL = permanently restricted (quality/safety issues)';
COMMENT ON COLUMN professional_task_cooloffs.cooloff_reason IS 'Reason for restriction (e.g., quality_concerns, scope_mismatch)';

-- =====================================================
-- 5. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE professional_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_task_cooloffs ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawals
CREATE POLICY "Users can view their own withdrawals"
ON professional_withdrawals FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

-- Users can insert their own withdrawals (via API)
CREATE POLICY "Users can insert their own withdrawals"
ON professional_withdrawals FOR INSERT
TO authenticated
WITH CHECK (professional_id = auth.uid());

-- Users can view their own cooloffs
CREATE POLICY "Users can view their own cooloffs"
ON professional_task_cooloffs FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

-- Users can insert their own cooloffs (via API)
CREATE POLICY "Users can insert their own cooloffs"
ON professional_task_cooloffs FOR INSERT
TO authenticated
WITH CHECK (professional_id = auth.uid());

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function to calculate withdrawal rate for a professional
CREATE OR REPLACE FUNCTION calculate_withdrawal_rate(p_professional_id UUID)
RETURNS DECIMAL(5,4) AS $$
DECLARE
  total_accepted INT;
  total_withdrawn INT;
BEGIN
  -- Count accepted applications (including withdrawn ones)
  SELECT COUNT(*) INTO total_accepted
  FROM applications
  WHERE professional_id = p_professional_id
  AND (status = 'accepted' OR status = 'withdrawn');

  -- Count withdrawn applications
  SELECT COUNT(*) INTO total_withdrawn
  FROM applications
  WHERE professional_id = p_professional_id
  AND status = 'withdrawn';

  -- Calculate rate (avoid division by zero)
  IF total_accepted = 0 THEN
    RETURN 0.0000;
  END IF;

  RETURN ROUND((total_withdrawn::DECIMAL / total_accepted::DECIMAL), 4);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_withdrawal_rate IS 'Calculates withdrawal rate for a professional (withdrawn / accepted)';

-- Function to check if professional can withdraw (rate limiting)
CREATE OR REPLACE FUNCTION can_professional_withdraw(
  p_professional_id UUID,
  p_timing_impact VARCHAR(20)
)
RETURNS BOOLEAN AS $$
DECLARE
  current_month VARCHAR(7);
  withdrawals_count INT;
  max_withdrawals INT := 2; -- As per PRD
BEGIN
  -- Early withdrawals don't count toward limit
  IF p_timing_impact = 'low' THEN
    RETURN TRUE;
  END IF;

  current_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Count withdrawals this month (excluding early withdrawals)
  SELECT COUNT(*) INTO withdrawals_count
  FROM professional_withdrawals
  WHERE professional_id = p_professional_id
  AND month_year = current_month
  AND timing_impact != 'low';

  RETURN withdrawals_count < max_withdrawals;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_professional_withdraw IS 'Checks if professional can withdraw based on monthly limit (2 per month, excluding early withdrawals)';

-- Function to reset monthly withdrawal counters (run via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_withdrawal_counters()
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    withdrawals_this_month = 0,
    last_withdrawal_reset = CURRENT_DATE
  WHERE
    withdrawals_this_month > 0
    AND (
      last_withdrawal_reset IS NULL
      OR last_withdrawal_reset < DATE_TRUNC('month', CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_monthly_withdrawal_counters IS 'Resets monthly withdrawal counters on the 1st of each month (run via cron)';

-- =====================================================
-- 7. Triggers
-- =====================================================

-- Trigger to update withdrawal rate when application is withdrawn
CREATE OR REPLACE FUNCTION update_professional_withdrawal_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'withdrawn'
  IF NEW.status = 'withdrawn' AND (OLD.status IS NULL OR OLD.status != 'withdrawn') THEN
    UPDATE users
    SET
      total_withdrawals = total_withdrawals + 1,
      withdrawals_this_month = withdrawals_this_month + 1,
      withdrawal_rate = calculate_withdrawal_rate(NEW.professional_id)
    WHERE id = NEW.professional_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_withdrawal_stats
AFTER UPDATE ON applications
FOR EACH ROW
WHEN (NEW.status = 'withdrawn')
EXECUTE FUNCTION update_professional_withdrawal_stats();

COMMENT ON TRIGGER trigger_update_withdrawal_stats ON applications IS 'Automatically updates professional withdrawal statistics when application status changes to withdrawn';

-- =====================================================
-- 8. Validation Constraints
-- =====================================================

-- Ensure timing_impact has valid values
ALTER TABLE professional_withdrawals
ADD CONSTRAINT check_timing_impact
CHECK (timing_impact IN ('low', 'medium', 'high'));

ALTER TABLE applications
ADD CONSTRAINT check_withdraw_timing_impact
CHECK (withdraw_timing_impact IS NULL OR withdraw_timing_impact IN ('low', 'medium', 'high'));

-- Ensure withdrawal_rate is between 0 and 1
ALTER TABLE users
ADD CONSTRAINT check_withdrawal_rate
CHECK (withdrawal_rate IS NULL OR (withdrawal_rate >= 0 AND withdrawal_rate <= 1));

-- Ensure withdrawal counters are non-negative
ALTER TABLE users
ADD CONSTRAINT check_total_withdrawals
CHECK (total_withdrawals >= 0);

ALTER TABLE users
ADD CONSTRAINT check_withdrawals_this_month
CHECK (withdrawals_this_month >= 0);

-- =====================================================
-- 9. Sample Queries (Documentation)
-- =====================================================

-- Query: Get professional's withdrawal stats
-- SELECT
--   total_withdrawals,
--   withdrawals_this_month,
--   withdrawal_rate,
--   last_withdrawal_reset
-- FROM users
-- WHERE id = '<professional_id>';

-- Query: Get withdrawals this month for a professional
-- SELECT COUNT(*) as withdrawals_this_month
-- FROM professional_withdrawals
-- WHERE professional_id = '<professional_id>'
-- AND month_year = TO_CHAR(NOW(), 'YYYY-MM')
-- AND timing_impact != 'low'; -- Exclude early withdrawals

-- Query: Find professionals with high withdrawal rates
-- SELECT
--   id,
--   full_name,
--   email,
--   withdrawal_rate,
--   total_withdrawals
-- FROM users
-- WHERE withdrawal_rate > 0.20
-- ORDER BY withdrawal_rate DESC;

-- Query: Check if professional can reapply to a task
-- SELECT
--   can_reapply_at,
--   cooloff_reason,
--   CASE
--     WHEN can_reapply_at IS NULL THEN false
--     WHEN can_reapply_at > NOW() THEN false
--     ELSE true
--   END as can_apply_now
-- FROM professional_task_cooloffs
-- WHERE professional_id = '<professional_id>'
-- AND task_id = '<task_id>';

-- =====================================================
-- 10. Grant Permissions
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON professional_withdrawals TO authenticated;
GRANT SELECT ON professional_task_cooloffs TO authenticated;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION calculate_withdrawal_rate TO authenticated;
GRANT EXECUTE ON FUNCTION can_professional_withdraw TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Professional withdrawal tracking migration completed successfully';
  RAISE NOTICE 'Added withdrawal tracking to applications table';
  RAISE NOTICE 'Created professional_withdrawals table for analytics';
  RAISE NOTICE 'Created professional_task_cooloffs table for re-application rules';
  RAISE NOTICE 'Added withdrawal stats to users table';
  RAISE NOTICE 'Created helper functions for rate limiting and stats calculation';
  RAISE NOTICE 'Enabled RLS policies for data security';
END $$;
