-- ============================================
-- Full-Text Search for Tasks
-- Enables searching task titles and descriptions
-- ============================================

-- Add generated tsvector column for full-text search
-- Using 'simple' config because we have mixed multilingual content (EN, BG, RU)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(title_bg, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(description_bg, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(location_notes, '')), 'C')
) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_tasks_search_vector ON public.tasks USING GIN(search_vector);

-- Function to search tasks by text query
-- Returns open tasks matching the search query, ranked by relevance
CREATE OR REPLACE FUNCTION search_tasks_by_text(
  search_query TEXT,
  status_filter TEXT DEFAULT 'open',
  city_filter TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  city TEXT,
  neighborhood TEXT,
  budget_min_bgn DECIMAL,
  budget_max_bgn DECIMAL,
  budget_type TEXT,
  deadline TIMESTAMPTZ,
  status TEXT,
  customer_id UUID,
  images TEXT[],
  is_urgent BOOLEAN,
  created_at TIMESTAMPTZ,
  search_rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.category,
    t.subcategory,
    t.city,
    t.neighborhood,
    t.budget_min_bgn,
    t.budget_max_bgn,
    t.budget_type,
    t.deadline,
    t.status,
    t.customer_id,
    t.images,
    t.is_urgent,
    t.created_at,
    ts_rank(t.search_vector, plainto_tsquery('simple', search_query)) as search_rank
  FROM public.tasks t
  WHERE
    t.status = status_filter
    AND t.search_vector @@ plainto_tsquery('simple', search_query)
    AND (city_filter IS NULL OR t.city = city_filter)
    AND (category_filter IS NULL OR t.category = category_filter OR t.subcategory = category_filter)
  ORDER BY search_rank DESC, t.created_at DESC
  LIMIT result_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_tasks_by_text TO authenticated;
GRANT EXECUTE ON FUNCTION search_tasks_by_text TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION search_tasks_by_text IS
'Full-text search for tasks. Searches title, title_bg, description, description_bg, and location_notes.
Returns results ranked by relevance with optional filters for status, city, and category.';

-- Also create a simpler version for basic searches
CREATE OR REPLACE FUNCTION search_tasks_simple(
  search_query TEXT,
  result_limit INTEGER DEFAULT 20
)
RETURNS SETOF public.tasks
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT t.*
  FROM public.tasks t
  WHERE
    t.status = 'open'
    AND t.search_vector @@ plainto_tsquery('simple', search_query)
  ORDER BY
    ts_rank(t.search_vector, plainto_tsquery('simple', search_query)) DESC,
    t.created_at DESC
  LIMIT result_limit;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_tasks_simple TO authenticated;
GRANT EXECUTE ON FUNCTION search_tasks_simple TO anon;

COMMENT ON FUNCTION search_tasks_simple IS
'Simple full-text search returning full task rows for open tasks only.';
