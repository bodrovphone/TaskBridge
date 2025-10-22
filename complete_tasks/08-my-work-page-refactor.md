# My Work Page Refactor - Professional Task Management

⚠️ **SUPERSEDED BY TASK 09** - This task has been integrated into the larger Navigation Architecture Refactor (task 09-navigation-architecture-refactor.md). The "My Work" page will now be located at `/tasks/work` instead of `/my-work`.

## Task Description
Refactor the "My Applications" page to "My Work" with a task-centric filter structure that focuses on work status (In Progress, Pending Confirmations) rather than application status. This provides professionals with a clearer view of their active work and pending tasks.

## Problem
Current "My Applications" page focuses on application statuses (Pending, Accepted, Rejected, Withdrawn) which doesn't align with how professionals think about their work. Professionals care about:
1. What tasks am I currently working on?
2. What tasks need my confirmation/attention?
3. Historical view of all my applications

## Requirements

### Route & Navigation Updates

1. **Route Change**:
   - Rename: `/[lang]/my-applications` → `/[lang]/my-work`
   - ✅ Directory already renamed
   - Update all navigation references

2. **Navigation Links to Update**:
   - Header User Avatar Dropdown: "My Applications" → "My Work"
   - Profile page buttons: "My Applications" → "My Work"
   - Notifications deep links: Update route references
   - Update translation keys

### New Filter Structure

Replace current status filters with work-centric filters:

#### **Primary Filters** (Main Tabs):

1. **In Progress** (Default Active Filter)
   - Shows: Applications with status `accepted` where task is actively being worked on
   - Task statuses shown: `in_progress`
   - Badge count: Number of active tasks
   - Empty state: "No active tasks. Browse available tasks to get started!"
   - Sort by: Deadline (urgent first), then by accepted date

2. **Pending Confirmations**
   - Shows: Tasks waiting for professional or customer confirmation
   - Task statuses shown: `pending_professional_confirmation`, `pending_customer_confirmation`
   - Badge count: Number waiting for action
   - Empty state: "No tasks pending confirmation"
   - Sort by: Waiting time (longest waiting first)
   - Visual: Highlight tasks where professional needs to act vs waiting for customer

3. **All Applications**
   - Shows: Complete history of all applications regardless of status
   - Includes: `pending`, `accepted`, `rejected`, `withdrawn`
   - Badge count: Total number of applications
   - Default sort: Newest first
   - Sub-filters available:
     - All (default)
     - Pending review
     - Accepted
     - Rejected
     - Withdrawn

#### **Filter UI Design**:

```
┌─────────────────────────────────────────────────────────┐
│  My Work                                    [Sort ▼]    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────┐  ┌────────┐ │
│  │ In Progress  │  │ Pending             │  │  All   │ │
│  │      2       │  │ Confirmations   1   │  │  10    │ │
│  └──────────────┘  └─────────────────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Component Updates

Update `/src/features/applications/components/my-applications-list.tsx`:

```typescript
type WorkFilter = 'in_progress' | 'pending_confirmations' | 'all_applications'

interface MyWorkListProps {
  applications: MyApplication[]
  defaultFilter?: WorkFilter
  // ... other props
}

// Filter logic
const filterApplications = (apps: MyApplication[], filter: WorkFilter) => {
  switch (filter) {
    case 'in_progress':
      return apps.filter(app =>
        app.status === 'accepted' &&
        app.task.status === 'in_progress'
      )
    case 'pending_confirmations':
      return apps.filter(app =>
        app.task.status === 'pending_professional_confirmation' ||
        app.task.status === 'pending_customer_confirmation'
      )
    case 'all_applications':
      return apps // All applications
    default:
      return apps
  }
}
```

### Translation Keys

Add new translation keys for all languages (EN/BG/RU):

```typescript
// Navigation
'nav.myWork': 'My Work',

// Page Title & Filters
'myWork.title': 'My Work',
'myWork.subtitle': 'Manage your active tasks and applications',
'myWork.filter.inProgress': 'In Progress',
'myWork.filter.pendingConfirmations': 'Pending Confirmations',
'myWork.filter.allApplications': 'All Applications',

// Empty States
'myWork.emptyInProgress.title': 'No active tasks',
'myWork.emptyInProgress.message': 'You don\'t have any tasks in progress. Browse available tasks to get started!',
'myWork.emptyInProgress.browse': 'Browse Tasks',

'myWork.emptyPending.title': 'No pending confirmations',
'myWork.emptyPending.message': 'All your tasks are up to date!',

'myWork.emptyAll.title': 'No applications yet',
'myWork.emptyAll.message': 'Start browsing available tasks and apply to the ones that match your skills.',
'myWork.emptyAll.browse': 'Browse Tasks',

// Sort Options (for All Applications filter)
'myWork.sort.newest': 'Newest First',
'myWork.sort.oldest': 'Oldest First',
'myWork.sort.deadline': 'By Deadline',
'myWork.sort.status': 'By Status',
```

### Task Card Enhancements

When showing tasks in "In Progress" filter, enhance cards with:
- Task deadline countdown (if applicable)
- Days since started
- Quick action: "Mark as Complete" button
- Customer contact info (phone/email) readily visible

When showing in "Pending Confirmations":
- Clear indicator: "Waiting for you" vs "Waiting for customer"
- "Confirm Completion" button (if waiting for professional)
- "View Details" to see what customer reported

## Acceptance Criteria

- [ ] Route renamed from `/my-applications` to `/my-work`
- [ ] Page component renamed (MyApplicationsPage → MyWorkPage)
- [ ] Three main filters implemented: In Progress, Pending Confirmations, All Applications
- [ ] "In Progress" is default active filter on page load
- [ ] Badge counts show correct numbers for each filter
- [ ] Sorting works correctly for each filter type
- [ ] Empty states customized for each filter
- [ ] Navigation links updated in:
  - [ ] User Avatar Dropdown
  - [ ] Profile page buttons
  - [ ] Notification deep links
- [ ] Translation keys added for EN/BG/RU
- [ ] Mobile-responsive filter tabs
- [ ] URL query param support (e.g., `/my-work?filter=pending_confirmations`)

## Technical Notes

### Filter State Management
```typescript
const [activeFilter, setActiveFilter] = useState<WorkFilter>('in_progress')

// Support URL query params
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const filter = params.get('filter') as WorkFilter
  if (filter && ['in_progress', 'pending_confirmations', 'all_applications'].includes(filter)) {
    setActiveFilter(filter)
  }
}, [])
```

### Deep Linking from Notifications
When notifications link to specific applications:
```typescript
// Old: /my-applications?highlight=app-123
// New: /my-work?filter=pending_confirmations&highlight=app-123
```

### Data Requirements
Applications need task status information:
```typescript
interface MyApplication {
  id: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  task: {
    id: string
    title: string
    status: 'open' | 'in_progress' | 'pending_professional_confirmation' | 'pending_customer_confirmation' | 'completed'
    // ... other fields
  }
  // ... other fields
}
```

## Priority
**High** - Improves professional user experience significantly

## Estimated Effort
3-4 hours

## Dependencies
- Task completion UI components (already built)
- Task status badge component (already built)

## Future Enhancements (Post-MVP)
- Calendar view showing task deadlines
- Earnings summary in "In Progress" filter
- Filter by task category
- Quick filters: "Due today", "Due this week"
- Bulk actions (mark multiple as started/completed)

## Notes
- This is a UX improvement - no backend changes needed initially
- Can use mock data for development
- Filter preferences can be saved to localStorage
- Consider adding onboarding tooltip on first visit
