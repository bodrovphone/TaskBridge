# Professional Mark Task Complete - API Integration

## Task Description

Implement the backend API endpoint that allows professionals to mark an in-progress task as completed. This triggers a status change and sends notifications to the customer for confirmation.

## Context

**User Story**: As a professional, when I finish work on a task, I want to mark it as complete so the customer can review and confirm the completion.

**Related UI Components** (Already Built):
- ✅ `TaskCompletionButton` - Triggers the action
- ✅ `MarkCompletedDialog` - Collects completion data from professional
- ✅ `PendingConfirmationBanner` - Shows waiting state

**Related Notification System** (Already Built):
- ✅ `createNotification()` - Smart routing service in `/src/lib/services/notification-service.ts`
- ✅ `NotificationTemplates.taskCompleted` - Telegram template in `/src/lib/services/telegram-notification.ts`
- ✅ Notification type `task_completed` with default routing: `both` (in-app + Telegram)

## Requirements

### 1. API Endpoint: `PATCH /api/tasks/[id]/mark-complete`

**Location**: `/src/app/api/tasks/[id]/mark-complete/route.ts`

**Request Body**:
```typescript
{
  completionNotes?: string,        // Optional notes from professional
  completionPhotos?: string[]      // Optional photo URLs (from Supabase Storage)
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  task?: {
    id: string,
    status: string,
    completed_by_professional_at: string
  }
}
```

### 2. Business Logic

**Authorization**:
- ✅ User must be authenticated
- ✅ User must be the assigned professional (`selected_professional_id`)
- ❌ Return 403 if not authorized

**Validation**:
- ✅ Task must exist
- ✅ Task status must be `in_progress`
- ❌ Return 400 if task not in correct state
- ❌ Return 404 if task not found

**Database Updates**:
```typescript
// Update tasks table
{
  status: 'pending_customer_confirmation',
  completed_by_professional_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Optional: Store completion notes/photos in metadata field
```

**Notification to Customer**:
```typescript
await createNotification({
  userId: task.customer_id,
  type: 'task_completed',
  templateData: {
    taskTitle: task.title,
    professionalName: professional.full_name,
  },
  metadata: {
    taskId: task.id,
    professionalId: professional.id,
    completedAt: new Date().toISOString(),
  },
  actionUrl: `/tasks/${task.id}`,
  deliveryChannel: 'both', // Critical: Telegram + In-app
});
```

### 3. Implementation Steps

**Step 1: Create API Route File**
- Create `/src/app/api/tasks/[id]/mark-complete/route.ts`
- Import necessary dependencies:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { createClient, createAdminClient } from '@/lib/supabase/server'
  import { createNotification } from '@/lib/services/notification-service'
  ```

**Step 2: Implement Authorization**
- Get authenticated user via `supabase.auth.getUser()`
- Fetch task with professional assignment check
- Verify `selected_professional_id === user.id`

**Step 3: Validate Task State**
- Check task exists
- Verify `status === 'in_progress'`
- Return appropriate error codes if validation fails

**Step 4: Update Task Status**
- Use `createAdminClient()` for database operations
- Update task record with new status and timestamp
- Handle errors with rollback logic if needed

**Step 5: Send Customer Notification**
- Fetch customer details (name, Telegram ID if connected)
- Call `createNotification()` with type `task_completed`
- Notification will be delivered via:
  - ✅ In-app notification center
  - ✅ Telegram bot (if customer connected Telegram)
- Log notification result

**Step 6: Return Success Response**
- Return updated task data
- Include success message for toast notification

### 4. Error Handling

**Expected Errors**:
```typescript
// 401 Unauthorized
{ error: 'Unauthorized' }

// 403 Forbidden
{ error: 'Only the assigned professional can mark this task as complete' }

// 404 Not Found
{ error: 'Task not found' }

// 400 Bad Request
{ error: 'Task must be in "in_progress" status to be marked complete' }

// 500 Internal Server Error
{ error: 'Failed to update task status' }
```

**Logging**:
```typescript
console.log('[Tasks] Professional marked task complete:', {
  taskId: task.id,
  taskTitle: task.title,
  professionalId: user.id,
  customerId: task.customer_id,
  notificationSent: notificationResult.success
})
```

## Database Schema Reference

**Tasks Table Fields Used**:
```sql
-- From supabase/migrations/20251027000000_initial_schema.sql
status TEXT CHECK (status IN (
  'draft',
  'open',
  'in_progress',
  'pending_customer_confirmation',  -- ← Set by this endpoint
  'completed',
  'cancelled',
  'disputed'
))

completed_by_professional_at TIMESTAMP  -- ← Set by this endpoint
confirmed_by_customer_at TIMESTAMP      -- Set by customer confirmation endpoint
customer_id UUID                         -- Used for notification
selected_professional_id UUID            -- Used for authorization
```

## Notification Template (Already Implemented)

**Telegram Message** (from `telegram-notification.ts`):
```
✅ Task Completed!

The task "[Task Title]" has been marked as complete.

Please review and rate the professional.
```

**In-app Notification**:
- Title: "Task Completed"
- Message: "[Professional Name] has marked your task as complete. Please review and confirm."
- Action Button: "Review Task" → `/tasks/[id]`

## Testing Checklist

### Manual Testing

- [ ] **Happy Path**:
  - [ ] Professional can mark their assigned task as complete
  - [ ] Task status changes to `pending_customer_confirmation`
  - [ ] `completed_by_professional_at` timestamp is set
  - [ ] Customer receives in-app notification
  - [ ] Customer receives Telegram notification (if Telegram connected)
  - [ ] UI shows "Waiting for Customer Confirmation" banner

- [ ] **Authorization**:
  - [ ] Non-authenticated user gets 401
  - [ ] Different professional cannot mark task complete (403)
  - [ ] Customer cannot mark task complete via this endpoint (403)

- [ ] **Validation**:
  - [ ] Cannot mark `open` task as complete
  - [ ] Cannot mark `completed` task as complete again
  - [ ] Cannot mark `cancelled` task as complete
  - [ ] Invalid task ID returns 404

- [ ] **Error Handling**:
  - [ ] Database errors are caught and logged
  - [ ] Failed notifications don't fail the request
  - [ ] Proper error messages returned to client

### Integration Testing

- [ ] Test with real Supabase database
- [ ] Test with Telegram bot notifications
- [ ] Test with different user locales (EN/BG/RU)
- [ ] Test notification fallback if Telegram fails

## Frontend Integration

**Component**: `/app/[lang]/tasks/[id]/page.tsx`

**Usage Example**:
```typescript
const handleMarkComplete = async (completionData: CompletionData) => {
  try {
    setIsLoading(true)

    const response = await fetch(`/api/tasks/${taskId}/mark-complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completionNotes: completionData.notes,
        completionPhotos: completionData.photos
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to mark task complete')
    }

    const result = await response.json()

    // Show success toast
    toast.success('Task marked as complete! Waiting for customer confirmation.')

    // Refresh task data
    router.refresh()

  } catch (error) {
    toast.error(error.message)
  } finally {
    setIsLoading(false)
  }
}
```

## Acceptance Criteria

- [ ] API endpoint created at `/api/tasks/[id]/mark-complete/route.ts`
- [ ] Professional can mark in-progress task as complete
- [ ] Task status updates to `pending_customer_confirmation`
- [ ] `completed_by_professional_at` timestamp is set correctly
- [ ] Customer receives notification (in-app + Telegram if connected)
- [ ] Proper authorization checks implemented
- [ ] Proper validation checks implemented
- [ ] Error handling with appropriate HTTP status codes
- [ ] Console logging for debugging
- [ ] Cannot mark task complete if not assigned professional
- [ ] Cannot mark task complete if not in `in_progress` status
- [ ] Frontend integration tested and working

## Technical Notes

- **Use Admin Client**: For database updates to bypass RLS policies
- **Transaction Safety**: Consider using Supabase transactions if storing additional data
- **Notification Delivery**: Don't fail request if notification fails - log and continue
- **Idempotency**: Consider handling duplicate requests (already marked complete)
- **Photo Upload**: If implementing photo upload, use Supabase Storage with proper RLS policies

## Related Files

- **API Route** (to create): `/src/app/api/tasks/[id]/mark-complete/route.ts`
- **Notification Service**: `/src/lib/services/notification-service.ts`
- **Telegram Service**: `/src/lib/services/telegram-notification.ts`
- **UI Component**: `/src/components/tasks/mark-completed-dialog.tsx`
- **Database Schema**: `/supabase/migrations/20251027000000_initial_schema.sql`

## Priority

**High** - Critical for task completion workflow

## Estimated Time

**4-6 hours**
- API route implementation: 2 hours
- Testing and debugging: 2 hours
- Frontend integration verification: 1 hour
- Documentation: 1 hour
