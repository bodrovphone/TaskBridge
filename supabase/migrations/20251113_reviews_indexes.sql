-- Performance indexes for reviews system
-- Optimizes professional detail page, pending reviews, and enforcement queries

-- Fast lookup of reviews for a professional (detail page)
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_type_visible
  ON public.reviews(reviewee_id, review_type, is_hidden, created_at DESC);

-- Fast lookup of pending reviews for a customer
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_type
  ON public.reviews(reviewer_id, review_type);

-- Fast check if review already exists for a task
CREATE INDEX IF NOT EXISTS idx_reviews_task_reviewer
  ON public.reviews(task_id, reviewer_id);

-- Fast query for completed unreviewed tasks (enforcement)
CREATE INDEX IF NOT EXISTS idx_tasks_customer_status_reviewed
  ON public.tasks(customer_id, status, reviewed_by_customer);

-- Add comments for documentation
COMMENT ON INDEX idx_reviews_reviewee_type_visible IS
'Optimizes professional detail page review fetching (50 most recent visible reviews)';

COMMENT ON INDEX idx_reviews_reviewer_type IS
'Optimizes customer pending reviews list queries';

COMMENT ON INDEX idx_reviews_task_reviewer IS
'Optimizes duplicate review check (prevents multiple reviews per task)';

COMMENT ON INDEX idx_tasks_customer_status_reviewed IS
'Optimizes pending reviews and enforcement queries (completed tasks without reviews)';
