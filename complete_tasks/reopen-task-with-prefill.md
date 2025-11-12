# Reopen Task with Create Task Prefill

## Task Description
Implement the "Reopen Task" functionality that allows customers to reassign completed or cancelled tasks to a new professional. When reopening a task, redirect the user to the Create Task page with all the original task information pre-filled.

## Current Status
- "Reopen Task" button exists on posted task cards (COMPLETED/CANCELLED status)
- Button shows simple confirmation dialog
- No redirect or data prefill implemented yet

## Requirements

### 1. Pre-fill Create Task Form
When user clicks "Reopen Task" and confirms:
- Redirect to `/${lang}/create-task` with query parameters
- Pre-fill all fields from the original task:
  - Title
  - Description
  - Category (main + subcategory)
  - Budget
  - Location (city + neighborhood)
  - Urgency/Timeline
  - Requirements list
  - Any uploaded images/photos

### 2. URL Query Parameters
Use query parameters to pass task data to Create Task page:
```
/en/create-task?reopen=true&taskId=123
```

Then fetch original task data on the Create Task page and pre-fill the form.

**Alternative approach:** Pass all data via URL query params (may be too long):
```
/en/create-task?title=...&description=...&category=...
```

### 3. Visual Indicator
- Show banner/notice at top of Create Task page: "Reopening task: [Original Title]"
- Explain that they can edit any details before posting
- Option to "Start Fresh" (clear all pre-filled data)

### 4. API Integration Points
```typescript
// In posted-task-card.tsx handleReopenTask()
const handleReopenTask = () => {
  if (confirm(t('postedTasks.reopenTaskConfirm'))) {
    // @todo INTEGRATION: Update task status
    // Option 1: Set status = 'open', clear selectedProfessionalId
    // Option 2: Create new task as copy, archive original

    // Redirect to create-task with prefill data
    router.push(`/${lang}/create-task?reopen=true&taskId=${id}`)
  }
}

// In create-task page
// @todo INTEGRATION: Fetch original task data if ?reopen=true&taskId=X
// @todo INTEGRATION: Pre-fill form with fetched data
```

## Acceptance Criteria
- [ ] "Reopen Task" button redirects to Create Task page
- [ ] All original task data is pre-filled in the form
- [ ] User can edit any field before submitting
- [ ] Banner shows user they're reopening a task
- [ ] "Start Fresh" option clears pre-filled data
- [ ] Form submission creates new task (or updates original)
- [ ] Original task is marked as reopened/archived
- [ ] User receives success confirmation
- [ ] Professional from cancelled task gets notification (optional)

## Technical Notes

### State Management Options
1. **Query Params + API Fetch** (Recommended)
   - Clean URL: `/create-task?reopen=true&taskId=123`
   - Fetch original task data on page load
   - Works with browser refresh/back button

2. **Router State** (Alternative)
   - Pass data via `router.push(path, { state })`
   - No API call needed
   - Lost on page refresh

3. **URL Encoded Data** (Not recommended)
   - Very long URLs
   - Can hit length limits
   - Messy browser history

### Form Pre-fill Strategy
```typescript
// In create-task page
const searchParams = useSearchParams()
const taskId = searchParams.get('taskId')
const isReopening = searchParams.get('reopen') === 'true'

useEffect(() => {
  if (isReopening && taskId) {
    // Fetch original task
    // Set form default values
  }
}, [isReopening, taskId])
```

### Database Consideration
Should we:
- **Option A**: Update original task (status = 'open', clear professional)
- **Option B**: Create new task, link to original (taskHistory table)
- **Option C**: Clone task with new ID, archive original

**Recommendation**: Option B - Maintains history, cleaner analytics

## Dependencies
- Create Task page form structure
- Task API endpoints (GET task by ID, POST new task)
- Task status flow logic

## Priority
**Medium** - Nice UX improvement but not blocking core functionality

## Related Files
- `/src/components/ui/posted-task-card.tsx` - Reopen button handler
- `/src/app/[lang]/create-task/page.tsx` - Form to be pre-filled
- Translation keys already exist in `notifications.ts`

## Notes
- Consider adding analytics tracking for task reopening
- May want to limit how many times a task can be reopened
- Consider showing "Previously worked with" professionals in new task
