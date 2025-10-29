-- Check if user exists in auth vs users table
-- First, insert a user profile for your auth user

INSERT INTO users (
  id,
  email,
  full_name,
  user_type,
  country,
  is_email_verified,
  is_phone_verified
) VALUES (
  '08a5014e-1c64-4008-9538-f45f3c4a1067',
  'your-email@example.com', -- Replace with your actual email
  'Test User', -- Replace with your name
  'customer',
  'Bulgaria',
  true,
  false
)
ON CONFLICT (id) DO NOTHING;
