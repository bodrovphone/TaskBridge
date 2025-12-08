-- =====================================================
-- Migration: Add Portfolio/Gallery Column to Users
-- Description: Adds portfolio JSONB column for professional gallery feature
--
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Add portfolio column (JSONB to store gallery items)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.users.portfolio IS 'Professional gallery - array of {id, imageUrl, caption, order, createdAt}';

-- Create index for potential future queries on portfolio
CREATE INDEX IF NOT EXISTS idx_users_portfolio ON public.users USING gin (portfolio);

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'portfolio';
