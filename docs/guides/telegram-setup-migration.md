# Telegram Connection - Database Migration Guide

This guide will help you set up the database for Telegram connection feature.

---

## 🔍 STEP 1: Check Your Users Table Schema

First, let's see what columns exist in your `users` table.

**Run this in Supabase SQL Editor:**

```sql
-- Check what columns exist in users table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**📋 Copy the output and share it if you need help, or proceed to Step 2.**

---

## 🚀 STEP 2: Run Database Migration

Copy and paste **ALL of this SQL** into Supabase SQL Editor and click "Run":

```sql
-- ===================================================
-- Telegram Connection Feature - Database Setup
-- ===================================================

-- -----------------------------------------------
-- A. Create Mock User for Local Development
-- -----------------------------------------------
-- Insert a test user matching your schema
INSERT INTO users (
  id,
  email,
  full_name,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'test@example.com',
  'Test User (Mock)',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify mock user was created
SELECT
  '✅ Mock User Created' as status,
  id,
  created_at
FROM users
WHERE id = '00000000-0000-0000-0000-000000000001';


-- -----------------------------------------------
-- B. Create Telegram Connection Tokens Table
-- -----------------------------------------------
-- This table stores temporary tokens for connecting Telegram accounts
CREATE TABLE IF NOT EXISTS telegram_connection_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE telegram_connection_tokens IS
  'Temporary tokens (15min expiry) for connecting Telegram accounts to user profiles';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_tokens_user
  ON telegram_connection_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_telegram_tokens_token
  ON telegram_connection_tokens(token);

CREATE INDEX IF NOT EXISTS idx_telegram_tokens_expires
  ON telegram_connection_tokens(expires_at);

-- Verify table was created
SELECT
  '✅ Tokens Table Created' as status,
  tablename
FROM pg_tables
WHERE tablename = 'telegram_connection_tokens';


-- -----------------------------------------------
-- C. Verify Existing Telegram Columns
-- -----------------------------------------------
-- Your users table already has telegram columns and notification_preferences!
-- Let's just verify they exist:

SELECT
  '✅ Telegram Columns Exist' as status,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN (
    'telegram_id',
    'telegram_username',
    'telegram_first_name',
    'telegram_last_name',
    'telegram_photo_url',
    'preferred_notification_channel',
    'notification_preferences'
  );


-- -----------------------------------------------
-- D. Final Verification
-- -----------------------------------------------
-- Check everything is set up correctly
SELECT '======================================' as separator;
SELECT '📊 MIGRATION COMPLETE - VERIFICATION:' as status;
SELECT '======================================' as separator;

-- 1. Check mock user exists
SELECT
  '1. Mock User' as check_item,
  CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM users
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 2. Check tokens table exists
SELECT
  '2. Tokens Table' as check_item,
  CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_tables
WHERE tablename = 'telegram_connection_tokens';

-- 3. Check telegram columns exist (should be 7 columns)
SELECT
  '3. Telegram Columns' as check_item,
  CASE WHEN COUNT(*) >= 7 THEN '✅ ' || COUNT(*)::text || ' COLUMNS'
       ELSE '⚠️ ONLY ' || COUNT(*)::text || ' FOUND' END as status
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN (
    'telegram_id', 'telegram_username', 'telegram_first_name',
    'telegram_last_name', 'telegram_photo_url',
    'preferred_notification_channel', 'notification_preferences'
  );

-- 4. Check indexes were created
SELECT
  '4. Database Indexes' as check_item,
  CASE WHEN COUNT(*) >= 3 THEN '✅ ' || COUNT(*)::text || ' CREATED'
       ELSE '⚠️ ONLY ' || COUNT(*)::text || ' FOUND' END as status
FROM pg_indexes
WHERE tablename = 'telegram_connection_tokens';
```

---

## ✅ Expected Output

After running the SQL, you should see:

```
✅ Mock User Created         | id: 00000000-0000-0000-0000-000000000001
✅ Tokens Table Created      | tablename: telegram_connection_tokens
✅ Telegram Columns Exist    | column_count: 7

📊 MIGRATION COMPLETE - VERIFICATION:
1. Mock User              | ✅ EXISTS
2. Tokens Table           | ✅ EXISTS
3. Telegram Columns       | ✅ 7 COLUMNS
4. Database Indexes       | ✅ 3 CREATED
```

---

## 🧪 STEP 3: Test in Your App

1. **Refresh your browser** (important - clears old state)
2. Go to **Profile → Settings**
3. Scroll down to **"Telegram Notifications"** section
4. Click **"Connect Telegram"** button

You should see:
- ✅ Alert message: "Telegram will open in a new window..."
- ✅ Telegram app/browser opens with link to @Trudify_bot
- ✅ No errors in browser console

---

## ❌ Troubleshooting

### Error: "column X does not exist"
If you get an error about a specific column not existing, run Step 1 to check your schema, then let me know the output.

### Error: "table already exists"
This is fine! The migration is designed to be safe to run multiple times. The `IF NOT EXISTS` clauses prevent errors.

### Error: "user not found" when clicking button
Make sure you ran all of Step 2 and refreshed your browser.

---

## 📁 Location
This file: `/docs/telegram-setup-migration.md`

---

## 🔗 Related Files
- Migration SQL: `/supabase/migrations/add_telegram_connection_tokens.sql`
- Mock User SQL: `/scripts/create-mock-user.sql`
- Component: `/src/app/[lang]/profile/components/telegram-connection.tsx`
- API Routes: `/src/app/api/telegram/*`
