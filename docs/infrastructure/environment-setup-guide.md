# Environment Variables & Secrets Management Guide

## 🔐 Security First

**⚠️ IMPORTANT**: Never commit real credentials to version control. Use placeholders in documentation and store actual values in secure environment variables.

---

## 📍 Where to Store Secrets

You need to store your Supabase credentials in **3 places**:

### 1. **Local Development** (`.env.local`)
✅ Already created at `/TaskBridge/.env.local`

### 2. **GitHub Secrets** (for CI/CD)
For GitHub Actions workflows

### 3. **Vercel Environment Variables** (for deployment)
For production hosting

---

## 🔧 Step 1: Complete Your `.env.local`

Your `.env.local` file needs **3 values** from Supabase Dashboard:

### Get Your Supabase Credentials:

1. **Go to Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/_/settings/api
   ```

2. **Copy these values**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Update `.env.local`**:
   ```bash
   # Replace the placeholders with actual values:

   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # These are already set:
   DATABASE_PASSWORD=your-database-password
   DATABASE_URL=postgresql://postgres:your-database-password@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
   ```

4. **Update the PROJECT_ID** in `DATABASE_URL`:
   - Your project ID is in the Supabase URL
   - Example: `https://abcdefgh12345678.supabase.co` → project ID is `abcdefgh12345678`

---

## 🔐 Step 2: Add to GitHub Secrets

### Method A: Via GitHub Web UI (Easiest)

1. **Go to your repository**:
   ```
   https://github.com/YOUR_USERNAME/TaskBridge
   ```

2. **Navigate to Settings**:
   - Click **Settings** tab (top right)
   - Click **Secrets and variables** → **Actions** (left sidebar)

3. **Add each secret**:
   Click **New repository secret** button and add:

   | Name | Value | Notes |
   |------|-------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` | Public - safe to expose |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Public - safe to expose |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | **SECRET** - never expose |
   | `DATABASE_PASSWORD` | `your-database-password` | **SECRET** - never expose |
   | `DATABASE_URL` | Full PostgreSQL connection string | **SECRET** - never expose |

4. **Click "Add secret"** after each one

### Method B: Via GitHub CLI (Advanced)

```bash
# Install GitHub CLI (if not installed)
brew install gh  # macOS
# or visit: https://cli.github.com/

# Login
gh auth login

# Add secrets
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://YOUR_PROJECT_ID.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-service-role-key"
gh secret set DATABASE_PASSWORD --body "your-database-password"
gh secret set DATABASE_URL --body "postgresql://postgres:your-database-password@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"
```

### Using Secrets in GitHub Actions

Example workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## ☁️ Step 3: Add to Vercel (Production Deployment)

### Method A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   ```
   https://vercel.com/dashboard
   ```

2. **Select your project** (or import from GitHub if not yet deployed)

3. **Go to Settings → Environment Variables**:
   ```
   https://vercel.com/YOUR_USERNAME/taskbridge/settings/environment-variables
   ```

4. **Add each variable**:

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | **Production only** |
   | `DATABASE_PASSWORD` | `your-database-password` | Production, Preview |
   | `DATABASE_URL` | Full connection string | Production, Preview |

5. **Click "Save"**

6. **Redeploy** to apply changes:
   - Go to **Deployments** tab
   - Click **⋯** on latest deployment → **Redeploy**

### Method B: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Link to project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DATABASE_PASSWORD production
vercel env add DATABASE_URL production

# Deploy
vercel --prod
```

### Method C: Vercel-Supabase Integration (Automatic)

**Best option** - automatically syncs environment variables:

1. Go to Vercel Dashboard → **Integrations**
2. Search for "Supabase"
3. Click **Add Integration**
4. Authorize and select your Supabase project
5. Select your Vercel project
6. Click **Connect**

✅ Environment variables will sync automatically!

---

## 📝 Step 4: Verify Setup

### Local Development

```bash
# Test that env vars are loaded
npm run dev

# Should start without errors
# Visit http://localhost:3000
```

### Check Environment Variables

Create a test API route to verify (remove after testing):

```typescript
// /app/api/test-env/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    databasePassword: process.env.DATABASE_PASSWORD ? '✅ Set' : '❌ Missing',
  })
}
```

Visit: `http://localhost:3000/api/test-env`

Should see all ✅ marks.

---

## 🔒 Security Best Practices

### DO ✅

- **Keep `.env.local` in `.gitignore`** (already done)
- **Never commit secrets to git**
- **Use different keys for development/production** (if possible)
- **Rotate passwords regularly** (every 90 days)
- **Use Vercel-Supabase integration** for automatic sync
- **Enable GitHub secret scanning** (Settings → Security)

### DON'T ❌

- **Never share secrets in Slack, email, or chat**
- **Never hardcode secrets in code**
- **Never commit `.env.local` to git**
- **Never use production keys in development**
- **Never log secrets to console**

---

## 🔄 Rotating Your Database Password (Recommended)

Since your password was shared in this chat, consider rotating it:

### Steps to Rotate:

1. **Go to Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/_/settings/database
   ```

2. **Click "Reset Database Password"**

3. **Copy new password**

4. **Update in all 3 places**:
   - `.env.local`
   - GitHub Secrets
   - Vercel Environment Variables

5. **Redeploy Vercel**

---

## 📚 Additional Resources

- **Supabase Environment Variables**: https://supabase.com/docs/guides/getting-started/local-development#environment-variables
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## ✅ Checklist

Before proceeding, ensure:

- [ ] `.env.local` exists with all 5 variables
- [ ] `.env.local` is in `.gitignore`
- [ ] GitHub Secrets configured (if using CI/CD)
- [ ] Vercel Environment Variables configured
- [ ] Test API route returns all ✅ marks
- [ ] Consider rotating database password

---

**Last Updated**: October 24, 2024
**Next Step**: Apply database schema from `/docs/infrastructure/supabase-vercel-setup.md`
