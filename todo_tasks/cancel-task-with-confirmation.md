# Cancel Task with Confirmation Dialog

## Task Description
Implement the "Cancel Task" functionality with a beautiful confirmation dialog that warns users about the consequences of canceling a task (all applications will be deleted along with the task).

## Current State
- "Cancel Task" button exists in task-actions.tsx (line 116-122)
- Currently shows a basic browser confirm dialog
- Shows placeholder alert message: "Task cancellation feature coming soon!"
- No actual cancellation happens

## Target State
- Beautiful styled confirmation dialog (NextUI Modal)
- Clear warning about consequences
- API endpoint to handle task cancellation
- Proper error handling and success feedback
- All related data cleanup (applications, messages, notifications)

## Requirements

### 1. Confirmation Dialog UI
- [ ] Create `CancelTaskDialog` component in `/src/components/tasks/`
- [ ] Use NextUI Modal for consistent styling
- [ ] Warning design elements:
  - Danger color scheme (red accents)
  - Warning icon (AlertTriangle from lucide-react)
  - Bold, clear warning text
  - List of consequences (applications deleted, can't be undone, etc.)
- [ ] Two action buttons:
  - "Cancel" (secondary) - Close dialog without action
  - "Yes, Cancel Task" (danger) - Confirm cancellation
- [ ] Loading state while API call is in progress

**Dialog Content:**
```
⚠️ Cancel This Task?

This action cannot be undone and will:
• Delete all applications from professionals (X applications)
• Remove the task from search results
• Cancel any active discussions
• Delete all related notifications

Are you sure you want to cancel this task?

[Cancel] [Yes, Cancel Task]
```

### 2. API Endpoint
- [ ] Create DELETE endpoint: `/api/tasks/[id]/cancel`
- [ ] Server-side validation:
  - Verify user is the task author
  - Check task status allows cancellation (can't cancel completed tasks)
  - Validate task exists
- [ ] Database operations (transactional):
  - Delete all applications for this task
  - Delete all task-related messages
  - Delete all task-related notifications
  - Update task status to 'cancelled' (or delete entirely)
- [ ] Return success/error response with appropriate status codes

**Endpoint Structure:**
```typescript
// DELETE /api/tasks/[id]/cancel
// Returns: { success: boolean, message: string }
```

### 3. Integration with task-actions.tsx
- [ ] Replace current `handleCancelClick` implementation
- [ ] Open CancelTaskDialog instead of browser confirm
- [ ] Pass task data (id, title, applications count)
- [ ] Handle dialog confirmation:
  - Call DELETE API endpoint
  - Show loading state
  - Handle success: toast message + redirect to /tasks/posted
  - Handle error: toast error message
- [ ] Disable cancel button while processing

### 4. Permissions & Status Checks
- [ ] Only task author can see/use cancel button (already implemented)
- [ ] Can only cancel tasks with status: 'open', 'in_progress'
- [ ] Cannot cancel: 'completed', 'cancelled', 'archived'
- [ ] Update `canCancelTask` utility if needed

### 5. Database Schema Considerations
**Tasks Table:**
- [ ] Ensure 'cancelled' is a valid status enum value
- [ ] OR decide if tasks should be soft-deleted (deleted_at timestamp)

**Cleanup Strategy:**
```sql
-- Option 1: Mark as cancelled (keep data)
UPDATE tasks SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1;

-- Option 2: Hard delete (remove all data)
DELETE FROM applications WHERE task_id = $1;
DELETE FROM messages WHERE task_id = $1;
DELETE FROM notifications WHERE task_id = $1;
DELETE FROM tasks WHERE id = $1;
```

### 6. Notifications for Affected Users
- [ ] Send notification to all professionals who applied
- [ ] Notification message: "The task '[Task Title]' has been cancelled by the client"
- [ ] Include link to browse other tasks
- [ ] Mark all task-related notifications as read/dismissed

### 7. Translation Keys

**Add to notifications.ts (all languages):**
- [ ] `taskDetail.cancelDialog.title` - "Cancel This Task?"
- [ ] `taskDetail.cancelDialog.warning` - "This action cannot be undone and will:"
- [ ] `taskDetail.cancelDialog.consequence1` - "Delete all applications from professionals"
- [ ] `taskDetail.cancelDialog.consequence2` - "Remove the task from search results"
- [ ] `taskDetail.cancelDialog.consequence3` - "Cancel any active discussions"
- [ ] `taskDetail.cancelDialog.consequence4` - "Delete all related notifications"
- [ ] `taskDetail.cancelDialog.confirm` - "Are you sure you want to cancel this task?"
- [ ] `taskDetail.cancelDialog.btnCancel` - "Cancel"
- [ ] `taskDetail.cancelDialog.btnConfirm` - "Yes, Cancel Task"
- [ ] `taskDetail.cancelDialog.processing` - "Cancelling..."
- [ ] `taskDetail.cancelSuccess` - "Task cancelled successfully"
- [ ] `taskDetail.cancelError` - "Failed to cancel task. Please try again."
- [ ] `taskDetail.cancelNotification` - "Task '{title}' has been cancelled"

**Bulgarian:**
```typescript
'taskDetail.cancelDialog.title': 'Отменяте ли тази задача?'
'taskDetail.cancelDialog.warning': 'Това действие е необратимо и ще:'
'taskDetail.cancelDialog.consequence1': 'Изтрие всички кандидатури от професионалисти'
// ... etc
```

**Russian:**
```typescript
'taskDetail.cancelDialog.title': 'Отменить эту задачу?'
'taskDetail.cancelDialog.warning': 'Это действие необратимо и:'
'taskDetail.cancelDialog.consequence1': 'Удалит все заявки от специалистов'
// ... etc
```

### 8. User Experience Flow

**Happy Path:**
1. User clicks "Cancel Task" button
2. Beautiful modal opens with warning
3. User reads consequences
4. User clicks "Yes, Cancel Task"
5. Button shows loading state
6. API successfully cancels task
7. Success toast: "Task cancelled successfully"
8. User redirected to /tasks/posted
9. All professionals receive cancellation notification

**Error Paths:**
- Task not found → "Task not found"
- Not task owner → "You don't have permission to cancel this task"
- Invalid status → "This task cannot be cancelled"
- Database error → "Failed to cancel task. Please try again."

### 9. Testing Checklist
- [ ] Cancel button only visible to task author
- [ ] Cancel button disabled for completed/cancelled tasks
- [ ] Dialog opens with correct task data
- [ ] Dialog closes on "Cancel" button
- [ ] Loading state shows during API call
- [ ] Successful cancellation redirects to posted tasks
- [ ] Error messages display correctly
- [ ] Applications are actually deleted
- [ ] Notifications sent to affected professionals
- [ ] Task no longer appears in search
- [ ] All translations work (EN/BG/RU)
- [ ] Mobile responsive dialog

## Technical Notes

### Component Structure
```
/src/components/tasks/
└── cancel-task-dialog.tsx       # New confirmation dialog component

/src/app/api/tasks/[id]/
└── cancel/
    └── route.ts                  # New DELETE endpoint
```

### Security Considerations
- ⚠️ Verify user session and task ownership on server
- ⚠️ Use database transactions for atomic operations
- ⚠️ Log cancellation actions for audit trail
- ⚠️ Rate limit the cancel endpoint (prevent abuse)

### Database Transaction Example
```typescript
// Pseudo-code for cancel task transaction
await db.transaction(async (tx) => {
  // 1. Verify ownership
  const task = await tx.tasks.findOne({ id, author_id: userId });
  if (!task) throw new Error('Task not found');

  // 2. Check status
  if (!['open', 'in_progress'].includes(task.status)) {
    throw new Error('Cannot cancel this task');
  }

  // 3. Get affected users (for notifications)
  const applications = await tx.applications.find({ task_id: id });
  const professionalIds = applications.map(a => a.professional_id);

  // 4. Delete related data
  await tx.applications.deleteMany({ task_id: id });
  await tx.messages.deleteMany({ task_id: id });
  await tx.notifications.deleteMany({ task_id: id });

  // 5. Cancel or delete task
  await tx.tasks.update(id, { status: 'cancelled', cancelled_at: new Date() });

  // 6. Send notifications to professionals
  await sendCancellationNotifications(professionalIds, task.title);
});
```

## Priority
**Medium** - Important feature for task management but not blocking core functionality

## Estimated Effort
- Dialog component: 1 hour
- API endpoint: 2 hours
- Integration & testing: 1.5 hours
- Translations: 30 minutes
- Notifications: 1 hour
- **Total**: ~6 hours

## Dependencies
- Task detail page (`/src/app/[lang]/tasks/[id]/components/task-actions.tsx`)
- Task permissions utilities (`/src/lib/utils/task-permissions.ts`)
- Database schema (tasks, applications, messages, notifications tables)
- Notification system (for sending cancellation notices)

## Related Features
- Edit Task (similar permissions logic)
- Delete Application (similar confirmation pattern)
- Task Status Management (consistent status transitions)

## Follow-up Tasks
- [ ] Add cancellation reason field (optional)
- [ ] Analytics tracking for cancellation reasons
- [ ] Allow task reopening within 24 hours (undo feature)
- [ ] Email notifications in addition to in-app
