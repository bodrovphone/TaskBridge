-- =====================================================
-- MIGRATION: Profile Fields Expansion
-- Version: 001
-- Date: 2025-10-31
-- Description: Adds missing fields for customer and professional profiles
--
-- IMPORTANT: Review the audit document before running:
-- /docs/profile-crud-audit-and-plan.md
-- =====================================================

BEGIN;

-- =====================================================
-- CUSTOMER-SPECIFIC ADDITIONS
-- =====================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_contact TEXT
    CHECK (preferred_contact IN ('email', 'phone', 'sms', 'telegram'))
    DEFAULT 'email';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS total_spent_bgn DECIMAL(10, 2) DEFAULT 0;

-- =====================================================
-- PROFESSIONAL-SPECIFIC ADDITIONS
-- =====================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS professional_title TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS availability_status TEXT
    CHECK (availability_status IN ('available', 'busy', 'unavailable'))
    DEFAULT 'available';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS service_area_cities TEXT[];

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_methods TEXT[]
    DEFAULT ARRAY['cash', 'bank_transfer']::TEXT[];

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS languages TEXT[];

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS weekday_hours JSONB
    DEFAULT '{"start": "08:00", "end": "18:00"}'::jsonb;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS weekend_hours JSONB
    DEFAULT '{"start": "09:00", "end": "14:00"}'::jsonb;

-- Portfolio field skipped for MVP - see todo for future implementation

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS total_earnings_bgn DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- =====================================================
-- DATA MIGRATION: POPULATE DEFAULT VALUES
-- =====================================================

-- Populate service_area_cities from existing city field
UPDATE public.users
SET service_area_cities = ARRAY[city]
WHERE city IS NOT NULL
  AND service_area_cities IS NULL
  AND user_type IN ('professional', 'both');

-- Populate languages from existing preferred_language
UPDATE public.users
SET languages = ARRAY[preferred_language]
WHERE preferred_language IS NOT NULL
  AND languages IS NULL;

-- =====================================================
-- UPDATE NOTIFICATION_PREFERENCES STRUCTURE
-- =====================================================

-- Expand notification_preferences with new fields
UPDATE public.users
SET notification_preferences = jsonb_build_object(
  'email', COALESCE((notification_preferences->>'email')::boolean, true),
  'sms', COALESCE((notification_preferences->>'sms')::boolean, true),
  'push', COALESCE((notification_preferences->>'push')::boolean, true),
  'telegram', true,
  'taskUpdates', true,
  'weeklyDigest', false,
  'marketing', false
)
WHERE notification_preferences IS NOT NULL;

-- Set default for users with NULL notification_preferences
UPDATE public.users
SET notification_preferences = '{
  "email": true,
  "sms": true,
  "push": true,
  "telegram": true,
  "taskUpdates": true,
  "weeklyDigest": false,
  "marketing": false
}'::jsonb
WHERE notification_preferences IS NULL;

-- =====================================================
-- UPDATE PRIVACY_SETTINGS STRUCTURE
-- =====================================================

-- Expand privacy_settings with new fields
UPDATE public.users
SET privacy_settings = jsonb_build_object(
  'profileVisible', true,
  'showPhone', COALESCE((privacy_settings->>'show_phone')::boolean, false),
  'showEmail', COALESCE((privacy_settings->>'show_email')::boolean, false),
  'showContactInfo', true
)
WHERE privacy_settings IS NOT NULL;

-- Set default for users with NULL privacy_settings
UPDATE public.users
SET privacy_settings = '{
  "profileVisible": true,
  "showPhone": false,
  "showEmail": false,
  "showContactInfo": true
}'::jsonb
WHERE privacy_settings IS NULL;

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Index for availability queries
CREATE INDEX IF NOT EXISTS idx_users_availability_status
  ON public.users(availability_status)
  WHERE user_type IN ('professional', 'both');

-- GIN index for service area cities search
CREATE INDEX IF NOT EXISTS idx_users_service_area_cities
  ON public.users USING GIN(service_area_cities);

-- GIN index for payment methods search
CREATE INDEX IF NOT EXISTS idx_users_payment_methods
  ON public.users USING GIN(payment_methods);

-- GIN index for languages search
CREATE INDEX IF NOT EXISTS idx_users_languages
  ON public.users USING GIN(languages);

-- Index for profile views sorting
CREATE INDEX IF NOT EXISTS idx_users_profile_views
  ON public.users(profile_views DESC)
  WHERE user_type IN ('professional', 'both');

-- =====================================================
-- ADD COLUMN COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.users.preferred_contact IS 'User preferred contact method for notifications (email, phone, sms, telegram)';
COMMENT ON COLUMN public.users.total_spent_bgn IS 'Total amount spent by customer on completed tasks (BGN)';
COMMENT ON COLUMN public.users.professional_title IS 'Professional headline/title shown on profile card (e.g., "Professional Cleaning Services")';
COMMENT ON COLUMN public.users.availability_status IS 'Current availability status for taking new tasks (available, busy, unavailable)';
COMMENT ON COLUMN public.users.service_area_cities IS 'Array of city names where professional offers services';
COMMENT ON COLUMN public.users.payment_methods IS 'Array of accepted payment methods (cash, bank_transfer, card, crypto)';
COMMENT ON COLUMN public.users.languages IS 'Array of languages spoken by professional';
COMMENT ON COLUMN public.users.weekday_hours IS 'Working hours on weekdays (Monday-Friday) as {start, end}';
COMMENT ON COLUMN public.users.weekend_hours IS 'Working hours on weekends (Saturday-Sunday) as {start, end}';
COMMENT ON COLUMN public.users.total_earnings_bgn IS 'Total earnings from completed tasks (BGN)';
COMMENT ON COLUMN public.users.profile_views IS 'Number of times profile has been viewed by other users';

-- =====================================================
-- VERIFY MIGRATION
-- =====================================================

-- Check that all new columns exist
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  SELECT ARRAY_AGG(column_name)
  INTO missing_columns
  FROM (
    VALUES
      ('preferred_contact'),
      ('total_spent_bgn'),
      ('professional_title'),
      ('availability_status'),
      ('service_area_cities'),
      ('payment_methods'),
      ('languages'),
      ('weekday_hours'),
      ('weekend_hours'),
      ('total_earnings_bgn'),
      ('profile_views')
  ) AS expected(column_name)
  WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND columns.column_name = expected.column_name
  );

  IF missing_columns IS NOT NULL THEN
    RAISE EXCEPTION 'Migration failed: Missing columns: %', array_to_string(missing_columns, ', ');
  END IF;

  RAISE NOTICE '✅ Migration successful: All 11 new columns added';
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (Run after migration)
-- =====================================================

-- Count users with new fields populated
-- SELECT
--   COUNT(*) FILTER (WHERE preferred_contact IS NOT NULL) as with_preferred_contact,
--   COUNT(*) FILTER (WHERE service_area_cities IS NOT NULL) as with_service_areas,
--   COUNT(*) FILTER (WHERE languages IS NOT NULL) as with_languages,
--   COUNT(*) FILTER (WHERE payment_methods IS NOT NULL) as with_payment_methods
-- FROM public.users;

-- Sample notification_preferences structure
-- SELECT id, email, notification_preferences
-- FROM public.users
-- LIMIT 3;

-- Sample privacy_settings structure
-- SELECT id, email, privacy_settings
-- FROM public.users
-- LIMIT 3;
