-- Migration: Create rating recalculation RPC function
-- Description: Allows manual recalculation of professional ratings (used by cron job for delayed reviews)

-- Create RPC function to recalculate a single professional's rating
CREATE OR REPLACE FUNCTION recalculate_professional_rating(professional_id UUID)
RETURNS void AS $$
BEGIN
  -- Recalculate rating and review count for a specific professional
  -- Only counts published reviews (published_at <= NOW())
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
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

-- Add comment for documentation
COMMENT ON FUNCTION recalculate_professional_rating(UUID) IS 'Recalculates average_rating and total_reviews for a professional. Called by cron job when delayed reviews become published.';

-- Grant execute permission to authenticated users (used by API)
GRANT EXECUTE ON FUNCTION recalculate_professional_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_professional_rating(UUID) TO service_role;
