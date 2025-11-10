-- Drop unused preferred_locale column
-- The codebase uses preferred_language instead, which is the single source of truth

-- Drop the index first
DROP INDEX IF EXISTS idx_users_preferred_locale;

-- Drop the constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_preferred_locale;

-- Drop the column
ALTER TABLE users DROP COLUMN IF EXISTS preferred_locale;

-- Verify preferred_language exists and has correct constraints
COMMENT ON COLUMN users.preferred_language IS 'User preferred language for notifications and UI (en, bg, ru) - single source of truth';
