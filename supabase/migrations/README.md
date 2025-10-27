# Database Migrations

## Quick Start

**To create a new migration:**
```bash
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_description.sql
```

**Then:**
1. Write your SQL changes in the new file
2. Apply via Supabase Dashboard → SQL Editor (copy/paste & run)
3. Commit to git

**Full guide:** `/docs/infrastructure/DATABASE-MIGRATIONS.md`

## Existing Migrations

- `20251027000000_initial_schema.sql` - Complete TaskBridge schema (already applied)

## Rules

✅ DO:
- Create new migration files for ALL schema changes
- Test locally before production (if possible)
- Commit migrations to git
- Use descriptive names

❌ DON'T:
- Edit existing migration files (create new ones instead)
- Make schema changes without creating a migration
- Delete migration files from git
