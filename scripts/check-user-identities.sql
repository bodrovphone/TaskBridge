-- Check user identities to see which auth providers are linked
-- Run this in Supabase SQL Editor after testing OAuth

-- View your user and linked identities
SELECT
  u.id,
  u.email,
  u.created_at,
  json_agg(
    json_build_object(
      'provider', i.provider,
      'created_at', i.created_at
    )
  ) as auth_providers
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email = 'your-email@example.com'  -- Replace with your email
GROUP BY u.id, u.email, u.created_at;

-- Expected result after OAuth login:
-- You should see TWO providers for the same user_id:
-- 1. "email" (your original email/password)
-- 2. "google" (newly linked OAuth)
