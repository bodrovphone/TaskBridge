# 🚀 Supabase Quickstart - Get Your Credentials

## You Need: Your Database Password

Get this from Supabase Dashboard → Settings → Database → Connection string

## You Need: 3 More Values from Supabase Dashboard

---

## Step 1: Open Supabase Dashboard

**Go to**: https://supabase.com/dashboard/project/_/settings/api

---

## Step 2: Copy Your Project URL

Look for a section that says **"Project URL"**:

```
Example: https://abcdefgh12345678.supabase.co
```

**Copy this entire URL** → You'll use it for `NEXT_PUBLIC_SUPABASE_URL`

---

## Step 3: Copy Your Anon Key

Look for **"Project API keys"** section, find **"anon public"**:

```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZ...
(very long string, ~200+ characters)
```

**Copy this key** → You'll use it for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Note**: This key is safe to expose in browser (it's "anon" = anonymous, public)

---

## Step 4: Copy Your Service Role Key

In the same **"Project API keys"** section, find **"service_role"**:

```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZ...
(very long string, different from anon key)
```

**Copy this key** → You'll use it for `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ WARNING**: This key is SECRET! It has admin privileges. Never expose to browser!

---

## Step 5: Get Your Project ID

Your Project ID is in the URL:

```
If your project URL is: https://abcdefgh12345678.supabase.co
Then your Project ID is: abcdefgh12345678
```

You need this for `DATABASE_URL`.

---

## Step 6: Update `.env.local`

Open `/TaskBridge/.env.local` and replace the placeholders:

```bash
# Replace these 4 values:

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# ↑ Paste your Project URL here

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
# ↑ Paste your anon key here

SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
# ↑ Paste your service_role key here

# Update PROJECT_ID and PASSWORD in DATABASE_URL:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
# ↑ Replace YOUR_PROJECT_ID and YOUR_PASSWORD with your actual values
```

---

## Step 7: Verify Setup

```bash
# Test that it works
npm run dev

# Should start successfully
# Visit http://localhost:3000
```

---

## ✅ You're Done with Local Setup!

### What You've Accomplished:
- ✅ Database password saved
- ✅ `.env.local` created and configured
- ✅ `.env.local` added to `.gitignore` (never committed)
- ✅ Ready for local development

---

## 🔜 Next Steps

### 1. **Add to GitHub Secrets** (if using CI/CD)
See: `/docs/infrastructure/environment-setup-guide.md` → Step 2

### 2. **Add to Vercel** (for production)
See: `/docs/infrastructure/environment-setup-guide.md` → Step 3

### 3. **Apply Database Schema**
See: `/docs/infrastructure/supabase-vercel-setup.md` → "Database Schema Setup" section

### 4. **Configure Authentication**
See: `/docs/infrastructure/supabase-vercel-setup.md` → "Authentication Setup" section

---

## 🆘 Troubleshooting

### Can't find Project URL or API keys?

1. Make sure you're logged into Supabase
2. Go to: https://supabase.com/dashboard
3. Click on your project name
4. In left sidebar, click: **Settings** → **API**
5. You should see "Project URL" and "Project API keys"

### Still stuck?

Check the comprehensive guide: `/docs/infrastructure/environment-setup-guide.md`

---

**Last Updated**: October 24, 2024
