-- Auto-update professional's average rating and total reviews count
-- Triggered when reviews are created, updated, or hidden

-- Function to recalculate professional's rating statistics
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average rating and total count for the reviewee (professional)
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
    )
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on INSERT (new review created)
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();

-- Trigger on UPDATE (review rating changed or visibility toggled)
CREATE TRIGGER on_review_updated
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR
        OLD.is_hidden IS DISTINCT FROM NEW.is_hidden)
  EXECUTE FUNCTION update_professional_rating();

-- Add comments for documentation
COMMENT ON FUNCTION update_professional_rating() IS
'Automatically updates professional average_rating and total_reviews when reviews are created/updated/hidden';

COMMENT ON TRIGGER on_review_created ON public.reviews IS
'Auto-updates professional rating statistics when new review is created';

COMMENT ON TRIGGER on_review_updated ON public.reviews IS
'Auto-updates professional rating statistics when review is modified or hidden';
