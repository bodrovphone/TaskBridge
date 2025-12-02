# Database Cleanup Before Production Release

## Task Description
SQL queries to clean up all test/development data from Supabase database before production release. These queries delete all data while preserving table structures, schemas, RLS policies, triggers, and functions.

## Prerequisites
- Access to Supabase Dashboard
- Navigate to: SQL Editor (Dashboard → SQL Editor)

## Step 1: Clean Application Data

Order matters due to foreign key constraints.

```sql
-- Disable triggers temporarily for faster deletion
SET session_replication_role = 'replica';

-- 1. Safety reports (references users, tasks)
TRUNCATE TABLE public.safety_reports CASCADE;

-- 2. Notifications (references users, tasks, applications)
TRUNCATE TABLE public.notifications CASCADE;

-- 3. Messages (references users, tasks)
TRUNCATE TABLE public.messages CASCADE;

-- 4. Reviews (references users, tasks)
TRUNCATE TABLE public.reviews CASCADE;

-- 5. Applications (references users, tasks)
TRUNCATE TABLE public.applications CASCADE;

-- 6. Tasks (references users)
TRUNCATE TABLE public.tasks CASCADE;

-- 7. Users (main table - do last)
TRUNCATE TABLE public.users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL SELECT 'tasks', COUNT(*) FROM public.tasks
UNION ALL SELECT 'applications', COUNT(*) FROM public.applications
UNION ALL SELECT 'reviews', COUNT(*) FROM public.reviews
UNION ALL SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL SELECT 'safety_reports', COUNT(*) FROM public.safety_reports;
```

## Step 2: Clean Supabase Auth Users

```sql
-- Delete all auth identities (OAuth connections)
DELETE FROM auth.identities;

-- Delete all auth sessions
DELETE FROM auth.sessions;

-- Delete all refresh tokens
DELETE FROM auth.refresh_tokens;

-- Delete MFA factors if any
DELETE FROM auth.mfa_factors;

-- Delete MFA challenges if any
DELETE FROM auth.mfa_challenges;

-- Delete MFA AMRS if any
DELETE FROM auth.mfa_amr_claims;

-- Delete all users from auth schema
DELETE FROM auth.users;

-- Verify auth users are deleted
SELECT COUNT(*) as remaining_auth_users FROM auth.users;
```

## Step 3: Clean Storage Buckets (Optional)

Run if you also want to delete uploaded files.

```sql
-- Delete all objects from storage buckets
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.objects WHERE bucket_id = 'task-images';
DELETE FROM storage.objects WHERE bucket_id = 'task-documents';
DELETE FROM storage.objects WHERE bucket_id = 'portfolio';

-- Verify storage is empty
SELECT bucket_id, COUNT(*) as file_count
FROM storage.objects
GROUP BY bucket_id;
```

## All-in-One Script (Complete Cleanup)

Use this single script for complete cleanup in one execution:

```sql
-- ============================================
-- COMPLETE DATABASE CLEANUP
-- ============================================

-- Disable triggers for faster execution
SET session_replication_role = 'replica';

-- Clean application tables (order matters)
TRUNCATE TABLE public.safety_reports CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.reviews CASCADE;
TRUNCATE TABLE public.applications CASCADE;
TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Clean auth system
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.users;

-- Clean storage (optional - comment out if you want to keep files)
DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'task-images', 'task-documents', 'portfolio');

-- Final verification
SELECT 'Application Tables' as section, '' as detail
UNION ALL
SELECT 'users', COUNT(*)::text FROM public.users
UNION ALL SELECT 'tasks', COUNT(*)::text FROM public.tasks
UNION ALL SELECT 'applications', COUNT(*)::text FROM public.applications
UNION ALL SELECT 'reviews', COUNT(*)::text FROM public.reviews
UNION ALL SELECT 'messages', COUNT(*)::text FROM public.messages
UNION ALL SELECT 'notifications', COUNT(*)::text FROM public.notifications
UNION ALL SELECT 'safety_reports', COUNT(*)::text FROM public.safety_reports
UNION ALL SELECT '---', '---'
UNION ALL SELECT 'Auth Tables', ''
UNION ALL SELECT 'auth.users', COUNT(*)::text FROM auth.users
UNION ALL SELECT 'auth.sessions', COUNT(*)::text FROM auth.sessions;
```

## What Gets Preserved

- All table structures (schemas)
- All indexes
- All RLS policies
- All triggers and functions
- All storage buckets (only files deleted)
- All auth providers configuration

## What Gets Deleted

- All rows from application tables (users, tasks, applications, reviews, messages, notifications, safety_reports)
- All Supabase Auth users and sessions
- All uploaded files in storage buckets

## Acceptance Criteria

- [ ] All application tables show 0 count
- [ ] auth.users shows 0 count
- [ ] Storage buckets are empty (if Step 3 was run)
- [ ] No errors during execution

## Priority
High - Must be done before production release

## Notes
- Last tested: December 2, 2024 - No errors
- Run in Supabase SQL Editor only
- Do NOT run on production database with real users!
