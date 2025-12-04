# Staging Environment Setup

## Status: ON HOLD

**Reason**: Cost considerations - Supabase Pro Plan is $25/month base + $10 per additional project. Already running 2 projects, so this would add ~$10/month minimum for a staging database.

**Decision**: Defer until revenue justifies the cost. For now, test carefully on production with real test accounts.

**Completed**: `staging` branch created and pushed to origin.

---

## Task Description
Create a separate staging environment with its own Supabase database and Vercel deployment, while sharing OAuth providers (Google, Facebook, Telegram) with production.

## Alternative Considered (Rejected)
**Test data flagging approach** - Add `is_test` column to tasks/users and filter in queries.
- ❌ Rejected because: Becomes complex quickly (need to flag tasks, users, professionals, applications, reviews, messages). Risk of test data leaking to production. Too many query changes needed.

## Current State
- **Production**: Existing setup is production-ready with all env vars configured
- **Need**: Isolated staging environment to test fixes before deploying to production
- **Staging branch**: ✅ Created and pushed

## Architecture

```
PRODUCTION (existing)                 STAGING (new)
─────────────────────                 ─────────────────────
Branch: main                          Branch: staging
URL: trudify.com                      URL: staging-trudify.vercel.app
DB: nyleceedixybtogrwilv              DB: [NEW-STAGING-PROJECT]

Shared: Google OAuth, Facebook OAuth, Telegram Bot, SendGrid, DeepL
```

## Requirements

### 1. Create Staging Branch
- [ ] Create `staging` branch from `main`
- [ ] Configure Vercel to auto-deploy `staging` branch

### 2. Create Staging Supabase Project
- [ ] Create new Supabase project: `trudify-staging`
- [ ] Region: EU Central (Frankfurt) - same as production
- [ ] Apply database schema (initial + all migrations)
- [ ] Create storage buckets (avatars, task-images, documents)
- [ ] Copy RLS policies from production

### 3. Configure Vercel Staging Environment
- [ ] Go to Vercel → Project Settings → Environment Variables
- [ ] Add staging-specific variables with **Preview** environment scope:

| Variable | Staging Value | Scope |
|----------|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[STAGING-PROJECT].supabase.co` | Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from staging project) | Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | (from staging project) | Preview |
| `NEXT_PUBLIC_BASE_URL` | `https://staging-trudify.vercel.app` | Preview |

### 4. Shared Services (No Changes Needed)
These remain the same for both environments:
- `TG_BOT_TOKEN` - Same Telegram bot
- `TG_BOT_USERNAME` - Same bot username
- `SENDGRID_API_KEY` - Same SendGrid account
- `GOOGLE_OAUTH_CLIENT_ID` - Same Google OAuth (add staging redirect URL)
- `FACEBOOK_APP_ID` - Same Facebook app (add staging domain)
- `DEEPL_API_KEY` - Same DeepL account

### 5. Update OAuth Redirect URLs
- [ ] **Google Cloud Console**: Add redirect URI for staging Supabase project
  ```
  https://[STAGING-SUPABASE-REF].supabase.co/auth/v1/callback
  ```
- [ ] **Facebook Developers**: Add staging domain to allowed list
  ```
  staging-trudify.vercel.app
  ```

### 6. Configure Vercel Branch Deployments
- [ ] Vercel → Settings → Git → Production Branch: `main`
- [ ] Ensure Preview deployments use staging env vars for `staging` branch

## Acceptance Criteria
- [ ] `staging` branch exists and deploys automatically to Vercel
- [ ] Staging has its own isolated database (no data shared with production)
- [ ] Can push to `staging` branch and test changes in isolation
- [ ] OAuth login works on staging URL
- [ ] Telegram notifications work from staging

## Workflow After Setup

```bash
# Development workflow
git checkout staging
# make changes
git push origin staging
# → Auto-deploys to staging-trudify.vercel.app
# → Test changes in isolation

# When ready for production
git checkout main
git merge staging
git push origin main
# → Auto-deploys to trudify.com
```

## Technical Notes
- Staging DB will be empty initially - may need seed data for testing
- Consider adding a visual indicator (banner/badge) on staging to distinguish from production
- Database migrations should be applied to staging first, then production

## Priority
~~High~~ → **Low (On Hold)** - Deferred due to Supabase cost. Revisit when revenue justifies ~$10/month for staging database.
