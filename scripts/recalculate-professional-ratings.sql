-- Script to manually recalculate professional ratings
-- Use this to fix data inconsistencies or after migrations

-- 1. Check current state for a specific professional
-- Replace UUID with the professional's ID
SELECT
  u.id,
  u.full_name,
  u.average_rating as current_avg_rating,
  u.total_reviews as current_total_reviews,
  (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews
    WHERE reviewee_id = u.id
      AND review_type = 'customer_to_professional'
      AND is_hidden = false
      AND published_at <= NOW()
  ) as calculated_avg_rating,
  (
    SELECT COUNT(*)
    FROM reviews
    WHERE reviewee_id = u.id
      AND review_type = 'customer_to_professional'
      AND is_hidden = false
      AND published_at <= NOW()
  ) as calculated_total_reviews
FROM users u
WHERE u.id = '948eef13-908b-41d1-81de-00da22744b8f';

-- 2. Show all reviews for this professional (published and unpublished)
SELECT
  id,
  rating,
  comment,
  is_hidden,
  published_at,
  created_at,
  (published_at <= NOW()) as is_published,
  CASE
    WHEN published_at <= NOW() THEN 'Published'
    ELSE 'Delayed (not counted yet)'
  END as status
FROM reviews
WHERE reviewee_id = '948eef13-908b-41d1-81de-00da22744b8f'
  AND review_type = 'customer_to_professional'
ORDER BY created_at DESC;

-- 3. Manually recalculate ratings for this professional
-- This will fix any data inconsistencies
SELECT recalculate_professional_rating('948eef13-908b-41d1-81de-00da22744b8f');

-- 4. Verify the fix worked
SELECT
  id,
  full_name,
  average_rating,
  total_reviews
FROM users
WHERE id = '948eef13-908b-41d1-81de-00da22744b8f';

-- 5. (Optional) Recalculate ALL professional ratings in the database
-- Uncomment to run:
-- UPDATE users
-- SET
--   average_rating = (
--     SELECT ROUND(AVG(rating)::numeric, 1)
--     FROM reviews
--     WHERE reviewee_id = users.id
--       AND review_type = 'customer_to_professional'
--       AND is_hidden = false
--       AND published_at <= NOW()
--   ),
--   total_reviews = (
--     SELECT COUNT(*)
--     FROM reviews
--     WHERE reviewee_id = users.id
--       AND review_type = 'customer_to_professional'
--       AND is_hidden = false
--       AND published_at <= NOW()
--   ),
--   updated_at = NOW()
-- WHERE id IN (
--   SELECT DISTINCT reviewee_id
--   FROM reviews
--   WHERE review_type = 'customer_to_professional'
-- );
