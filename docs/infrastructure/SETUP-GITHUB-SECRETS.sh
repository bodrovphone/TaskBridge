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
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://nyleceedixybtogrwilv.supabase.co"

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "📝 Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bGVjZWVkaXh5YnRvZ3J3aWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTE2NzQsImV4cCI6MjA3Njg4NzY3NH0.GMlMadxGMs9-basljRgj50SbZZz4-mR--JphEiuqd9Q"

# Add SUPABASE_SERVICE_ROLE_KEY
echo "📝 Adding SUPABASE_SERVICE_ROLE_KEY..."
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bGVjZWVkaXh5YnRvZ3J3aWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMTY3NCwiZXhwIjoyMDc2ODg3Njc0fQ.SpZsbad0luDBPLHY1pbtRoKUayqocTcuCHwLOYARzk0"

# Add DATABASE_PASSWORD
echo "📝 Adding DATABASE_PASSWORD..."
gh secret set DATABASE_PASSWORD --body "ppIus5x4M6w0yMNs"

# Add DATABASE_URL
echo "📝 Adding DATABASE_URL..."
gh secret set DATABASE_URL --body "postgresql://postgres:ppIus5x4M6w0yMNs@db.nyleceedixybtogrwilv.supabase.co:5432/postgres"

echo ""
echo "✅ All secrets added successfully!"
echo ""
echo "🔍 Verify by running:"
echo "   gh secret list"
echo ""
echo "Or visit:"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo ""
