# Database Migrations Guide

## Overview

Database migrations track all schema changes over time, allowing you to:
- ✅ Version control your database schema
- ✅ Apply changes consistently across environments
- ✅ Collaborate with team members safely
- ✅ Roll back changes if needed

## Current Setup

Your migrations are stored in:
```
/supabase/migrations/
├── 20251027000000_initial_schema.sql  ← Initial schema (already applied)
└── [future migrations will go here]
```

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

Examples:
```
20251027000000_initial_schema.sql
20251028120000_add_user_badges.sql
20251029153000_add_task_categories_index.sql
```

The timestamp ensures migrations run in order.

---

## Workflow: Making Schema Changes

### Option A: Manual Migrations (Recommended for now)

**Step 1: Create a new migration file**
```bash
# Create a new migration with current timestamp
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_description.sql
```

**Step 2: Write your SQL changes**
```sql
-- Example: Adding a new column to users table
ALTER TABLE public.users
ADD COLUMN profile_banner_url TEXT;

-- Always add indexes if needed
CREATE INDEX idx_users_banner ON public.users(profile_banner_url);
```

**Step 3: Test locally (optional)**
```bash
# Start local Supabase (if you want to test first)
npx supabase start

# Apply migrations locally
npx supabase db reset

# Stop local Supabase
npx supabase stop
```

**Step 4: Apply to production**
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste your migration SQL
3. Click "Run"
4. Verify in Schema Visualizer

**Step 5: Commit to git**
```bash
git add supabase/migrations/
git commit -m "Add profile banner URL to users table"
git push
```

### Option B: Using Supabase CLI (Advanced)

**First-time setup:**
```bash
# Login to Supabase (opens browser)
npx supabase login

# Link to your project
npx supabase link --project-ref nyleceedixybtogrwilv
```

**Creating migrations:**
```bash
# Create a new migration file
npx supabase migration new add_profile_banner

# Edit the file: supabase/migrations/TIMESTAMP_add_profile_banner.sql
# Add your SQL changes

# Push to remote database
npx supabase db push
```

**Pull remote schema changes:**
```bash
# If someone else made changes directly in Supabase Dashboard
npx supabase db pull

# This creates a new migration file with the remote changes
# Review and commit it to git
```

---

## Common Migration Patterns

### Adding a Column
```sql
-- Add column (nullable first to avoid issues)
ALTER TABLE public.users
ADD COLUMN badge_count INTEGER DEFAULT 0;

-- Add index if needed
CREATE INDEX idx_users_badge_count ON public.users(badge_count);
```

### Creating a New Table
```sql
-- Create table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_type)
);

-- Add indexes
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON public.user_badges(earned_at DESC);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);
```

### Modifying a Column
```sql
-- Change column type
ALTER TABLE public.users
ALTER COLUMN phone TYPE VARCHAR(20);

-- Rename column
ALTER TABLE public.users
RENAME COLUMN full_name TO display_name;

-- Add constraint
ALTER TABLE public.users
ADD CONSTRAINT check_positive_rating
CHECK (average_rating >= 0 AND average_rating <= 5);
```

### Adding an Enum Type
```sql
-- Create enum type
CREATE TYPE public.badge_type AS ENUM (
  'verified_email',
  'verified_phone',
  'first_task',
  'ten_tasks',
  'hundred_tasks'
);

-- Use in table
ALTER TABLE public.user_badges
ADD COLUMN badge_type public.badge_type;
```

### Creating a Function/Trigger
```sql
-- Function to award badges automatically
CREATE OR REPLACE FUNCTION award_task_completion_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Award "first_task" badge
  IF NEW.tasks_completed = 1 THEN
    INSERT INTO public.user_badges (user_id, badge_type)
    VALUES (NEW.id, 'first_task')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award "ten_tasks" badge
  IF NEW.tasks_completed = 10 THEN
    INSERT INTO public.user_badges (user_id, badge_type)
    VALUES (NEW.id, 'ten_tasks')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER award_badges_on_task_completion
AFTER UPDATE OF tasks_completed ON public.users
FOR EACH ROW
EXECUTE FUNCTION award_task_completion_badges();
```

---

## Best Practices

### ✅ DO

1. **Always create migrations for schema changes**
   - Never modify schema directly in production
   - Always track changes in migration files

2. **Test migrations locally first (when possible)**
   ```bash
   npx supabase start
   npx supabase db reset  # Applies all migrations
   ```

3. **Make migrations reversible (when possible)**
   ```sql
   -- Good: Can be reversed by dropping the column
   ALTER TABLE public.users ADD COLUMN new_field TEXT;

   -- Bad: Data loss if reversed
   ALTER TABLE public.users DROP COLUMN important_data;
   ```

4. **Use transactions for multi-step changes**
   ```sql
   BEGIN;
     ALTER TABLE public.users ADD COLUMN temp_field TEXT;
     UPDATE public.users SET temp_field = 'default';
     ALTER TABLE public.users ALTER COLUMN temp_field SET NOT NULL;
   COMMIT;
   ```

5. **Add comments for complex changes**
   ```sql
   -- Migration: Add soft-delete functionality to tasks
   -- Rationale: Keep historical data for analytics
   ALTER TABLE public.tasks
   ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ```

### ❌ DON'T

1. **Never edit existing migration files**
   - Once applied, they're part of history
   - Create a new migration to fix issues

2. **Don't drop tables/columns without backups**
   ```sql
   -- Bad: Permanent data loss
   DROP TABLE public.old_data;

   -- Better: Rename first, then drop after verification
   ALTER TABLE public.old_data RENAME TO old_data_backup;
   -- Wait a few days, verify no issues, then drop
   ```

3. **Don't skip RLS policies on new tables**
   - Always add security policies
   - Default: deny all access, then explicitly allow

4. **Don't make breaking changes without coordination**
   - Coordinate with team before removing columns
   - Use feature flags for gradual rollouts

---

## Emergency: Rolling Back Changes

### If migration fails mid-execution:

**Option 1: Fix forward (preferred)**
Create a new migration that fixes the issue:
```sql
-- If previous migration added wrong column type
ALTER TABLE public.users
ALTER COLUMN phone TYPE TEXT;
```

**Option 2: Manual rollback**
1. Go to Supabase Dashboard → SQL Editor
2. Write and run reverse SQL:
```sql
-- Reverse of "ALTER TABLE users ADD COLUMN badges INTEGER"
ALTER TABLE public.users DROP COLUMN badges;
```

### If data is corrupted:

**Use Point-in-Time Recovery (Supabase Pro)**
1. Go to Settings → Database → Backups
2. Select point-in-time before the migration
3. Restore database

**Free tier: Manual backup/restore**
```bash
# Before risky migrations, export data
npx supabase db dump > backup_$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup_20251027.sql
```

---

## Team Collaboration

### Handling Conflicts

**Scenario: Two developers create migrations at the same time**

Developer A creates:
```
20251027120000_add_user_badges.sql
```

Developer B creates:
```
20251027120500_add_user_notifications.sql
```

**Resolution:**
1. Both push to git
2. Git merges both files (no conflict, different files)
3. Apply migrations in timestamp order
4. Both work fine ✅

### Communication Guidelines

**Always announce schema changes in team chat:**
```
🛠️ Database Migration
Migration: 20251027120000_add_user_badges.sql
Tables affected: users, new table user_badges
Breaking changes: None
Action required: None
Status: Applied to production
```

---

## Monitoring & Debugging

### Check which migrations have been applied

**Via Supabase Dashboard:**
1. Database → Schema Migrations
2. See list of applied migrations

**Via SQL:**
```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

### Check migration logs

**Via Supabase Dashboard:**
1. Database → Query Performance
2. Filter by recent DDL statements

---

## Reference: Your Current Schema

All tables created in initial migration:
- ✅ `users` - User profiles
- ✅ `tasks` - Service requests
- ✅ `applications` - Professional bids
- ✅ `reviews` - Ratings & feedback
- ✅ `messages` - Task communication
- ✅ `notifications` - User alerts
- ✅ `safety_reports` - Trust & safety

Full schema: `/supabase/migrations/20251027000000_initial_schema.sql`

---

## Quick Reference Commands

```bash
# Create new migration
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql

# Start local Supabase (for testing)
npx supabase start

# Apply all migrations locally
npx supabase db reset

# Push migrations to remote
npx supabase db push

# Pull remote schema
npx supabase db pull

# Stop local Supabase
npx supabase stop

# Check migration status
npx supabase migration list
```

---

## Next Steps

1. ✅ You've applied initial schema
2. ✅ Migrations are set up in `/supabase/migrations/`
3. ✅ This documentation is ready for team
4. ⏭️ Next schema change: Follow "Option A: Manual Migrations" workflow

**When to use migrations:**
- Adding/removing columns
- Creating indexes
- Adding constraints
- New tables
- RLS policy changes
- Functions/triggers
- ANY schema modification

**Your schema is now version-controlled! 🎉**
