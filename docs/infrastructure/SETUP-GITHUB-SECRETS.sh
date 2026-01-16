#!/bin/bash

# GitHub Secrets Setup Script
# This script adds all required environment variables to GitHub Secrets
# Run this from your project root directory

echo "🔐 Setting up GitHub Secrets for TaskBridge..."
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed!"
    echo ""
    echo "Install it first:"
    echo "  macOS:   brew install gh"
    echo "  Windows: scoop install gh"
    echo "  Linux:   See https://cli.github.com/"
    echo ""
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged in to GitHub CLI"
    echo ""
    echo "Run: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Confirm before proceeding
echo "This will add the following secrets to your repository:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - DATABASE_PASSWORD"
echo "  - DATABASE_URL"
echo ""
echo "You will be prompted to enter each value."
echo "Get these from: https://supabase.com/dashboard/project/_/settings/api"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Adding secrets..."
echo ""

# Add NEXT_PUBLIC_SUPABASE_URL
echo "📝 Adding NEXT_PUBLIC_SUPABASE_URL..."
read -p "Enter your Supabase URL (e.g., https://your-project-id.supabase.co): " SUPABASE_URL
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "$SUPABASE_URL"

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "📝 Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
read -p "Enter your Supabase anon key: " ANON_KEY
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$ANON_KEY"

# Add SUPABASE_SERVICE_ROLE_KEY
echo "📝 Adding SUPABASE_SERVICE_ROLE_KEY..."
read -p "Enter your Supabase service role key: " SERVICE_ROLE_KEY
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SERVICE_ROLE_KEY"

# Add DATABASE_PASSWORD
echo "📝 Adding DATABASE_PASSWORD..."
read -p "Enter your database password: " DB_PASSWORD
gh secret set DATABASE_PASSWORD --body "$DB_PASSWORD"

# Add DATABASE_URL
echo "📝 Adding DATABASE_URL..."
# Extract project ID from Supabase URL
PROJECT_ID=$(echo "$SUPABASE_URL" | sed 's/https:\/\///' | sed 's/\.supabase\.co//')
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres"
echo "Using DATABASE_URL: postgresql://postgres:****@db.${PROJECT_ID}.supabase.co:5432/postgres"
gh secret set DATABASE_URL --body "$DATABASE_URL"

echo ""
echo "✅ All secrets added successfully!"
echo ""
echo "🔍 Verify by running:"
echo "   gh secret list"
echo ""
echo "Or visit:"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo ""
