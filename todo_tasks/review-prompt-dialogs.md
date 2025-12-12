# Review Prompt Dialogs (Force Review Feature)

## Task Description
Implement review prompt dialogs that encourage/prompt users to leave reviews after task completion. The reviews feature itself is already implemented - this task is about the UX flow to prompt users to submit reviews.

## Status
**Priority**: Low (Post-Launch)
**Blocking Release**: No

## Requirements

### Review Prompt Flow
- [ ] Show review dialog to customer after marking task as complete
- [ ] Show review dialog to professional after task completion
- [ ] Allow users to dismiss/skip the prompt
- [ ] Optional: Remind users who haven't left a review (notification)

### UI Components
- [ ] Review submission dialog/modal (currently commented out)
- [ ] "Leave a Review" prompt after task completion
- [ ] Success confirmation after review submitted

### Trigger Points
- [ ] After customer confirms task completion
- [ ] When professional views completed task without review
- [ ] Optional: Email/notification reminder for pending reviews

## Technical Notes

### Existing Code Reference
```
@todo FEATURE: Review dialogs (commented out until reviews feature is built)
```
Location: Task detail/completion components

### Related Files
- `src/lib/intl/*/reviews.ts` - Translation keys (already exists)
- Task completion flow components
- Reviews feature (already implemented)

## Acceptance Criteria
- [ ] Review dialog appears after task completion
- [ ] Users can submit or skip review
- [ ] Dialog properly translated (EN/BG/RU/UA)
