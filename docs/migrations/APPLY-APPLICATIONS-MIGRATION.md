# Applications API Migration Guide

## Step 1: Apply Database Functions

You need to run the SQL functions in your Supabase Dashboard:

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Create new query** and paste the contents from `applications-functions.sql`
3. **Run the query**

Or run directly from this file:

```sql
-- Copy and paste this into Supabase SQL Editor

-- Function to increment applications_count when a new application is submitted
CREATE OR REPLACE FUNCTION increment_applications_count(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tasks
  SET
    applications_count = COALESCE(applications_count, 0) + 1,
    updated_at = NOW()
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement applications_count when an application is withdrawn
CREATE OR REPLACE FUNCTION decrement_applications_count(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tasks
  SET
    applications_count = GREATEST(COALESCE(applications_count, 0) - 1, 0),
    updated_at = NOW()
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate applications_count (for fixing inconsistencies)
CREATE OR REPLACE FUNCTION recalculate_applications_count(task_id UUID)
RETURNS INTEGER AS $$
DECLARE
  app_count INTEGER;
BEGIN
  -- Count non-withdrawn applications
  SELECT COUNT(*)
  INTO app_count
  FROM public.applications
  WHERE
    applications.task_id = recalculate_applications_count.task_id
    AND applications.status != 'withdrawn';

  -- Update task
  UPDATE public.tasks
  SET
    applications_count = app_count,
    updated_at = NOW()
  WHERE id = task_id;

  RETURN app_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_applications_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_applications_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_applications_count(UUID) TO authenticated;
```

## Step 2: Verify Database Schema

Make sure these tables exist and have the correct columns:

### Tasks Table
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name IN (
    'status',
    'selected_professional_id',
    'accepted_application_id',
    'applications_count'
  );
```

Expected columns:
- `status` (text) - Should allow: 'open', 'in_progress', 'completed', 'cancelled'
- `selected_professional_id` (uuid, nullable)
- `accepted_application_id` (uuid, nullable)
- `applications_count` (integer, default 0)

### Applications Table
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications';
```

Expected columns:
- `id` (uuid, primary key)
- `task_id` (uuid, foreign key to tasks)
- `professional_id` (uuid, foreign key to users)
- `proposed_price_bgn` (decimal)
- `estimated_duration_hours` (integer, nullable)
- `message` (text)
- `availability_date` (timestamp, nullable)
- `status` (text) - 'pending', 'accepted', 'rejected', 'withdrawn'
- `responded_at` (timestamp, nullable)
- `rejection_reason` (text, nullable)
- `withdrawn_at` (timestamp, nullable)
- `withdrawal_reason` (text, nullable)
- `created_at`, `updated_at` (timestamps)

## Step 3: Test API Endpoints

### Prerequisites
- Start your dev server: `npm run dev`
- Have at least one task created
- Be logged in

### Test 1: Submit Application (Professional)
```bash
# Replace with your values:
# - YOUR_AUTH_TOKEN: Get from browser DevTools → Application → Cookies → sb-access-token
# - TASK_ID: ID of an existing open task

curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN" \
  -d '{
    "taskId": "TASK_ID",
    "proposedPrice": 150,
    "estimatedDurationHours": 3,
    "message": "I have 5 years of experience in this field. Available to start immediately!",
    "availabilityDate": "2024-12-01T09:00:00Z"
  }'
```

Expected response (201):
```json
{
  "success": true,
  "application": {
    "id": "uuid",
    "task_id": "uuid",
    "professional_id": "uuid",
    "proposed_price_bgn": 150,
    "status": "pending",
    ...
  }
}
```

### Test 2: Get My Applications (Professional)
```bash
curl -X GET "http://localhost:3000/api/applications?status=pending" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN"
```

Expected response (200):
```json
{
  "applications": [
    {
      "id": "uuid",
      "status": "pending",
      "proposed_price_bgn": 150,
      "task": {
        "title": "Task title",
        "customer": {
          "full_name": "Customer Name"
        }
      }
    }
  ]
}
```

### Test 3: Get Task Applications (Task Owner)
```bash
curl -X GET "http://localhost:3000/api/tasks/TASK_ID/applications" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN"
```

### Test 4: Accept Application (Task Owner)
```bash
curl -X PATCH "http://localhost:3000/api/applications/APPLICATION_ID/accept" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN"
```

Expected response (200):
```json
{
  "success": true,
  "message": "Application accepted successfully"
}
```

**Verify:**
- Application status changed to `accepted`
- Task status changed to `in_progress`
- Task `selected_professional_id` is set
- All other pending applications are now `rejected`

### Test 5: Reject Application (Task Owner)
```bash
curl -X PATCH "http://localhost:3000/api/applications/APPLICATION_ID/reject" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN" \
  -d '{
    "reason": "Found another professional with better availability"
  }'
```

### Test 6: Withdraw Application (Professional)
```bash
curl -X PATCH "http://localhost:3000/api/applications/APPLICATION_ID/withdraw" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN" \
  -d '{
    "reason": "No longer available for this project"
  }'
```

## Step 4: Verify in Database

After testing, check the database:

```sql
-- Check applications
SELECT
  id,
  status,
  proposed_price_bgn,
  created_at
FROM applications
ORDER BY created_at DESC
LIMIT 10;

-- Check tasks with applications
SELECT
  id,
  title,
  status,
  applications_count,
  selected_professional_id
FROM tasks
WHERE applications_count > 0
ORDER BY updated_at DESC
LIMIT 10;
```

## Common Errors & Solutions

### Error: "Failed to create application"
- Check that the task exists and is in 'open' status
- Verify you're not the task owner
- Check for duplicate application (one per professional per task)

### Error: "Unauthorized"
- Make sure you're logged in
- Check that your auth token is valid
- Verify the token is being sent in the Cookie header

### Error: "Forbidden"
- Verify ownership (task owner for accept/reject, professional for withdraw)
- Check that you're not trying to apply to your own task

### Error: Database function not found
- Make sure you ran the SQL migration in Step 1
- Verify functions exist: `SELECT proname FROM pg_proc WHERE proname LIKE '%applications_count%';`

## Success Checklist

- [ ] SQL functions applied successfully
- [ ] Can submit application as professional
- [ ] Can view my applications with filters
- [ ] Task owner can view task applications
- [ ] Task owner can accept application (task becomes 'in_progress')
- [ ] Task owner can reject application
- [ ] Professional can withdraw pending application
- [ ] Applications count increments/decrements correctly
- [ ] Duplicate applications are prevented
- [ ] Cannot apply to own tasks
