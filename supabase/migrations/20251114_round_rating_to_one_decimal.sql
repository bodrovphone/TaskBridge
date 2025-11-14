-- Migration: Round average_rating to 1 decimal place instead of 2
-- Description: Updates rating calculation to show 4.7 instead of 4.67

-- Update the main trigger function
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update professional's rating and review count
  -- Only count reviews that:
  -- 1. Are not hidden
  -- 2. Have been published (published_at <= NOW())
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)  -- Changed from 2 to 1 decimal
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()  -- Only published reviews
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()  -- Only published reviews
    ),
    updated_at = NOW()
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the manual recalculation function
CREATE OR REPLACE FUNCTION recalculate_professional_rating(professional_id UUID)
RETURNS void AS $$
BEGIN
  -- Recalculate rating and review count for a specific professional
  -- Only counts published reviews (published_at <= NOW())
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)  -- Changed from 2 to 1 decimal
      FROM public.reviews
      WHERE reviewee_id = professional_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = professional_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()
    ),
    updated_at = NOW()
  WHERE id = professional_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update all existing ratings to 1 decimal place
UPDATE public.users
SET average_rating = ROUND(average_rating::numeric, 1)
WHERE average_rating IS NOT NULL;

-- Add comment
COMMENT ON FUNCTION update_professional_rating() IS 'Updates professional rating (1 decimal) and review count. Only counts published reviews (published_at <= NOW()).';
COMMENT ON FUNCTION recalculate_professional_rating(UUID) IS 'Recalculates average_rating (1 decimal) and total_reviews for a professional. Called by cron job when delayed reviews become published.';
