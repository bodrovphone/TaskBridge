# Supabase RLS Performance Optimization (December 2024)

This document summarizes the RLS (Row Level Security) and performance optimizations applied to the Supabase database.

## Summary of Changes

### 1. Professional Detail Page Optimization (Codebase)

**Problem:** Professional detail page took 31+ seconds to load due to:
- HTTP round-trip to own API
- Double API calls (metadata + page)
- No caching (`cache: 'no-store'`)

**Solution:** Direct service layer calls with caching

**Files Changed:**
- `src/server/professionals/professional.repository.ts` - Added `getProfessionalDetailById()`
- `src/server/professionals/professional.service.ts` - Added `getProfessionalDetail()`
- `src/server/professionals/professional.types.ts` - Added `ProfessionalDetail`, `CompletedTaskItem`, `ReviewItem` types
- `src/app/[lang]/professionals/[id]/page.tsx` - Direct service calls + React `cache()` + ISR

**Result:** 31s → 266ms (99% improvement)

---

### 2. RLS Policy Performance Fix

**Problem:** Supabase linter warning:
> Table public.users has a row level security policy that re-evaluates `auth.uid()` for each row.

**Solution:** Wrap `auth.uid()` in `(SELECT auth.uid())` to evaluate once instead of per-row.

**Pattern:**
```sql
-- BEFORE (slow - re-evaluates per row)
auth.uid() = id

-- AFTER (fast - evaluates once)
(SELECT auth.uid()) = id
```

---

## All RLS Policies Updated

### USERS Table
```sql
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
```

### APPLICATIONS Table
```sql
DROP POLICY IF EXISTS "Customers can update applications to their tasks" ON applications;
CREATE POLICY "Customers can update applications to their tasks" ON applications
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = applications.task_id
    AND tasks.customer_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Professionals can view own applications" ON applications;
CREATE POLICY "Professionals can view own applications" ON applications
  FOR SELECT USING ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Professionals can update own applications" ON applications;
CREATE POLICY "Professionals can update own applications" ON applications
  FOR UPDATE USING ((SELECT auth.uid()) = professional_id);
```

### CATEGORY_SUGGESTIONS Table
```sql
DROP POLICY IF EXISTS "Admins can view all suggestions" ON category_suggestions;
CREATE POLICY "Admins can view all suggestions" ON category_suggestions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can view own suggestions" ON category_suggestions;
CREATE POLICY "Users can view own suggestions" ON category_suggestions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can update suggestions" ON category_suggestions;
CREATE POLICY "Admins can update suggestions" ON category_suggestions
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = (SELECT auth.uid())
  ));
```

### CUSTOMER_PROFESSIONAL_REMOVALS Table
```sql
DROP POLICY IF EXISTS "Customers can view their own removals" ON customer_professional_removals;
CREATE POLICY "Customers can view their own removals" ON customer_professional_removals
  FOR SELECT USING (customer_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Professionals can view removals about them" ON customer_professional_removals;
CREATE POLICY "Professionals can view removals about them" ON customer_professional_removals
  FOR SELECT USING (professional_id = (SELECT auth.uid()));
```

### CUSTOMER_PROFESSIONAL_RESTRICTIONS Table
```sql
DROP POLICY IF EXISTS "Customers can view their own restrictions" ON customer_professional_restrictions;
CREATE POLICY "Customers can view their own restrictions" ON customer_professional_restrictions
  FOR SELECT USING (customer_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Professionals can view restrictions about them" ON customer_professional_restrictions;
CREATE POLICY "Professionals can view restrictions about them" ON customer_professional_restrictions
  FOR SELECT USING (professional_id = (SELECT auth.uid()));
```

### MESSAGES Table
```sql
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON messages;
CREATE POLICY "Recipients can mark messages as read" ON messages
  FOR UPDATE
  USING ((SELECT auth.uid()) = recipient_id)
  WITH CHECK ((SELECT auth.uid()) = recipient_id);

DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT
  USING (((SELECT auth.uid()) = sender_id) OR ((SELECT auth.uid()) = recipient_id));
```

### NOTIFICATIONS Table
```sql
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING ((SELECT auth.uid()) = user_id);
```

### PROFESSIONAL_TASK_COOLOFFS Table
```sql
DROP POLICY IF EXISTS "Users can view their own cooloffs" ON professional_task_cooloffs;
CREATE POLICY "Users can view their own cooloffs" ON professional_task_cooloffs
  FOR SELECT USING (professional_id = (SELECT auth.uid()));
```

### PROFESSIONAL_WITHDRAWALS Table
```sql
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON professional_withdrawals;
CREATE POLICY "Users can view their own withdrawals" ON professional_withdrawals
  FOR SELECT USING (professional_id = (SELECT auth.uid()));
```

### REVIEWS Table
```sql
DROP POLICY IF EXISTS "Reviewees can respond to reviews" ON reviews;
CREATE POLICY "Reviewees can respond to reviews" ON reviews
  FOR UPDATE
  USING ((SELECT auth.uid()) = reviewee_id)
  WITH CHECK ((SELECT auth.uid()) = reviewee_id);
```

### SAFETY_REPORTS Table
```sql
DROP POLICY IF EXISTS "Users can view own reports" ON safety_reports;
CREATE POLICY "Users can view own reports" ON safety_reports
  FOR SELECT USING ((SELECT auth.uid()) = reporter_id);
```

### TASKS Table
```sql
DROP POLICY IF EXISTS "Professionals can update assigned tasks" ON tasks;
CREATE POLICY "Professionals can update assigned tasks" ON tasks
  FOR UPDATE
  USING ((SELECT auth.uid()) = selected_professional_id)
  WITH CHECK ((SELECT auth.uid()) = selected_professional_id);

DROP POLICY IF EXISTS "Customers can view own tasks" ON tasks;
CREATE POLICY "Customers can view own tasks" ON tasks
  FOR SELECT USING ((SELECT auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can update own tasks" ON tasks;
CREATE POLICY "Customers can update own tasks" ON tasks
  FOR UPDATE USING ((SELECT auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Professionals can view assigned tasks" ON tasks;
CREATE POLICY "Professionals can view assigned tasks" ON tasks
  FOR SELECT USING ((SELECT auth.uid()) = selected_professional_id);
```

---

## 3. RLS Enabled on Unprotected Tables

These tables had no RLS enabled (security risk):

### TELEGRAM_CONNECTION_TOKENS
```sql
ALTER TABLE telegram_connection_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens" ON telegram_connection_tokens
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own tokens" ON telegram_connection_tokens
  FOR DELETE USING (user_id = (SELECT auth.uid()));
```

### APP_SETTINGS
```sql
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings" ON app_settings
  FOR SELECT USING (true);
```

### NOTIFICATION_LOGS
```sql
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification logs" ON notification_logs
  FOR SELECT USING (user_id = (SELECT auth.uid()));
```

### CATEGORY_SUGGESTIONS_FEEDBACK
```sql
-- Service role only (no user access - internal analytics table)
ALTER TABLE category_suggestions_feedback ENABLE ROW LEVEL SECURITY;
-- No policies = only service role can access
```

---

## Rollback Instructions

If any functionality breaks, here's how to rollback individual policies:

### Rollback Pattern (remove SELECT wrapper)
```sql
-- Example: Rollback "Users can view own profile"
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Disable RLS on a table (emergency)
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

---

## Debugging Issues

### Check current policies on a table
```sql
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
```

### Check if RLS is enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public';
```

### Find policies still using unoptimized auth.uid()
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
  AND qual NOT LIKE '%SELECT auth.%'
  AND (with_check IS NULL OR with_check NOT LIKE '%SELECT auth.%');
```

### Test a specific user's access
```sql
-- Set the auth context for testing
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Then run your query
SELECT * FROM tasks WHERE customer_id = auth.uid();
```

---

## Testing Checklist

After these changes, test these flows:

- [ ] Magic link login
- [ ] Email/password login
- [ ] Profile view (logged in)
- [ ] Profile update
- [ ] New user signup
- [ ] Task creation
- [ ] Task viewing (own tasks)
- [ ] Application submission
- [ ] Application viewing
- [ ] Notifications viewing
- [ ] Message viewing

---

## References

- [Supabase RLS Performance Guide](https://supabase.com/docs/guides/auth/row-level-security#call-functions-with-select)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
