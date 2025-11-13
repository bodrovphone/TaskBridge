-- Migration: Update rating trigger to only count published reviews
-- Description: Modifies update_professional_rating() function to filter by published_at <= NOW()

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_update_professional_rating ON public.reviews;

-- Recreate function with published_at filtering
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
      SELECT ROUND(AVG(rating)::numeric, 2)
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

-- Recreate trigger
CREATE TRIGGER trigger_update_professional_rating
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();

-- Add comment for documentation
COMMENT ON FUNCTION update_professional_rating() IS 'Updates professional rating and review count. Only counts published reviews (published_at <= NOW()) to support delayed publishing.';
