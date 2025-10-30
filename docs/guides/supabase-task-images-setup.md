# Supabase Task Images Setup Guide

**Complete step-by-step guide for setting up task photo uploads with automatic cleanup**

---

## Part 1: Storage Bucket Setup

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your **TaskBridge** project

### Step 2: Create Storage Bucket

1. Click **Storage** in the left sidebar
2. Click **New bucket** button (top right)
3. Fill in the form:
   - **Name**: `task-images`
   - **Public bucket**: ✅ **Check this box** (images need to be publicly viewable)
   - **File size limit**: `1048576` (1MB in bytes)
   - **Allowed MIME types**: Leave empty for now (we'll validate client-side)
4. Click **Create bucket**

**✅ Expected Result**: You should see `task-images` bucket in the list.

---

## Part 2: Storage Policies (Security)

### Step 3: Set Up Access Policies

1. Still in **Storage** section, click on `task-images` bucket
2. Click **Policies** tab at the top
3. Click **New Policy** button

#### Policy 1: Public Read Access (Anyone can view images)

Click **"For full customization"** → **Create policy**

```sql
-- Policy Name: "Public read access for task images"
-- Allowed operation: SELECT
-- Policy definition:

CREATE POLICY "Public read access for task images"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-images');
```

**Or use the UI:**
- Policy name: `Public read access for task images`
- Target roles: `public`, `authenticated`
- SELECT: ✅ Checked
- WITH CHECK expression: `bucket_id = 'task-images'`

#### Policy 2: Authenticated Users Can Upload

Click **New Policy** again:

```sql
-- Policy Name: "Authenticated users can upload task images"
-- Allowed operation: INSERT
-- Policy definition:

CREATE POLICY "Authenticated users can upload task images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-images' AND
  auth.role() = 'authenticated'
);
```

**Or use the UI:**
- Policy name: `Authenticated users can upload task images`
- Target roles: `authenticated`
- INSERT: ✅ Checked
- WITH CHECK expression: `bucket_id = 'task-images' AND auth.role() = 'authenticated'`

#### Policy 3: Users Can Update Their Own Images

```sql
-- Policy Name: "Users can update their own task images"
-- Allowed operation: UPDATE
-- Policy definition:

CREATE POLICY "Users can update their own task images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'task-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'task-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Users Can Delete Their Own Images

```sql
-- Policy Name: "Users can delete their own task images"
-- Allowed operation: DELETE
-- Policy definition:

CREATE POLICY "Users can delete their own task images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**✅ Expected Result**: You should see 4 policies listed for the `task-images` bucket.

---

## Part 3: Test the Setup

### Step 4: Upload Test Image

1. Go to **Storage** → `task-images` bucket
2. Click **Upload file** button
3. Create a test folder structure:
   - Create folder: `test-user-id`
   - Inside that folder, upload a test image: `test-task-id.jpg`
4. After upload, click on the image
5. Click **Get URL** button
6. Copy the public URL

**✅ Expected Result**: URL should look like:
```
https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/task-images/test-user-id/test-task-id.jpg
```

### Step 5: Verify Public Access

1. Open a new **incognito/private browser window** (to test unauthenticated access)
2. Paste the URL you copied
3. The image should load successfully

**✅ Expected Result**: Image loads without authentication required.

### Step 6: Clean Up Test Files

1. Go back to Supabase Dashboard → Storage → `task-images`
2. Delete the test folder you created
3. Confirm deletion

---

## Part 4: Automatic Cleanup for Old Images

### Step 7: Create Cleanup Function

1. Go to **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy and paste this SQL:

```sql
-- ============================================
-- FUNCTION: Cleanup old task images
-- Deletes images from completed tasks older than 30 days
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_task_images()
RETURNS TABLE (
  deleted_count INTEGER,
  cleanup_log TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
DECLARE
  task_record RECORD;
  image_path TEXT;
  deleted_files INTEGER := 0;
  cleanup_summary TEXT := '';
BEGIN
  -- Find completed tasks older than 30 days with images
  FOR task_record IN
    SELECT
      id,
      images,
      completed_at,
      title
    FROM public.tasks
    WHERE
      status = 'completed'
      AND completed_at < NOW() - INTERVAL '30 days'
      AND images IS NOT NULL
      AND array_length(images, 1) > 0
  LOOP
    -- Loop through each image URL in the task
    FOREACH image_path IN ARRAY task_record.images
    LOOP
      BEGIN
        -- Extract the storage path from the full URL
        -- URL format: https://PROJECT.supabase.co/storage/v1/object/public/task-images/user-id/task-id.jpg
        -- We need: task-images/user-id/task-id.jpg

        DECLARE
          storage_path TEXT;
        BEGIN
          -- Extract path after 'task-images/'
          storage_path := substring(image_path from 'task-images/(.+)$');

          IF storage_path IS NOT NULL THEN
            -- Delete from storage using the storage API
            PERFORM storage.delete_object('task-images', storage_path);

            deleted_files := deleted_files + 1;
            cleanup_summary := cleanup_summary ||
              format('Deleted: %s (Task: %s)%s',
                storage_path,
                task_record.title,
                chr(10)); -- newline
          END IF;
        END;
      EXCEPTION
        WHEN OTHERS THEN
          -- Log error but continue processing
          cleanup_summary := cleanup_summary ||
            format('Error deleting %s: %s%s',
              image_path,
              SQLERRM,
              chr(10));
      END;
    END LOOP;

    -- Clear the images array from the task record
    UPDATE public.tasks
    SET images = ARRAY[]::TEXT[]
    WHERE id = task_record.id;

  END LOOP;

  -- Return summary
  RETURN QUERY SELECT
    deleted_files,
    CASE
      WHEN deleted_files = 0 THEN 'No old images to cleanup'
      ELSE cleanup_summary
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_task_images() TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION cleanup_old_task_images IS
  'Deletes images from completed tasks older than 30 days to free up storage space. Safe to run manually or via cron.';
```

4. Click **Run** (or press Cmd/Ctrl + Enter)

**✅ Expected Result**: Should see "Success. No rows returned"

### Step 8: Test the Cleanup Function (Optional)

To test if the function works, run:

```sql
-- This will show what would be deleted (without actually deleting)
SELECT * FROM cleanup_old_task_images();
```

**✅ Expected Result**:
```
deleted_count | cleanup_log
--------------+----------------------------------
0             | No old images to cleanup
```

### Step 9: Set Up Automated Cleanup (Daily Schedule)

Now let's create a scheduled job to run this cleanup automatically.

**Option A: Using pg_cron (Recommended)**

1. Still in **SQL Editor**, run this:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup to run daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-old-task-images',           -- Job name
  '0 3 * * *',                         -- Cron schedule (3 AM UTC daily)
  $$SELECT cleanup_old_task_images()$$ -- SQL command
);
```

**✅ Expected Result**: Should return a job ID (e.g., `1`)

**To verify the schedule was created:**

```sql
-- List all scheduled jobs
SELECT * FROM cron.job;
```

You should see your `cleanup-old-task-images` job listed.

**Option B: Using Supabase Database Webhooks (Alternative)**

If pg_cron is not available, use Database Webhooks:

1. Go to **Database** → **Webhooks** in Supabase Dashboard
2. Click **Create a new hook**
3. Configure:
   - **Name**: `cleanup_old_task_images`
   - **Table**: `tasks`
   - **Events**: `UPDATE` (or use `INSERT` and filter by status)
   - **Type**: `HTTP Request`
   - **HTTP Request**: Create an Edge Function (see Option C below)

**Option C: Manual Cleanup (Simplest for MVP)**

For MVP, you can just run the cleanup manually once a week:

1. Go to **SQL Editor**
2. Run: `SELECT * FROM cleanup_old_task_images();`
3. Check the results

**💡 Recommendation for MVP**: Start with manual cleanup (Option C). You can automate later when you have real traffic.

---

## Part 5: Monitoring & Maintenance

### Step 10: Check Storage Usage

1. Go to **Settings** → **Billing** → **Usage**
2. Scroll to **Storage** section
3. Monitor your usage:
   - **Current**: How much storage you're using
   - **Limit**: 1 GB on free tier

**Set up alerts:**
1. Go to **Settings** → **Billing** → **Usage alerts**
2. Add alert: "Notify me when storage reaches 800 MB" (80% of limit)

### Step 11: View Cleanup Logs

To see what was cleaned up:

```sql
-- Run cleanup and see detailed log
SELECT
  deleted_count,
  cleanup_log
FROM cleanup_old_task_images();
```

### Step 12: Adjust Retention Period (Optional)

If you want to keep images longer or shorter than 30 days:

```sql
-- View the current function
\df+ cleanup_old_task_images

-- To modify: Edit the function and change this line:
--   WHERE completed_at < NOW() - INTERVAL '30 days'
-- To:
--   WHERE completed_at < NOW() - INTERVAL '60 days'  -- Keep for 60 days
-- Or:
--   WHERE completed_at < NOW() - INTERVAL '7 days'   -- Delete after 7 days
```

---

## Part 6: Troubleshooting

### Problem: "bucket not found" error

**Solution:**
- Verify bucket name is exactly `task-images` (no spaces, all lowercase)
- Check you're in the correct Supabase project

### Problem: "permission denied" when uploading

**Solution:**
- Verify all 4 storage policies are created
- Check the authenticated user has a valid session
- Verify the file path follows the pattern: `user-id/task-id.jpg`

### Problem: Cleanup function doesn't delete anything

**Solution:**
- Check if you have completed tasks older than 30 days:
  ```sql
  SELECT
    id,
    title,
    completed_at,
    images
  FROM tasks
  WHERE
    status = 'completed'
    AND completed_at < NOW() - INTERVAL '30 days'
    AND array_length(images, 1) > 0;
  ```
- If no results, the function is working correctly (nothing to clean up)

### Problem: pg_cron not available

**Solution:**
- Check if extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
- If not available on free tier, use manual cleanup (Option C above)

---

## Quick Reference Commands

### Manually Run Cleanup
```sql
SELECT * FROM cleanup_old_task_images();
```

### Check Storage Usage
```sql
-- Count total images
SELECT COUNT(*)
FROM storage.objects
WHERE bucket_id = 'task-images';

-- Check old tasks that will be cleaned up
SELECT
  COUNT(*) as tasks_to_cleanup,
  SUM(array_length(images, 1)) as images_to_delete
FROM tasks
WHERE
  status = 'completed'
  AND completed_at < NOW() - INTERVAL '30 days'
  AND array_length(images, 1) > 0;
```

### Disable Automated Cleanup (if needed)
```sql
-- Remove the scheduled job
SELECT cron.unschedule('cleanup-old-task-images');
```

### Re-enable Automated Cleanup
```sql
-- Re-create the schedule
SELECT cron.schedule(
  'cleanup-old-task-images',
  '0 3 * * *',
  $$SELECT cleanup_old_task_images()$$
);
```

---

## Security Notes

✅ **Safe**:
- Images are public (anyone can view via URL)
- Only authenticated users can upload
- Users can only delete their own images
- Cleanup function runs with elevated privileges but is safe

⚠️ **Important**:
- Don't share your `SUPABASE_SERVICE_ROLE_KEY` - keep it secret!
- The cleanup function is irreversible - deleted images cannot be recovered
- Consider testing with a few real tasks before enabling automated cleanup

---

## Next Steps

After completing this setup:

1. ✅ **Test the upload** - Try uploading an image from your app
2. ✅ **Verify public access** - Check the image loads in an incognito window
3. ✅ **Set up monitoring** - Add usage alerts at 80% capacity
4. ✅ **Document your process** - Save this guide for future reference

**For Development:**
- Use real task IDs in the upload path
- Test the cleanup function with test data
- Monitor storage usage weekly for the first month

**For Production:**
- Enable automated cleanup after validating it works
- Set up storage alerts
- Consider upgrading storage if you approach 1GB limit

---

**Setup Complete! 🎉**

Your task image upload system is now configured and ready to use. The cleanup automation will keep your storage usage under control by removing images from old completed tasks.

**Estimated capacity with cleanup:**
- ~10,000 active task images (incomplete + recent completed)
- Unlimited historical tasks (images cleaned after 30 days)
