-- Migration: Add privacy fields to reviews table
-- Description: Adds is_anonymous and published_at fields for review privacy controls

-- Add is_anonymous column
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add published_at column (defaults to NOW for immediate publishing)
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing reviews to have published_at = created_at
UPDATE public.reviews
SET published_at = created_at
WHERE published_at IS NULL;

-- Make published_at NOT NULL after setting defaults
ALTER TABLE public.reviews
ALTER COLUMN published_at SET NOT NULL;

-- Create index for efficient filtering of published reviews
CREATE INDEX IF NOT EXISTS idx_reviews_published_at
  ON public.reviews(published_at, is_hidden)
  WHERE is_hidden = false;

-- Add comment for documentation
COMMENT ON COLUMN public.reviews.is_anonymous IS 'If true, reviewer name is hidden from professional';
COMMENT ON COLUMN public.reviews.published_at IS 'Date when review becomes publicly visible. Can be set to future date for delayed publishing (e.g., 1 week delay for user safety)';
