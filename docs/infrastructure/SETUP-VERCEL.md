# Vercel Environment Variables Setup

## 🎯 Goal: Add Supabase credentials to Vercel for production deployment

---

## ⭐ Method 1: Vercel-Supabase Integration (RECOMMENDED - 2 minutes!)

### 🚀 **Fastest & Easiest** - Automatic Sync!

This is the **official integration** - no manual copying needed!

### Benefits:
- ✅ **Automatic sync** - Zero manual work
- ✅ **No typos** - Direct connection between services
- ✅ **Auto-updates** - Key rotations sync automatically
- ✅ **Official support** - Maintained by Vercel + Supabase

### Steps:

#### 1. Go to Vercel Dashboard
**URL**: https://vercel.com/dashboard

#### 2. Select Your Project
Click on your **TaskBridge** project

#### 3. Open Integrations Tab
Click **Integrations** in the top navigation

#### 4. Add Supabase Integration
- Search for "**Supabase**"
- Click **Add Integration**
- Click **Continue** → **Add**

#### 5. Connect Your Projects
- **Vercel Project**: Select **TaskBridge** (or your project name)
- **Supabase Project**: Select **nyleceedixybtogrwilv**
- Click **Connect**

#### 6. Verify Variables Were Added
Go to **Settings** → **Environment Variables**

You should see:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (may need to enable in integration settings)

### ✅ Done! That's it!

---

## 🔧 Optional: Add Database Credentials (Only if Needed)

The integration adds the 3 main Supabase variables. You **only need** direct database credentials if:
- Using raw SQL queries (not recommended - use Supabase client instead)
- Database migrations via direct connection
- Admin tools that need PostgreSQL connection

**Most apps DON'T need these** - the Supabase client is preferred!

If you do need them, add manually:

1. Go to **Settings** → **Environment Variables**
2. Click **Add New**

**Variable 1: DATABASE_PASSWORD**
```
Key: DATABASE_PASSWORD
Value: ppIus5x4M6w0yMNs
Environments: ✅ Production  ⬜ Preview  ⬜ Development
Mark as Sensitive: ✅
```

**Variable 2: DATABASE_URL**
```
Key: DATABASE_URL
Value: postgresql://postgres:ppIus5x4M6w0yMNs@db.nyleceedixybtogrwilv.supabase.co:5432/postgres
Environments: ✅ Production  ⬜ Preview  ⬜ Development
Mark as Sensitive: ✅
```

---

## 📋 Method 2: Vercel Dashboard (Manual - 5 minutes)

**Use this if**: Integration method doesn't work for some reason

### Step 1: Go to Your Vercel Project

**URL**: https://vercel.com/dashboard

1. Click on your **TaskBridge** project (or the project name you chose)
2. Click **Settings** tab (top navigation)
3. Click **Environment Variables** in left sidebar

### Step 2: Add Each Variable

Click **Add New** button and add these **5 variables**:

---

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://nyleceedixybtogrwilv.supabase.co

Environments: ✅ Production  ✅ Preview  ✅ Development
```

**Click "Save"**

---

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bGVjZWVkaXh5YnRvZ3J3aWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTE2NzQsImV4cCI6MjA3Njg4NzY3NH0.GMlMadxGMs9-basljRgj50SbZZz4-mR--JphEiuqd9Q

Environments: ✅ Production  ✅ Preview  ✅ Development
```

**Click "Save"**

---

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bGVjZWVkaXh5YnRvZ3J3aWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMTY3NCwiZXhwIjoyMDc2ODg3Njc0fQ.SpZsbad0luDBPLHY1pbtRoKUayqocTcuCHwLOYARzk0

⚠️ IMPORTANT: Mark as SENSITIVE (check the "Sensitive" box if available)

Environments: ✅ Production  ⬜ Preview  ⬜ Development
(Only Production for security!)
```

**Click "Save"**

---

#### Variable 4: DATABASE_PASSWORD

```
Key: DATABASE_PASSWORD
Value: ppIus5x4M6w0yMNs

⚠️ IMPORTANT: Mark as SENSITIVE

Environments: ✅ Production  ✅ Preview  ⬜ Development
```

**Click "Save"**

---

#### Variable 5: DATABASE_URL

```
Key: DATABASE_URL
Value: postgresql://postgres:ppIus5x4M6w0yMNs@db.nyleceedixybtogrwilv.supabase.co:5432/postgres

⚠️ IMPORTANT: Mark as SENSITIVE

Environments: ✅ Production  ✅ Preview  ⬜ Development
```

**Click "Save"**

---

### Step 3: Redeploy

After adding all variables, you need to **redeploy** for changes to take effect:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **⋯** menu (three dots)
4. Click **Redeploy**
5. Confirm

---

## Method 3: Vercel CLI (Advanced - 3 minutes)

### Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### Login and Link

```bash
# Login to Vercel
vercel login

# Link to your project (run from project root)
cd /Users/alexbodrov/pet_projects/TaskBridge
vercel link
```

### Add Environment Variables

Run these commands:

```bash
# Public variables (all environments)
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
# When prompted, paste: https://nyleceedixybtogrwilv.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
# When prompted, paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bGVjZWVkaXh5YnRvZ3J3aWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTE2NzQsImV4cCI6MjA3Njg4NzY3NH0.GMlMadxGMs9-basljRgj50SbZZz4-mR--JphEiuqd9Q

# Secret variables (production only)
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# When prompted, paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bGVjZWVkaXh5YnRvZ3J3aWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMTY3NCwiZXhwIjoyMDc2ODg3Njc0fQ.SpZsbad0luDBPLHY1pbtRoKUayqocTcuCHwLOYARzk0

vercel env add DATABASE_PASSWORD production preview
# When prompted, paste: ppIus5x4M6w0yMNs

vercel env add DATABASE_URL production preview
# When prompted, paste: postgresql://postgres:ppIus5x4M6w0yMNs@db.nyleceedixybtogrwilv.supabase.co:5432/postgres
```

### Deploy

```bash
vercel --prod
```

---


## ✅ Verify Setup

### Check Variables Are Set

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. You should see all 5 variables listed

### Test Deployment

1. Push a commit to your repository
2. Vercel will auto-deploy
3. Check deployment logs for any environment variable errors

---

## 🔒 Security Notes

- **service_role key**: Only in Production (highest privileges)
- **Database credentials**: Production + Preview only (not Development)
- **Anon key**: Safe for all environments (client-side)
- **Project URL**: Safe for all environments (public)

---

## 🆘 Troubleshooting

### "Environment variables not found" error

**Solution**: Make sure you **redeployed** after adding variables

1. Deployments tab → Latest deployment → ⋯ → Redeploy

### Variables not working in preview deployments

**Solution**: Check the "Preview" checkbox was selected when adding

### Still not working?

**Check the deployment logs**:
1. Go to Deployments
2. Click on the failing deployment
3. Click "View Function Logs"
4. Look for environment variable errors

---

## ✅ Checklist

- [ ] All 5 variables added to Vercel
- [ ] Marked sensitive variables (service_role, password, DB URL)
- [ ] Selected correct environments for each variable
- [ ] Redeployed after adding variables
- [ ] Verified deployment succeeded
- [ ] Tested that app loads without errors

---

**Next Steps**:
- ✅ Local development: Working (`.env.local` configured)
- ✅ GitHub Actions: Working (secrets configured)
- ✅ Vercel Production: Working (env vars configured)
- ⏸️ Database Schema: Later (when ready)
- ⏸️ Authentication: Later (when ready)

---

**Last Updated**: October 24, 2024
