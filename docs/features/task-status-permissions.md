# Task Status-Based Permissions

This document describes the UI constraints implemented across TaskBridge based on task status.

## Status Flow

```
draft → open → in_progress → pending_customer_confirmation → completed
                    ↓
                cancelled
```

## Permission Rules

### For Task Authors (Customers)

| Action | Allowed Statuses | Blocked Statuses |
|--------|-----------------|------------------|
| **Edit Task** | `open` only | All others |
| **Cancel Task** | `open`, `in_progress` | `completed`, `cancelled`, `disputed` |
| **Confirm Completion** | `pending_customer_confirmation` | All others |
| **Reopen Task** | `completed`, `cancelled` | All others |
| **Leave Review** | `completed` only | All others |

### For Professionals

| Action | Allowed Statuses | Blocked Statuses |
|--------|-----------------|------------------|
| **Apply to Task** | `open` only | All others |
| **Ask Questions** | `open` only | All others |

## Implementation

### Utility Functions

All permission logic is centralized in `/src/lib/utils/task-permissions.ts`:

```typescript
import { canEditTask, canApplyToTask, canAskQuestions, canCancelTask, getDisabledReason } from '@/lib/utils/task-permissions'

// Check permissions
const canEdit = canEditTask(taskStatus) // Only true for 'open'
const canApply = canApplyToTask(taskStatus) // Only true for 'open'

// Get human-readable reason why action is disabled
const reason = getDisabledReason('edit', taskStatus)
```

### Components with Status Constraints

#### 1. **Task Detail Page** (`/app/[lang]/tasks/[id]/components/task-actions.tsx`)

**For Task Authors:**
- ✅ Edit button: Disabled for non-open tasks with tooltip
- ✅ Cancel button: Disabled for completed/cancelled tasks with tooltip

**For Professionals:**
- ✅ Apply button: Disabled for non-open tasks with tooltip
- ✅ Ask Question button: Disabled for non-open tasks with tooltip

#### 2. **Task Card Component** (`/components/ui/task-card.tsx`)

Used in:
- Home page (Featured Tasks)
- Browse Tasks page
- Search results
- Professional profiles

**Constraints:**
- ✅ Apply button: Disabled for non-open tasks
- ✅ Shows disabled reason on hover

#### 3. **Posted Task Card** (`/components/ui/posted-task-card.tsx`)

Used in:
- My Posted Tasks page (`/tasks/posted`)

**Constraints:**
- ✅ Edit button: Only shown for `status === 'open'`
- ✅ Different action buttons based on status:
  - **Open**: View Details, Edit Task, View Applications
  - **In Progress**: View Details, Cancel Task, Report Issue
  - **Pending Confirmation**: Confirm Completion, Report Issue
  - **Completed/Cancelled**: View Details, Leave Review (if completed), Reopen Task

## User Experience

### Disabled Button Behavior

When an action is not allowed:
1. Button is visually disabled (grayed out)
2. Hover shows tooltip with reason
3. Click does nothing

### Status Labels

All task cards show clear status badges:
- 🔵 **Open** - Accepting applications
- 🟡 **In Progress** - Work in progress
- 🟣 **Awaiting Confirmation** - Pending customer review
- 🟢 **Completed** - Task finished
- 🔴 **Cancelled** - Task cancelled

## Testing Checklist

When testing status constraints:

- [ ] Try to edit an in-progress task → Edit button disabled
- [ ] Try to apply to a completed task → Apply button disabled
- [ ] Try to apply to an in-progress task → Apply button disabled
- [ ] Try to cancel a completed task → Cancel button disabled
- [ ] Hover over disabled buttons → Tooltip shows reason
- [ ] Open task → All buttons enabled
- [ ] Verify on all pages: Task Detail, Browse Tasks, Featured Tasks, Posted Tasks

## Database Schema

Task status field in `tasks` table:

```sql
status TEXT CHECK (status IN (
  'draft',
  'open',
  'in_progress',
  'pending_customer_confirmation',
  'completed',
  'cancelled',
  'disputed'
)) DEFAULT 'open'
```

## Data Fetching Constraints

### Browse Tasks Page

**Location**: `/app/[lang]/browse-tasks/hooks/use-task-filters.ts`

The browse-tasks page has a **hardcoded filter** to only show `status='open'` tasks:

```typescript
// HARDCODED: Only show open tasks on browse page
params.set('status', 'open')
```

**Rationale**: Professionals browsing for work should only see available tasks they can apply to, not tasks that are already taken, completed, or cancelled.

### Featured Tasks (Home Page)

**Location**: `/lib/data/featured-tasks.ts`

Featured tasks query also filters to `status='open'` only:

```typescript
.eq('status', 'open') // Only show available tasks
```

**Rationale**: Featured tasks showcase available opportunities. Showing completed or in-progress tasks would be misleading.

### Task Status Management

**Current State**: Task status transitions are not yet implemented.

**Future Implementation**: Will include proper status workflow:
- Accept application: `open` → `in_progress`
- Mark complete: `in_progress` → `pending_customer_confirmation`
- Confirm completion: `pending_customer_confirmation` → `completed`
- Cancel task: `open` → `cancelled` (or `in_progress` → `cancelled` with penalties)

## Future Enhancements

- [ ] Add `disputed` status handling
- [ ] Implement role-based permissions (admin overrides)
- [ ] Add status transition validation API
- [ ] Track status change history
- [ ] Notifications on status changes
- [ ] Implement task status management workflow (accept, complete, confirm, cancel)
