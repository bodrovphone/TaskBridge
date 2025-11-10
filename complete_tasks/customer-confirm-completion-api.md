# Customer Confirm Task Completion - API Integration

## Task Description

Implement the backend API endpoint that allows customers to confirm or reject task completion after the professional marks it as done. This finalizes the task or returns it to in-progress state, and sends notifications to the professional.

## Context

**User Story**: As a customer, when I receive notification that my task is marked complete, I want to review the work and either confirm completion or report issues.

**Related UI Components** (Already Built):
- ✅ `ConfirmCompletionDialog` - Collects confirmation/rejection data from customer
- ✅ `TaskCompletionButton` - Triggers the confirmation action
- ✅ `CompletionSuccessView` - Shows success after completion

**Related Notification System** (Already Built):
- ✅ `createNotification()` - Smart routing service in `/src/lib/services/notification-service.ts`
- ✅ `NotificationTemplates.taskCompleted` - Telegram template
- ✅ Notification type `task_completed` with default routing: `both` (in-app + Telegram)

## Requirements

### 1. API Endpoint: `POST /api/tasks/[id]/confirm-completion`

**Location**: `/src/app/api/tasks/[id]/confirm-completion/route.ts`

**Request Body**:
```typescript
{
  action: 'confirm' | 'reject',

  // If action === 'confirm'
  confirmationData?: {
    actualPricePaid?: number,    // Optional: Track actual payment
    rating?: number,             // Optional: 1-5 star rating
    reviewText?: string          // Optional: Quick review text
  },

  // If action === 'reject'
  rejectionData?: {
    reason: string,              // Required: 'not_completed' | 'poor_quality' | 'different_scope' | 'other'
    description?: string         // Optional: Additional details
  }
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
    confirmed_by_customer_at?: string,
    completed_at?: string
  }
}
```

### 2. Business Logic - Confirm Path

**Authorization**:
- ✅ User must be authenticated
- ✅ User must be the task owner (`customer_id`)
- ❌ Return 403 if not authorized

**Validation**:
- ✅ Task must exist
- ✅ Task status must be `pending_customer_confirmation`
- ❌ Return 400 if task not in correct state
- ❌ Return 404 if task not found

**Database Updates (Confirm)**:
```typescript
// 1. Update tasks table
{
  status: 'completed',
  confirmed_by_customer_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  reviewed_by_customer: confirmationData.rating ? true : false
}

// 2. Delete rejected applications (cleanup)
// DELETE all applications with status = 'rejected' for this task
// Keep the accepted application for historical/audit purposes
await adminClient
  .from('applications')
  .delete()
  .eq('task_id', task.id)
  .eq('status', 'rejected');

// 3. Optional: Create review record if rating/review provided
if (confirmationData.rating || confirmationData.reviewText) {
  // Insert into reviews table
  {
    task_id: task.id,
    reviewer_id: customer.id,
    reviewee_id: task.selected_professional_id,
    rating: confirmationData.rating || 5,
    comment: confirmationData.reviewText,
    review_type: 'customer_to_professional'
  }
}
```

**Why Delete Rejected Applications?**
- ✅ **Cleanup**: Rejected applications are no longer needed once task is completed
- ✅ **Database Size**: Reduces storage by removing unnecessary records
- ✅ **Privacy**: Removes proposals from professionals who weren't selected
- ❌ **Keep Accepted**: The accepted application is preserved for:
  - Historical audit trail
  - Review reference (links professional to task)
  - Dispute resolution if needed
  - Analytics and reporting

**Browse Tasks Filtering** (Automatic):
- ✅ Completed tasks are automatically hidden from `/browse-tasks`
- ✅ The browse API filters by `status = 'open'` (see `/src/server/tasks/task.repository.ts:120`)
- ✅ No additional changes needed to hide completed tasks

**Notification to Professional (Confirm)**:
```typescript
await createNotification({
  userId: task.selected_professional_id,
  type: 'task_completed',
  templateData: {
    taskTitle: task.title,
    customerName: customer.full_name,
  },
  metadata: {
    taskId: task.id,
    customerId: customer.id,
    completedAt: new Date().toISOString(),
    rating: confirmationData.rating,
  },
  actionUrl: `/tasks/${task.id}`,
  deliveryChannel: 'both', // Critical: Telegram + In-app
});
```

### 3. Business Logic - Reject Path

**Database Updates (Reject)**:
```typescript
// Update tasks table - Return to in_progress
{
  status: 'in_progress',
  completed_by_professional_at: null,  // Clear the completion timestamp
  updated_at: new Date().toISOString()
}

// Log rejection reason in metadata or separate table
// Could be stored in task metadata field or notifications
```

**Notification to Professional (Reject)**:
```typescript
await createNotification({
  userId: task.selected_professional_id,
  type: 'task_status_changed',
  title: 'Task Completion Rejected',
  message: `The customer has requested changes for "${task.title}". Reason: ${rejectionData.reason}`,
  metadata: {
    taskId: task.id,
    customerId: customer.id,
    rejectionReason: rejectionData.reason,
    rejectionDescription: rejectionData.description,
  },
  actionUrl: `/tasks/${task.id}`,
  deliveryChannel: 'both', // Critical: Professional needs to know immediately
});
```

### 4. Implementation Steps

**Step 1: Create API Route File**
- Create `/src/app/api/tasks/[id]/confirm-completion/route.ts`
- Import necessary dependencies:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { createClient, createAdminClient } from '@/lib/supabase/server'
  import { createNotification } from '@/lib/services/notification-service'
  ```

**Step 2: Implement Authorization**
- Get authenticated user via `supabase.auth.getUser()`
- Fetch task with customer check
- Verify `customer_id === user.id`

**Step 3: Validate Request**
- Parse and validate request body
- Check `action` is either 'confirm' or 'reject'
- Verify task status is `pending_customer_confirmation`

**Step 4a: Handle Confirm Path**
- Update task to `completed` status
- Set `confirmed_by_customer_at` and `completed_at` timestamps
- Delete all rejected applications for this task (cleanup):
  ```typescript
  // Delete rejected applications
  const { data: deleteResult, error: deleteError } = await adminClient
    .from('applications')
    .delete()
    .eq('task_id', task.id)
    .eq('status', 'rejected')
    .select(); // Returns deleted records for logging

  // Log deletion (don't fail request if deletion fails)
  if (deleteError) {
    console.warn('[Tasks] Failed to delete rejected applications:', deleteError);
  } else {
    console.log(`[Tasks] Deleted ${deleteResult?.length || 0} rejected applications`);
  }
  ```
- Optionally create review record if rating/review provided
- Send success notification to professional
- Return success response

**Step 4b: Handle Reject Path**
- Update task back to `in_progress` status
- Clear `completed_by_professional_at` timestamp
- Log rejection reason
- Send notification to professional with rejection details
- Return success response

**Step 5: Error Handling**
- Wrap all operations in try-catch
- Log errors for debugging
- Return appropriate HTTP status codes
- Don't fail request if notification fails

### 5. Error Handling

**Expected Errors**:
```typescript
// 401 Unauthorized
{ error: 'Unauthorized' }

// 403 Forbidden
{ error: 'Only the task owner can confirm completion' }

// 404 Not Found
{ error: 'Task not found' }

// 400 Bad Request - Invalid action
{ error: 'Action must be "confirm" or "reject"' }

// 400 Bad Request - Wrong status
{ error: 'Task must be pending customer confirmation' }

// 400 Bad Request - Missing data
{ error: 'Rejection reason is required when rejecting' }

// 500 Internal Server Error
{ error: 'Failed to update task status' }
```

**Logging**:
```typescript
console.log('[Tasks] Customer action on completion:', {
  taskId: task.id,
  taskTitle: task.title,
  customerId: user.id,
  action: action,
  professionalId: task.selected_professional_id,
  rating: confirmationData?.rating,
  rejectionReason: rejectionData?.reason,
  applicationsDeleted: deleteResult?.count || 0, // Count of rejected apps deleted
  notificationSent: notificationResult.success
})
```

## Database Schema Reference

**Tasks Table Fields Used**:
```sql
-- From supabase/migrations/20251027000000_initial_schema.sql
status TEXT CHECK (status IN (
  'in_progress',                      -- ← Reject sets this
  'pending_customer_confirmation',    -- ← Required current state
  'completed'                         -- ← Confirm sets this
))

completed_by_professional_at TIMESTAMP  -- Professional completion time
confirmed_by_customer_at TIMESTAMP      -- ← Confirm sets this
completed_at TIMESTAMP                  -- ← Confirm sets this (final completion)
reviewed_by_customer BOOLEAN            -- ← Set true if review provided
```

**Reviews Table** (Optional - if review provided):
```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id),
  reviewer_id UUID NOT NULL REFERENCES public.users(id),
  reviewee_id UUID NOT NULL REFERENCES public.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  review_type TEXT CHECK (review_type IN ('customer_to_professional', 'professional_to_customer'))
)
```

**Applications Table** (for cleanup):
```sql
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'))
)

-- Note: ON DELETE CASCADE means if task is deleted, applications auto-delete
-- However, we're manually deleting rejected applications when task completes
```

## Notification Templates

### Confirm Notification (To Professional)
**Telegram Message**:
```
✅ Task Completed!

Congratulations! The customer has confirmed completion of "[Task Title]".

[If rating provided]
⭐ Rating: [X]/5 stars

Great work!
```

### Reject Notification (To Professional)
**Telegram Message**:
```
⚠️ Changes Requested

The customer has requested changes for "[Task Title]".

Reason: [Rejection Reason]
[Description if provided]

Please review the task and address the customer's concerns.
```

## Testing Checklist

### Manual Testing - Confirm Path

- [ ] **Happy Path**:
  - [ ] Customer can confirm task completion
  - [ ] Task status changes to `completed`
  - [ ] `confirmed_by_customer_at` timestamp is set
  - [ ] `completed_at` timestamp is set
  - [ ] All rejected applications are deleted from database
  - [ ] Accepted application is preserved (not deleted)
  - [ ] Professional receives in-app notification
  - [ ] Professional receives Telegram notification (if connected)
  - [ ] UI shows completion success view
  - [ ] Task no longer appears in `/browse-tasks` API results

- [ ] **Application Cleanup**:
  - [ ] Task with 5 applications (1 accepted, 4 rejected) → 4 deleted, 1 kept
  - [ ] Task with 1 application (accepted) → 0 deleted, 1 kept
  - [ ] Verify accepted application still accessible for history/reviews
  - [ ] Deletion does not affect other tasks' applications

- [ ] **With Review Data**:
  - [ ] Confirmation with rating creates review record
  - [ ] Confirmation with review text creates review record
  - [ ] Review is linked to task and users correctly
  - [ ] `reviewed_by_customer` flag is set

- [ ] **Authorization**:
  - [ ] Non-customer cannot confirm (403)
  - [ ] Professional cannot confirm via this endpoint (403)

### Manual Testing - Reject Path

- [ ] **Happy Path**:
  - [ ] Customer can reject completion
  - [ ] Task status returns to `in_progress`
  - [ ] `completed_by_professional_at` is cleared
  - [ ] Professional receives notification with rejection reason
  - [ ] Task becomes workable again

- [ ] **Validation**:
  - [ ] Rejection without reason fails (400)
  - [ ] Cannot reject task not pending confirmation (400)

### Error Cases

- [ ] Cannot confirm/reject `in_progress` task
- [ ] Cannot confirm/reject already `completed` task
- [ ] Invalid task ID returns 404
- [ ] Database errors are caught and logged

## Frontend Integration

**Component**: `/app/[lang]/tasks/[id]/page.tsx`

**Usage Example**:
```typescript
const handleConfirmCompletion = async (confirmationData?: ConfirmationData) => {
  try {
    setIsLoading(true)

    const response = await fetch(`/api/tasks/${taskId}/confirm-completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'confirm',
        confirmationData
      })
    })

    if (!response.ok) {
      throw new Error('Failed to confirm completion')
    }

    toast.success('Task completed successfully!')
    router.push(`/tasks/${taskId}?completed=true`)

  } catch (error) {
    toast.error(error.message)
  } finally {
    setIsLoading(false)
  }
}

const handleRejectCompletion = async (reason: string, description?: string) => {
  try {
    setIsLoading(true)

    const response = await fetch(`/api/tasks/${taskId}/confirm-completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reject',
        rejectionData: { reason, description }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to reject completion')
    }

    toast.success('Feedback sent to professional')
    router.refresh()

  } catch (error) {
    toast.error(error.message)
  } finally {
    setIsLoading(false)
  }
}
```

## Acceptance Criteria

### Confirm Path
- [ ] API endpoint created at `/api/tasks/[id]/confirm-completion/route.ts`
- [ ] Customer can confirm task completion
- [ ] Task status updates to `completed`
- [ ] `confirmed_by_customer_at` timestamp is set
- [ ] `completed_at` timestamp is set
- [ ] All rejected applications are deleted (cleanup)
- [ ] Accepted application is preserved (audit trail)
- [ ] Completed task is automatically hidden from browse-tasks results
- [ ] Professional receives notification (in-app + Telegram)
- [ ] Optional review data is saved to reviews table
- [ ] `reviewed_by_customer` flag is updated

### Reject Path
- [ ] Customer can reject task completion
- [ ] Task status returns to `in_progress`
- [ ] `completed_by_professional_at` is cleared
- [ ] Professional receives notification with rejection details
- [ ] Rejection reason is logged
- [ ] Professional can rework and mark complete again

### General
- [ ] Proper authorization checks implemented
- [ ] Proper validation checks implemented
- [ ] Error handling with appropriate HTTP status codes
- [ ] Console logging for debugging
- [ ] Frontend integration tested and working
- [ ] Notification delivery working (both channels)

## Technical Notes

- **Dual Action Endpoint**: Single endpoint handles both confirm and reject to simplify client logic
- **Transaction Safety**: Consider using Supabase transactions for atomicity (task update + review insert + application cleanup)
- **Review Creation**: Only create review if rating OR review text provided
- **Application Cleanup**: Delete rejected applications to reduce database size and improve privacy
- **Keep Accepted Application**: Preserve for audit trail, reviews, and dispute resolution
- **Notification Delivery**: Both paths should send notifications - don't fail request if notification fails
- **Task Reopening**: Rejection should fully restore task to workable state
- **Idempotency**: Consider handling duplicate confirmations (already completed)
- **Browse Tasks Filtering**: Completed tasks are automatically filtered by `status = 'open'` check in TaskRepository

## Advanced Features (Future)

- [ ] Allow customer to message professional during rejection
- [ ] Track number of rejection cycles (professional marks → customer rejects)
- [ ] Auto-complete task after X days if customer doesn't respond
- [ ] Allow professional to respond to rejection
- [ ] Dispute resolution workflow if multiple rejections occur

## Related Files

- **API Route** (to create): `/src/app/api/tasks/[id]/confirm-completion/route.ts`
- **Notification Service**: `/src/lib/services/notification-service.ts`
- **Telegram Service**: `/src/lib/services/telegram-notification.ts`
- **UI Component**: `/src/components/tasks/confirm-completion-dialog.tsx`
- **Database Schema**: `/supabase/migrations/20251027000000_initial_schema.sql`
- **Previous Task**: `professional-mark-task-complete-api.md`

## Priority

**High** - Critical for task completion workflow (must be implemented after professional mark complete)

## Estimated Time

**6-8 hours**
- API route implementation (both paths): 3 hours
- Application cleanup logic: 1 hour
- Review creation logic: 1 hour
- Testing and debugging: 2-3 hours
- Frontend integration verification: 1 hour
