-- ============================================
-- Add professional_title field to users table
-- Migration: 20251105165029_add_professional_title
-- ============================================

-- Add professional_title column
-- This field is REQUIRED for users to appear in professional search listings
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS professional_title TEXT;

-- Add index for professional search optimization
-- This index only indexes users who have a professional_title (partial index)
-- This dramatically improves query performance when searching for professionals
CREATE INDEX IF NOT EXISTS idx_users_professional_title
ON public.users(professional_title)
WHERE professional_title IS NOT NULL AND professional_title != '';

-- Add index for professional listings with categories
-- Composite index for filtering professionals by service categories
CREATE INDEX IF NOT EXISTS idx_users_professional_categories
ON public.users USING GIN(service_categories)
WHERE professional_title IS NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN public.users.professional_title IS
'Professional job title/headline displayed in search results. Required for appearing in professional listings. Examples: "Certified Electrician", "Professional House Cleaner", "Math Tutor"';

-- ============================================
-- Data validation check (optional - for safety)
-- ============================================

-- Check if any users already have service_categories but no professional_title
-- This helps identify users who might need to complete their profile
DO $$
DECLARE
  incomplete_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO incomplete_count
  FROM public.users
  WHERE service_categories IS NOT NULL
    AND array_length(service_categories, 1) > 0
    AND (professional_title IS NULL OR professional_title = '');

  IF incomplete_count > 0 THEN
    RAISE NOTICE 'Found % users with service_categories but no professional_title. These users will not appear in professional search until they add a title.', incomplete_count;
  ELSE
    RAISE NOTICE 'All users with service_categories have professional titles. Migration looks good!';
  END IF;
END $$;

-- ============================================
-- Performance notes
-- ============================================
-- The partial index (WHERE professional_title IS NOT NULL) means:
-- 1. Only professionals are indexed (smaller index, faster queries)
-- 2. Regular users don't bloat the index
-- 3. Queries for professionals will use this index automatically
-- 4. Expected query time: <50ms even with 100k+ users
