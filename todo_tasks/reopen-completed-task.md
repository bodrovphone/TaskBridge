# Reopen Completed Task Feature

## Task Description
Implement the functionality to reopen completed tasks, allowing customers to find a new professional if they need the work redone or have issues with the completion.

## Current State
- Button exists in UI with dialog: "Reopen this task to find a new professional? This will remove the current assignment."
- No backend implementation for reopening tasks
- Dialog exists but no action handler connected

## Requirements

### Functionality
1. **Customer can reopen completed tasks**
   - Only the customer (task creator) can reopen their tasks
   - Only tasks with status `completed` can be reopened
   - Reopening sets status back to `open`
   - Removes the professional assignment (`selected_professional_id` → null)
   - Clears accepted application reference
   - Preserves completion history (keep `completed_at` and `completed_by_professional_at` for records)

2. **Notifications**
   - Notify the professional that task was reopened
   - Professional receives in-app + Telegram notification
   - Link professional to their work history

3. **Review Handling**
   - If task already has a review, preserve it
   - Customer can still see previous professional's work history
   - Previous completion data remains in task for reference

### Technical Implementation

#### 1. Backend API Endpoint
**File**: `/src/app/api/tasks/[id]/reopen/route.ts` (CREATE)

```typescript
/**
 * PATCH /api/tasks/[id]/reopen
 *
 * Allows customer to reopen a completed task.
 * Removes professional assignment and sets status back to 'open'.
 */
export async function PATCH(request, context) {
  // 1. Get task and verify it exists
  // 2. Authorization: Only customer can reopen their own task
  // 3. Validation: Task must be 'completed' status
  // 4. Update task:
  //    - status: 'open'
  //    - selected_professional_id: null
  //    - accepted_application_id: null
  //    - Keep completed_at, completed_by_professional_at (for history)
  // 5. Send notification to previous professional
  // 6. Return success response
}
```

#### 2. Frontend - Posted Task Card
**File**: `/src/components/ui/posted-task-card.tsx` (UPDATE)

- Find the reopen button handler (currently incomplete)
- Connect to new API endpoint `/api/tasks/${id}/reopen`
- Handle success: refresh task list, show success toast
- Handle error: show error toast with helpful message

#### 3. Notification Template
**File**: `/src/lib/services/notification-service.ts` (UPDATE)

Add new notification type: `task_reopened`

```typescript
'task_reopened': {
  title: 'Task Reopened',
  message: 'Customer reopened task: {taskTitle}. They may be looking for someone else.',
  actionText: 'View History'
}
```

Add translations in all languages (EN, BG, RU):
- `/src/lib/intl/en/notifications.ts`
- `/src/lib/intl/bg/notifications.ts`
- `/src/lib/intl/ru/notifications.ts`

## Acceptance Criteria

- [ ] Customer can reopen completed tasks from Posted Tasks page
- [ ] Only tasks with `completed` status can be reopened
- [ ] Only task owner (customer) can reopen their tasks
- [ ] Professional assignment is removed when task reopened
- [ ] Status changes from `completed` to `open`
- [ ] Professional receives notification (in-app + Telegram)
- [ ] Completion history preserved (timestamps kept for records)
- [ ] Success toast shown to customer after reopening
- [ ] Error handling for all failure cases
- [ ] Task appears back in "Open" filter on Posted Tasks page
- [ ] Task no longer appears in professional's "Completed" list

## Edge Cases to Handle

1. **Task already has review**: Preserve review, allow reopening anyway
2. **Professional deleted/banned**: Still allow reopening (professional_id can be null)
3. **Multiple reopens**: Track reopen count? (Optional for future)
4. **Concurrent actions**: Handle case where professional is viewing while customer reopens

## API Response Format

```typescript
// Success response
{
  success: true,
  message: 'Task reopened successfully',
  task: {
    id: string,
    status: 'open',
    selected_professional_id: null
  }
}

// Error responses
{
  error: 'Task not found' // 404
  error: 'Only the task owner can reopen tasks' // 403
  error: 'Task must be completed to be reopened' // 400
}
```

## Translation Keys Needed

Add to `/src/lib/intl/[lang]/notifications.ts`:
```typescript
'postedTasks.reopenSuccess': 'Task reopened successfully'
'postedTasks.reopenSuccessDescription': 'Your task is now open for new applications'
'postedTasks.reopenError': 'Failed to reopen task'
'notifications.taskReopened.title': 'Task Reopened'
'notifications.taskReopened.message': 'Customer reopened task: {taskTitle}'
```

## Testing Checklist

- [ ] Reopen completed task as customer → success
- [ ] Try to reopen as non-owner → 403 error
- [ ] Try to reopen task that's not completed → 400 error
- [ ] Verify professional receives notification
- [ ] Verify task appears in "Open" tab after reopening
- [ ] Verify completion timestamps preserved
- [ ] Verify professional assignment removed
- [ ] Test Telegram notification delivery

## Technical Notes

- Keep completion history fields for record-keeping and potential future features (dispute resolution, quality metrics)
- Professional should still see this in their work history (completed tasks) with note "reopened by customer"
- Consider adding `reopened_at` timestamp field in future for tracking
- This feature enables customers to handle unsatisfactory work without formal disputes

## Priority
**Medium** - Nice to have feature that gives customers flexibility, but not blocking core functionality

## Estimated Effort
~2-3 hours
- 1 hour: Backend API endpoint + validation
- 30 min: Frontend integration
- 30 min: Notifications + translations
- 30 min: Testing + edge cases
