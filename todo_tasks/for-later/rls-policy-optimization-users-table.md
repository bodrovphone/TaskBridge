# RLS Policy Optimization - Users Table

## Task Description
Optimize Row Level Security (RLS) policies on the `public.users` table to resolve Supabase performance warning about multiple permissive policies.

## Current Issue
Supabase detected multiple permissive policies for role `dashboard_user` for action `SELECT`:
1. **"Public profiles are viewable by everyone"** - allows anyone to view profiles
2. **"Users can view own profile"** - allows users to view their own profile

### Why This Is Suboptimal
- Both policies are evaluated for every query (OR logic)
- Performance overhead from redundant checks
- "Users can view own profile" is redundant when "everyone can view" already passes

## Recommended Solution

### Option 1: Drop Redundant Policy (Simplest)
```sql
-- Drop the redundant policy
DROP POLICY "Users can view own profile" ON public.users;

-- Keep only: "Public profiles are viewable by everyone"
```

### Option 2: Consolidate Into Single Policy
```sql
-- Drop both and create one consolidated policy
DROP POLICY "Public profiles are viewable by everyone" ON public.users;
DROP POLICY "Users can view own profile" ON public.users;

-- Single policy that handles both cases
CREATE POLICY "Users can view profiles" ON public.users
FOR SELECT
USING (true);  -- Everyone can view
```

### Option 3: Granular Control (If Needed Later)
If some fields should be owner-only visible, implement column-level filtering at the query level rather than using multiple RLS policies.

## Acceptance Criteria
- [ ] Review current RLS policies in Supabase Dashboard
- [ ] Decide on approach (Option 1 recommended for simplicity)
- [ ] Apply SQL changes via Supabase Dashboard or migration
- [ ] Verify Supabase warning is resolved
- [ ] Test that profile viewing still works correctly

## Technical Notes
- Location: Supabase Dashboard → Authentication → Policies → users table
- This is a performance optimization, not a security issue
- Current behavior (everyone can view profiles) will remain unchanged

## Priority
Low

## References
- Supabase RLS documentation: https://supabase.com/docs/guides/auth/row-level-security
