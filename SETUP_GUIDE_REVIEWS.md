# Setup Guide: Reviews System with Anonymous & Delayed Publishing

This guide walks you through setting up the complete reviews system with privacy controls.

## Overview

The system includes:
- ✅ Anonymous reviews (hide customer name from professional)
- ✅ Delayed publishing (environment-aware: 1 day in dev/staging, 1 week in production)
- ✅ Pending reviews page (`/reviews/pending`)
- ✅ Updated notifications (prompts for reviews)
- ✅ Vercel cron job (publishes delayed reviews daily)

**Environment-Based Delay:**
- **Production** (`trudify.com`): 7 days (1 week)
- **Staging** (`task-bridge-chi.vercel.app`): 1 day (for testing)
- **Development** (`localhost`): 1 day (for testing)

---

## Step 1: Apply Database Migrations

You need to apply **3 database migrations** to Supabase:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query for each migration file below
4. Copy the entire SQL content and execute

### Migration Files (in order):

#### 1. Add Privacy Fields (5 minutes)
**File**: `supabase/migrations/20251113_add_review_privacy_fields.sql`

```sql
-- Adds is_anonymous and published_at columns to reviews table
```

**What it does:**
- Adds `is_anonymous` column (BOOLEAN, default FALSE)
- Adds `published_at` column (TIMESTAMPTZ, default NOW)
- Sets `published_at = created_at` for existing reviews
- Creates index for efficient filtering

#### 2. Update Rating Trigger (5 minutes)
**File**: `supabase/migrations/20251113_update_rating_trigger_for_published_reviews.sql`

```sql
-- Modifies trigger to only count published reviews in ratings
```

**What it does:**
- Updates `update_professional_rating()` function
- Adds filter: `published_at <= NOW()`
- Ensures delayed reviews don't affect ratings until published

#### 3. Create Recalculation Function (5 minutes)
**File**: `supabase/migrations/20251113_create_rating_recalculation_function.sql`

```sql
-- Creates RPC function for manual rating recalculation
```

**What it does:**
- Creates `recalculate_professional_rating(UUID)` function
- Used by cron job to update ratings when delayed reviews publish
- Can be called manually if needed

### Option B: Via Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
# Link your project (first time only)
npx supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
npx supabase db push
```

---

## Step 2: Set Up Vercel Cron Job

The cron job runs daily at 2 AM UTC to publish delayed reviews.

### 2.1 Add Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate a secure random string (e.g., `openssl rand -hex 32`)
   - **Environments**: Production, Preview, Development (check all)

Example value:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Important**: This secret protects your cron endpoint from unauthorized access.

### 2.2 Deploy to Vercel

The `vercel.json` file has been updated with the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-delayed-reviews",
      "schedule": "0 2 * * *"  // Daily at 2 AM UTC
    }
  ]
}
```

Deploy your changes:

```bash
git add .
git commit -m "Add reviews system with delayed publishing"
git push
```

Vercel will automatically:
- Detect the cron configuration
- Schedule the job
- Run it daily at 2 AM UTC

### 2.3 Verify Cron Setup

After deployment:

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings** → **Crons**
3. You should see: `publish-delayed-reviews` scheduled for `0 2 * * *`

---

## Step 3: Test the Implementation

### Test 1: Submit Anonymous Review

1. Complete a task as a customer
2. Go to `/reviews/pending` page
3. Click "Leave Review" on a completed task
4. Check the **"Post review anonymously"** checkbox
5. Submit the review
6. Verify:
   - ✅ Review appears on professional's profile
   - ✅ Shows "Anonymous Customer" instead of your name
   - ✅ No avatar displayed

### Test 2: Submit Delayed Review

1. Go to `/reviews/pending` page
2. Click "Leave Review"
3. Check the **"Delay publishing (1 week)"** checkbox
4. Note the publish date shown: "Will be published on [date]"
5. Submit the review
6. Verify:
   - ✅ Review is NOT visible on professional's profile yet
   - ✅ Professional's rating has NOT changed
   - ✅ Review appears in database with `published_at` = 7 days from now

### Test 3: Pending Reviews Page

1. As a customer, complete 2-3 tasks
2. Navigate to `/reviews/pending`
3. Verify:
   - ✅ All completed, unreviewed tasks appear
   - ✅ Professional names and avatars shown
   - ✅ "Leave Review" button works
   - ✅ Empty state shows when no pending reviews

### Test 4: Notification Flow

1. Professional marks task as complete
2. Check your notifications (bell icon)
3. Verify:
   - ✅ Notification says "Task Completed - Review Needed ⭐"
   - ✅ Clicking notification goes to `/reviews/pending`
   - ✅ Telegram notification (if connected) mentions leaving review

### Test 5: Cron Job (Manual)

To test the cron job without waiting 24 hours:

1. Create a review with `published_at` = yesterday
2. Call the cron endpoint manually:

```bash
curl -X GET https://your-domain.vercel.app/api/cron/publish-delayed-reviews \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

3. Check the response:
```json
{
  "success": true,
  "reviewsProcessed": 1,
  "professionalsAffected": 1,
  "successCount": 1
}
```

4. Verify the professional's rating was updated

---

## Step 4: Monitor in Production

### Vercel Cron Logs

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Logs**
3. Filter by: `/api/cron/publish-delayed-reviews`
4. Check daily at 2 AM UTC for execution logs

Expected log output:
```
[Cron] Publish delayed reviews job started
[Cron] Checking for newly published reviews between...
[Cron] Found 3 newly published reviews
[Cron] Affected professionals: 2
[Cron] Successfully recalculated rating for abc-123
[Cron] Successfully recalculated rating for def-456
[Cron] Job completed: 2 succeeded, 0 failed
```

### Database Monitoring

Check review publish status:

```sql
-- See upcoming delayed reviews
SELECT id, rating, published_at,
       (published_at > NOW()) as is_delayed,
       (published_at - NOW()) as time_until_publish
FROM reviews
WHERE published_at > NOW()
ORDER BY published_at ASC;

-- See recently published reviews (last 24h)
SELECT id, rating, published_at, reviewee_id
FROM reviews
WHERE published_at <= NOW()
  AND published_at >= NOW() - INTERVAL '24 hours'
ORDER BY published_at DESC;
```

---

## Troubleshooting

### Issue: Cron job not running

**Check:**
1. Is `CRON_SECRET` set in Vercel environment variables?
2. Did you deploy after updating `vercel.json`?
3. Check Vercel Dashboard → Settings → Crons (should show the job)

**Solution:** Redeploy the project after confirming environment variables are set.

---

### Issue: Delayed reviews not affecting rating

**Check:**
1. Did you apply the trigger migration?
2. Run in Supabase SQL Editor:
```sql
SELECT * FROM pg_proc WHERE proname = 'update_professional_rating';
```
Should return the function with `published_at <= NOW()` filter.

**Solution:** Reapply migration 2 (`20251113_update_rating_trigger_for_published_reviews.sql`)

---

### Issue: Reviews immediately visible (not delayed)

**Check:**
1. Is `delayPublishing` being sent to API?
2. Check network tab in browser DevTools
3. Verify API receives: `{ delayPublishing: true }`

**Solution:** Check ReviewDialog component and ensure checkbox state is passed to `onSubmit()`

---

### Issue: Anonymous reviews showing customer name

**Check:**
1. Did you apply migration 1?
2. Check database:
```sql
SELECT id, is_anonymous, reviewer_id FROM reviews WHERE is_anonymous = true;
```

**Solution:**
- Ensure API includes `is_anonymous` in INSERT
- Check `/api/professionals/[id]/route.ts` checks `is_anonymous` field

---

## Security Notes

### CRON_SECRET Protection

The cron job requires authentication to prevent abuse:

```typescript
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Never:**
- ❌ Commit `CRON_SECRET` to git
- ❌ Share the secret publicly
- ❌ Use weak secrets (must be cryptographically random)

**Always:**
- ✅ Use `openssl rand -hex 32` or similar to generate
- ✅ Store only in Vercel environment variables
- ✅ Rotate periodically (every 6 months)

---

## Success Metrics

After deployment, monitor:

1. **Review Submission Rate**
   - Track pending reviews → submitted reviews conversion
   - Target: >80% of completed tasks get reviewed

2. **Privacy Feature Usage**
   - % of reviews marked anonymous
   - % of reviews with delayed publishing
   - Indicates user trust in the system

3. **Cron Job Health**
   - Daily execution success rate
   - Average reviews processed per run
   - Any failed rating recalculations

4. **Professional Rating Accuracy**
   - Compare ratings before/after delayed reviews publish
   - Ensure no rating drift

---

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Remind users of pending reviews (3 days after completion)
   - "You have 2 pending reviews" email

2. **Review Rewards**
   - Give customers small benefits for leaving reviews
   - Early access to new features, priority support

3. **Professional Response**
   - Allow professionals to respond to reviews
   - Build trust through professional engagement

4. **Review Reporting**
   - Allow users to report inappropriate reviews
   - Moderation queue for admin review

---

## Support

If you encounter issues:

1. Check Vercel logs: Dashboard → Logs → Filter by cron path
2. Check Supabase logs: Dashboard → Logs → API tab
3. Review migration status: Supabase → Database → Migrations
4. Test locally with: `npm run dev` and call endpoints manually

For questions, refer to:
- Vercel Cron docs: https://vercel.com/docs/cron-jobs
- Supabase RPC docs: https://supabase.com/docs/guides/database/functions
