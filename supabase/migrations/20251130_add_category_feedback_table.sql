-- Category suggestions feedback table
-- Tracks when users manually select categories after keyword matching fails
-- Used to improve keyword database over time

CREATE TABLE IF NOT EXISTS category_suggestions_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  matched_subcategory TEXT NOT NULL,
  language VARCHAR(5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No indexes needed - manual monthly analysis only
-- No RLS needed - internal analytics table, API uses service role
