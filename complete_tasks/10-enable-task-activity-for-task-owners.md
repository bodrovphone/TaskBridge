# Enable TaskActivity Component for Task Owners

## Task Description
Enable the TaskActivity component on the task detail page when proper backend and authorization are implemented. This component allows task owners (customers) to view and manage applications on their tasks.

## Problem
The TaskActivity component is currently hidden on the task detail page (`/app/[lang]/tasks/[id]/`) because there's no way to verify if the current user is the task owner without authentication/backend.

**Current Status:**
- ✅ TaskActivity component is **fully built** and functional
- ✅ Component location: `/app/[lang]/tasks/[id]/components/task-activity.tsx`
- ✅ Features complete: Applications list, Accept/Reject, filtering, messaging system
- ❌ Component is **hidden** - needs author verification to show

## Requirements

### 1. Backend Prerequisites
Before enabling this feature, ensure:
- [ ] User authentication is implemented
- [ ] Backend API endpoint exists to fetch task details with ownership info
- [ ] Task schema includes `ownerId` or `authorId` field
- [ ] API returns current user's ID in session/token

### 2. Task Owner Verification Logic

Add logic to check if current user owns the task:

```typescript
// In task detail page or component
const { user } = useAuth()  // Get current authenticated user
const task = await fetchTask(taskId)  // Fetch task from backend

const isTaskOwner = user?.id === task.ownerId
```

### 3. Show/Hide TaskActivity Component

Update `/app/[lang]/tasks/[id]/page.tsx` or the detail content component:

```typescript
{isTaskOwner && (
  <TaskActivity
    taskId={task.id}
    applications={applications}
    questions={questions}
  />
)}
```

### 4. Deep Linking Support

Ensure the `#applications` hash link works from the Posted Tasks page:

```typescript
// Scroll to applications section when hash is present
useEffect(() => {
  if (window.location.hash === '#applications') {
    const element = document.getElementById('task-activity')
    element?.scrollIntoView({ behavior: 'smooth' })
  }
}, [])
```

### 5. Security Considerations

**Backend Validation:**
- [ ] API endpoint `/api/tasks/{id}/applications` checks user is task owner
- [ ] Accept/Reject actions verify ownership before processing
- [ ] Sensitive data (contact info) only shown to task owner and accepted professional

**Frontend Guards:**
- [ ] Hide TaskActivity if not authenticated
- [ ] Hide TaskActivity if user is not task owner
- [ ] Show appropriate message if user tries to access unauthorized

### 6. User Experience

**When user is task owner:**
- Show TaskActivity component below task details
- Display applications count badge
- Enable Accept/Reject functionality
- Show messaging interface

**When user is NOT task owner:**
- Hide TaskActivity component completely
- Show task details and Apply button (if open)
- No access to applications list

**When not authenticated:**
- Hide TaskActivity
- Show login prompt if trying to access `/tasks/{id}#applications`

## Navigation Flow

From `/tasks/posted` (My Posted Tasks):
1. User clicks "View Applications (5)" button
2. Navigates to `/tasks/{id}#applications`
3. Page loads and verifies user is task owner
4. If verified: Shows TaskActivity with applications list
5. If not: Redirects or shows error

## Acceptance Criteria

- [ ] Task owner verification logic implemented
- [ ] TaskActivity component shown only to task owners
- [ ] Deep linking from `/tasks/posted` works correctly
- [ ] `#applications` hash scrolls to TaskActivity section
- [ ] Backend API returns ownership information
- [ ] Security checks in place (backend validation)
- [ ] Non-owners cannot see applications
- [ ] Unauthenticated users redirected to login
- [ ] Applications list loads real data from backend
- [ ] Accept/Reject actions call backend API
- [ ] Notifications sent when application status changes

## Technical Implementation Notes

### Current Component Location
```
/src/app/[lang]/tasks/[id]/components/task-activity.tsx
```

### Mock Data Currently Used
The component includes mock applications and questions for development:
- 3 sample applications with different statuses
- 2 sample questions
- Professional profiles with ratings

### API Endpoints Needed

```typescript
// Get task with ownership info
GET /api/tasks/{id}
Response: {
  id: string
  ownerId: string
  // ... other task fields
}

// Get applications for task (owner only)
GET /api/tasks/{id}/applications
Response: Application[]

// Accept application (owner only)
POST /api/applications/{applicationId}/accept
Body: { taskId: string }

// Reject application (owner only)
POST /api/applications/{applicationId}/reject
Body: { taskId: string, reason?: string }
```

### State Management

Consider using React Query for data fetching:
```typescript
const { data: task } = useQuery(['task', taskId], () => fetchTask(taskId))
const { data: applications } = useQuery(
  ['applications', taskId],
  () => fetchApplications(taskId),
  { enabled: isTaskOwner }  // Only fetch if owner
)
```

## Priority
**Medium** - Blocks customer application management workflow, but component is already built

## Estimated Effort
2-3 hours (mostly backend integration and auth checks)

## Dependencies
- Backend authentication system
- Task API with ownership data
- Applications API endpoint
- User session/token management

## Related Documentation
- TaskActivity component: `/app/[lang]/tasks/[id]/components/task-activity.tsx`
- Posted Tasks page: `/app/[lang]/tasks/posted/`
- Navigation architecture: `/todo_tasks/09-navigation-architecture-refactor.md`

## Notes
- Component is fully functional with mock data
- No UI changes needed, only integration work
- Security is critical - always verify ownership on backend
- Consider caching task ownership to reduce API calls
- Add loading states while checking ownership
