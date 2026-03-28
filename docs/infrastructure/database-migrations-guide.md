# Database Migrations Guide

This guide explains how to work with database migrations in TaskBridge.

## Prerequisites

- Supabase CLI installed (automatically installed as dev dependency)
- Project linked to Supabase (already configured)
- Environment variables in `.env.local` (already set up)

## Available Commands

### Create a New Migration

```bash
npm run db:migration:new migration_name
```

This creates a new migration file in `supabase/migrations/` with a timestamp prefix.

### Apply a Single Migration File

```bash
npm run db:migrate:apply supabase/migrations/TIMESTAMP_migration_name.sql
```

Example:
```bash
npm run db:migrate:apply supabase/migrations/20251030000000_add_unclear_budget_type.sql
```

This applies a specific migration file to the production database.

### Check Database Status

```bash
npm run db:status
```

Shows differences between your local schema and the remote database.

### Push All Pending Migrations

```bash
npm run db:push
```

⚠️ **Warning**: This pushes ALL migrations. Use carefully if some migrations are already applied.

### Local Development (Optional)

Start local Supabase instance:
```bash
npm run supabase:start
```

Stop local Supabase:
```bash
npm run supabase:stop
```

Reset local database:
```bash
npm run db:reset
```

## Migration Workflow

### 1. Make Database Changes

When you need to modify the database schema:

1. Create a new migration file:
   ```bash
   npm run db:migration:new add_new_feature
   ```

2. Edit the generated SQL file in `supabase/migrations/`

3. Write the migration SQL (see example below)

### 2. Test the Migration

Review your SQL carefully:
- Check for syntax errors
- Ensure proper constraints
- Add helpful comments
- Consider rollback scenarios

### 3. Apply the Migration

```bash
npm run db:migrate:apply supabase/migrations/TIMESTAMP_add_new_feature.sql
```

### 4. Verify the Changes

Connect to your database and verify:
```bash
psql "$DATABASE_URL"
```

Then run SQL queries to check your changes.

## Example Migration

Here's an example migration that adds a new enum value:

```sql
-- Migration: Add 'unclear' budget type option
-- Date: 2025-10-30
-- Description: Add 'unclear' as a valid budget_type option

-- Drop the existing check constraint
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_budget_type_check;

-- Add the new check constraint with additional value
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_budget_type_check
CHECK (budget_type IN ('fixed', 'hourly', 'negotiable', 'unclear'));

-- Update the default value
ALTER TABLE public.tasks
ALTER COLUMN budget_type SET DEFAULT 'unclear';

-- Add documentation
COMMENT ON COLUMN public.tasks.budget_type IS
'Budget type: fixed, hourly, negotiable, or unclear (customer unsure)';
```

## Best Practices

1. **Always Review First**: Never apply migrations without reviewing the SQL
2. **One Change Per Migration**: Keep migrations focused and atomic
3. **Use Descriptive Names**: Name migrations clearly (e.g., `add_unclear_budget_type` not `update_tasks`)
4. **Test Locally First**: If possible, test migrations on local/staging before production
5. **Backup Important Data**: For destructive changes, consider backing up data first
6. **Document Changes**: Add comments explaining what and why

## Troubleshooting

### Migration Already Applied

If you see "relation already exists" or similar errors:
- The migration was likely already applied
- Check your database to confirm
- Don't re-run unless you're sure it failed

### Connection Errors

If you can't connect to the database:
1. Check your `.env.local` file has correct credentials
2. Verify your IP is allowed in Supabase project settings
3. Test connection with: `psql "$DATABASE_URL"`

### Permission Errors

If you see permission denied errors:
- Ensure you're using the correct database user (postgres)
- Check your Supabase project's database access settings

## Environment Variables

The following environment variables are used for migrations (already configured in `.env.local`):

```env
# Database connection for migrations
DB_HOST=db.yourproject.supabase.co
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres

# Alternative: Full connection string
DATABASE_URL=postgresql://postgres:password@db.yourproject.supabase.co:5432/postgres
```

## Related Documentation

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Database Schema](../supabase/migrations/20251027000000_initial_schema.sql)
