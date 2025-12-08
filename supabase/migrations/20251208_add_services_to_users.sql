-- Migration: Add services column to users table
-- This adds support for professionals to list their services and pricing

-- Add services column to users table as JSONB array
-- Each service item has: id, name, price, description, order
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.users.services IS 'Array of service items with id, name, price, description, and order fields';

-- Create index for JSON containment queries (e.g., searching by service name)
CREATE INDEX IF NOT EXISTS idx_users_services ON public.users USING GIN (services);
