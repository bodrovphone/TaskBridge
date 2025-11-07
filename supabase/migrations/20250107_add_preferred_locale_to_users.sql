-- Add preferred_locale column to users table
-- This column stores the user's preferred language for notifications and UI

-- Add the column (nullable, defaults to null)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_locale TEXT;

-- Add check constraint to only allow valid locales
ALTER TABLE users
ADD CONSTRAINT check_preferred_locale
CHECK (preferred_locale IS NULL OR preferred_locale IN ('en', 'bg', 'ru'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_preferred_locale ON users(preferred_locale);

-- Add comment
COMMENT ON COLUMN users.preferred_locale IS 'User preferred language for notifications and UI (en, bg, ru)';

-- Optional: Set default locale based on country or existing data
-- UPDATE users SET preferred_locale = 'bg' WHERE preferred_locale IS NULL;
