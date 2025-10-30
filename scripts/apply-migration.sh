#!/bin/bash

# Apply a single migration file to the database
# Usage: npm run db:migrate:apply supabase/migrations/FILENAME.sql
# or: ./scripts/apply-migration.sh supabase/migrations/FILENAME.sql

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep -E '^(DB_HOST|DB_USER|DB_PASSWORD|DB_NAME)=' | xargs)
fi

# Check if file path is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide a migration file path"
  echo "Usage: npm run db:migrate:apply supabase/migrations/FILENAME.sql"
  exit 1
fi

MIGRATION_FILE="$1"

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📦 Applying migration: $MIGRATION_FILE"
echo "🔗 Connecting to: $DB_HOST"

# Apply the migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p 5432 -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Migration applied successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi
