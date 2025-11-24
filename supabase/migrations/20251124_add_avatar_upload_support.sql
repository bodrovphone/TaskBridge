-- Avatar Upload System Migration
-- Adds oauth_avatar_url field and creates avatars storage bucket
-- Part of: Avatar priority system (custom > OAuth > default)

-- 1. Add oauth_avatar_url field to users table
-- This stores the avatar from OAuth providers (Google/Facebook)
-- While avatar_url stores custom uploaded avatars (takes priority)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS oauth_avatar_url TEXT;

COMMENT ON COLUMN users.oauth_avatar_url IS 'Avatar URL from OAuth providers (Google, Facebook). Custom avatar_url takes priority.';

-- 2. Create avatars storage bucket (if not exists)
-- Note: This needs to be run via Supabase Dashboard or CLI
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies for avatars bucket
-- Note: These policies need to be created via Supabase Dashboard:
--
-- Policy 1: "Users can upload their own avatars"
-- Operation: INSERT
-- Policy definition: (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
--
-- Policy 2: "Users can update their own avatars"
-- Operation: UPDATE
-- Policy definition: (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
--
-- Policy 3: "Users can delete their own avatars"
-- Operation: DELETE
-- Policy definition: (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
--
-- Policy 4: "Anyone can view avatars"
-- Operation: SELECT
-- Policy definition: bucket_id = 'avatars'

-- 4. Update existing OAuth users to move avatars to oauth_avatar_url
-- This preserves existing OAuth avatars when custom avatars are uploaded
UPDATE users
SET oauth_avatar_url = avatar_url
WHERE avatar_url IS NOT NULL
  AND avatar_url LIKE '%googleusercontent.com%'
  OR avatar_url LIKE '%facebook.com%'
  OR avatar_url LIKE '%fbcdn.net%';

COMMENT ON TABLE users IS 'User profiles with avatar priority: avatar_url (custom) > oauth_avatar_url (OAuth) > null (default/initials)';
