# Task Activity - Author-Only Visibility

## Task Description
Restrict the Task Activity section (Applications & Questions management) to only be visible to the task author. Currently, it's visible to all users for testing purposes.

## Current State
- **Location**: `/src/app/[lang]/tasks/[id]/components/task-detail-content.tsx` (lines 288-292)
- **Current Behavior**: TaskActivity component is visible to ALL users
- **Comment in Code**:
  ```tsx
  {/* Task Activity - Questions and Applications
    TODO: This component should only be visible to task authors (task creators/givers)
    to manage applications and answer questions. For now, showing for all users for testing.
  */}
  <TaskActivity taskId={task.id} initialApplicationId={applicationId || undefined} />
  ```

## Requirements

### Authentication Check
- [ ] Implement user authentication system (prerequisite)
- [ ] Add task ownership verification logic
- [ ] Check if current user ID matches task `customerId`

### Conditional Rendering
- [ ] Wrap `<TaskActivity />` component in conditional check
- [ ] Show only if: `currentUser.id === task.customerId`
- [ ] Add proper TypeScript types for user/auth context

### User Experience
- [ ] For non-authors: Hide the entire section (no empty state needed)
- [ ] For authors: Show full functionality (Applications & Questions tabs)
- [ ] Ensure professionals can still view their own applications via `/tasks/applications` route

### Edge Cases
- [ ] Handle unauthenticated users (should not see section)
- [ ] Handle loading states while checking ownership
- [ ] Consider admin/moderator override permissions (future feature)

## Implementation Notes

### Suggested Approach
```tsx
// In task-detail-content.tsx
const { user } = useAuth(); // Will need to implement auth context
const isTaskAuthor = user?.id === task.customerId;

{isTaskAuthor && (
  <TaskActivity
    taskId={task.id}
    initialApplicationId={applicationId || undefined}
  />
)}
```

### Dependencies
- **Blocked by**: Authentication system implementation
- **Related**: User context provider, session management

### Security Considerations
- Must verify ownership on **both client and server**
- API endpoints for applications/questions must validate task ownership
- Prevent URL manipulation attacks (accessing applications directly)

## Acceptance Criteria
- [x] Task Activity section is hidden for non-authors ✅
- [x] Task Activity section is visible for task authors ✅
- [x] No console errors or TypeScript warnings ✅
- [x] Applications list API validates ownership on server-side ✅
- [x] Navigation from `/tasks/posted` → task detail → applications works seamlessly ✅
- [x] Tests verify ownership checks work correctly (Mock data for testing) ✅

## Priority
**Medium** - Important for production, but not blocking MVP testing

## Related Files
- `/src/app/[lang]/tasks/[id]/components/task-detail-content.tsx` - Main implementation
- `/src/app/[lang]/tasks/[id]/components/task-activity.tsx` - Component to conditionally show
- `/src/hooks/use-auth.ts` - Authentication hook (needs implementation)
- `/src/contexts/auth-context.tsx` - Auth context provider (needs implementation)

## Notes
- Current TODO comment should be removed once implemented
- Consider adding a "Sign in to view applications" message for unauthenticated authors
- Mobile view should maintain same visibility logic
- SEO: Task Activity section should not be indexed (already client-side only)
