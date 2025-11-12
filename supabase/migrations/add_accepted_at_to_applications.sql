-- Add accepted_at column to applications table
-- This field is needed to track when an application was accepted for timing-based withdrawal penalties

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;

-- Add index for querying accepted applications by date
CREATE INDEX IF NOT EXISTS idx_applications_accepted_at
ON applications(professional_id, accepted_at)
WHERE accepted_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN applications.accepted_at IS 'Timestamp when application was accepted by customer';

-- Backfill accepted_at for existing accepted applications (use responded_at as fallback)
UPDATE applications
SET accepted_at = responded_at
WHERE status = 'accepted' AND accepted_at IS NULL AND responded_at IS NOT NULL;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Added accepted_at column to applications table';
  RAISE NOTICE 'Backfilled accepted_at for existing accepted applications';
END $$;
