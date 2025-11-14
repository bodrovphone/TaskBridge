# Apply Rating Decimal Rounding Fix

This migration updates the rating calculation to round to **1 decimal place** (e.g., 4.7) instead of 2 decimals (e.g., 4.67).

## What It Does

1. Updates `update_professional_rating()` trigger function to use `ROUND(..., 1)`
2. Updates `recalculate_professional_rating()` function to use `ROUND(..., 1)`
3. Converts all existing ratings in the database to 1 decimal

## How to Apply

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `20251114_round_rating_to_one_decimal.sql`
3. Paste and run the migration
4. Verify the change worked by checking a professional's rating

### Option 2: Via Supabase CLI

```bash
# Apply this specific migration
npx supabase db push --include-all

# Or push only this migration file
psql "$DATABASE_URL" < supabase/migrations/20251114_round_rating_to_one_decimal.sql
```

## Verification

Check that the migration applied correctly:

```sql
-- Should show 1 decimal place (e.g., 4.7 instead of 4.67)
SELECT id, full_name, average_rating, total_reviews
FROM users
WHERE average_rating IS NOT NULL
LIMIT 10;
```

## Rollback (if needed)

If you need to revert to 2 decimal places:

```sql
-- Revert the trigger function
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)  -- Back to 2 decimals
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()
    ),
    updated_at = NOW()
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revert the recalculation function
CREATE OR REPLACE FUNCTION recalculate_professional_rating(professional_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)  -- Back to 2 decimals
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

-- Convert existing ratings back to 2 decimals
UPDATE public.users
SET average_rating = ROUND(average_rating::numeric, 2)
WHERE average_rating IS NOT NULL;
```
