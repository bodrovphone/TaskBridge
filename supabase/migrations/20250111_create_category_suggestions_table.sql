-- Create category_suggestions table to track user suggestions for new categories
-- This allows users to suggest categories they need that aren't currently available

CREATE TABLE IF NOT EXISTS category_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_text TEXT NOT NULL CHECK (char_length(suggestion_text) BETWEEN 10 AND 500),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_category_suggestions_user_id ON category_suggestions(user_id);
CREATE INDEX idx_category_suggestions_status ON category_suggestions(status);
CREATE INDEX idx_category_suggestions_created_at ON category_suggestions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE category_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own suggestions
CREATE POLICY "Users can view own suggestions"
  ON category_suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own suggestions
CREATE POLICY "Users can create suggestions"
  ON category_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all suggestions
-- Note: This policy will be enhanced when admin system is implemented
CREATE POLICY "Admins can view all suggestions"
  ON category_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      -- @todo: Add admin role check when admin system is implemented
    )
  );

-- Admins can update suggestions (status, admin_notes, reviewed_at, reviewed_by)
CREATE POLICY "Admins can update suggestions"
  ON category_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      -- @todo: Add admin role check when admin system is implemented
    )
  );
