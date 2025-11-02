-- =====================================================
-- ROLLBACK: Profile Fields Expansion
-- Version: 001
-- Date: 2025-10-31
-- Description: Removes fields added by 001-profile-fields-expansion.sql
--
-- ⚠️ WARNING: This will permanently delete data in these columns!
-- Only run this if you need to undo the migration.
-- =====================================================

BEGIN;

-- Drop indexes first
DROP INDEX IF EXISTS idx_users_availability_status;
DROP INDEX IF EXISTS idx_users_service_area_cities;
DROP INDEX IF EXISTS idx_users_payment_methods;
DROP INDEX IF EXISTS idx_users_languages;
DROP INDEX IF EXISTS idx_users_profile_views;

-- Drop columns
ALTER TABLE public.users
  DROP COLUMN IF EXISTS preferred_contact,
  DROP COLUMN IF EXISTS total_spent_bgn,
  DROP COLUMN IF EXISTS professional_title,
  DROP COLUMN IF EXISTS availability_status,
  DROP COLUMN IF EXISTS service_area_cities,
  DROP COLUMN IF EXISTS payment_methods,
  DROP COLUMN IF EXISTS languages,
  DROP COLUMN IF EXISTS weekday_hours,
  DROP COLUMN IF EXISTS weekend_hours,
  DROP COLUMN IF EXISTS portfolio,
  DROP COLUMN IF EXISTS total_earnings_bgn,
  DROP COLUMN IF EXISTS profile_views;

-- Revert notification_preferences to simple structure
UPDATE public.users
SET notification_preferences = jsonb_build_object(
  'email', COALESCE((notification_preferences->>'email')::boolean, true),
  'sms', COALESCE((notification_preferences->>'sms')::boolean, true),
  'push', COALESCE((notification_preferences->>'push')::boolean, true)
)
WHERE notification_preferences IS NOT NULL;

-- Revert privacy_settings to simple structure
UPDATE public.users
SET privacy_settings = jsonb_build_object(
  'show_phone', COALESCE((privacy_settings->>'showPhone')::boolean, false),
  'show_email', COALESCE((privacy_settings->>'showEmail')::boolean, false)
)
WHERE privacy_settings IS NOT NULL;

RAISE NOTICE '✅ Rollback successful: All migration 001 changes reverted';

COMMIT;
