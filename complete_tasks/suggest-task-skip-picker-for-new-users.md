# Suggest Task: Skip Picker Dialog for Users Without Tasks

## Task Description
When a customer clicks "Suggest Task" on a professional's profile, check if they have any existing tasks. If they have no tasks, redirect directly to the Create Task form instead of showing the task picker dialog.

## Current Behavior
- User clicks "Suggest Task" on professional profile
- Auth check (login if needed)
- Show task picker dialog with options: "Pick existing task" or "Create new"

## Desired Behavior
- User clicks "Suggest Task" on professional profile
- Auth check (login if needed)
- **If user has 0 tasks**: Skip picker, go directly to Create Task form
- **If user has 1+ tasks**: Show task picker dialog as normal

## Requirements
- Check user's existing tasks count after authentication
- Conditionally skip the picker dialog
- Pass professional ID to Create Task form (to link after creation)
- Maintain the same flow for users with existing tasks

## Acceptance Criteria
- [ ] Users with no tasks are redirected directly to Create Task form
- [ ] Users with existing tasks see the picker dialog
- [ ] Professional context is preserved through the redirect
- [ ] After task creation, professional is properly linked/notified

## Technical Notes
- Related diagram: `docs/customer-journeys.md` - "Finding and Hiring a Professional"
- Flow node: `M{Has Existing Tasks?}` → skip to `P[Create Task Form]` when no tasks

## Priority
Low
