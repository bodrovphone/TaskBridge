-- Create Mock User for Local Development
-- Run this in Supabase SQL Editor to enable testing features that require authentication

-- Create mock user with UUID matching the app's mock userId
INSERT INTO users (
  id,
  full_name,
  email,
  role,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Test User (Mock)',
  'test@example.com',
  'customer',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify the user was created
SELECT id, full_name, email, role, created_at FROM users WHERE id = '00000000-0000-0000-0000-000000000001';
