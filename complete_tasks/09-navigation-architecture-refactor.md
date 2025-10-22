# Navigation Architecture Refactor - Clear Role Separation

## Task Description
Refactor the navigation structure to clearly separate customer and professional perspectives, eliminating confusion between dual user roles. Implement a context-aware navigation system that distinguishes between tasks posted, applications sent, and active work.

## Problem
Current navigation doesn't clearly separate the four distinct user perspectives:
1. **As a Customer**: View my posted tasks and applications I received
2. **As a Professional**: View applications I sent and my active work
3. Mixed terminology ("My Applications" vs "My Work") causes confusion
4. URL routes don't clearly indicate context (customer vs professional view)

## Solution
Implement clear, context-aware navigation with descriptive routes:
- `/browse-tasks` - Browse available tasks (existing, no changes)
- `/tasks/posted` - My posted tasks as customer (NEW)
- `/tasks/applications` - Applications I sent as professional (NEW)
- `/tasks/work` - My active work as professional (NEW)

## Requirements

### 1. Route Structure

#### `/tasks/posted` (Customer View)
**Purpose**: View all tasks I created as a customer

**Features**:
- List of all my posted tasks
- Status filters: All, Open, In Progress, Completed, Cancelled
- For each task, show:
  - Task title, category, budget
  - Status badge
  - Number of applications received
  - Created date
  - Quick actions: View details, View applications
- Click task → Navigate to task detail page
- "Applications received" count clickable → View applications on that task
- Empty state: "You haven't posted any tasks yet. Create your first task!"

**Data Model**:
```typescript
interface PostedTask {
  id: string
  title: string
  description: string
  category: string
  budget: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  applicationsCount: number
  acceptedApplication?: {
    professionalId: string
    professionalName: string
  }
  createdAt: Date
  deadline?: Date
}
```

#### `/tasks/applications` (Professional View)
**Purpose**: View all applications I submitted to others' tasks

**Features**:
- List of all applications I sent
- Status filters: All, Pending, Accepted, Rejected, Withdrawn
- Default sort: Newest first
- For each application, show:
  - Task title and customer name
  - My proposed price and timeline
  - Application status badge
  - Submitted date
  - Quick actions: View task, Withdraw (if pending)
- Empty state: "You haven't applied to any tasks yet. Browse available tasks!"

**Data Model**:
```typescript
interface MyApplication {
  id: string
  taskId: string
  taskTitle: string
  customerName: string
  proposedPrice: number
  timeline: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  submittedAt: Date
  task: {
    budget: number
    category: string
    location: string
  }
}
```

#### `/tasks/work` (Professional View - Previously "My Work")
**Purpose**: View my active work as professional (accepted applications)

**Features**:
- Three filters (as defined in task 08):
  1. **In Progress** (default) - Accepted applications actively being worked on
  2. **Pending Confirmations** - Tasks waiting for confirmation
  3. **Completed** - Finished tasks
- Badge counts for each filter
- Task cards with professional-centric information
- Empty states customized per filter

**This replaces the old `/my-work` route**

### 2. Navigation Updates

#### Header User Avatar Dropdown

**Current structure** (needs update):
```typescript
// Remove:
- My Tasks (unclear - customer or professional?)
- My Work (renamed)

// Add:
For Customers:
- My Posted Tasks → /tasks/posted

For Professionals:
- Browse Tasks → /browse-tasks (existing)
- My Applications → /tasks/applications
- My Work → /tasks/work
```

**Updated Menu Structure**:
```tsx
<DropdownSection title="For Customers" showDivider>
  <DropdownItem
    key="tasks-posted"
    startContent={<FileText className="text-gray-500" size={18} />}
  >
    {t('nav.myPostedTasks')}
  </DropdownItem>
</DropdownSection>

<DropdownSection title="For Professionals" showDivider>
  <DropdownItem
    key="browse-tasks"
    startContent={<Search className="text-gray-500" size={18} />}
  >
    {t('nav.browseTasks')}
  </DropdownItem>
  <DropdownItem
    key="tasks-applications"
    startContent={<Send className="text-gray-500" size={18} />}
  >
    {t('nav.myApplications')}
  </DropdownItem>
  <DropdownItem
    key="tasks-work"
    startContent={<Briefcase className="text-gray-500" size={18} />}
  >
    {t('nav.myWork')}
  </DropdownItem>
</DropdownSection>
```

#### Profile Page Quick Action Buttons

Update the two quick action buttons:
```tsx
// Replace "My Tasks" button with:
<Button
  onPress={() => router.push(`/${lang}/tasks/posted`)}
  startContent={<FileText className="w-4 h-4" />}
>
  {t('nav.myPostedTasks')}
</Button>

// Replace "My Work" button with:
<Button
  onPress={() => router.push(`/${lang}/tasks/work`)}
  startContent={<Briefcase className="w-4 h-4" />}
>
  {t('nav.myWork')}
</Button>
```

### 3. Directory Structure Changes

```
/src/app/[lang]/
├── browse-tasks/          # ✅ Keep as-is (existing)
├── tasks/                 # 🆕 New directory
│   ├── posted/            # 🆕 Customer view - my posted tasks
│   │   ├── page.tsx
│   │   └── components/
│   ├── applications/      # 🆕 Professional view - applications I sent
│   │   ├── page.tsx
│   │   └── components/
│   └── work/              # 🔄 Rename from /my-work
│       ├── page.tsx
│       └── components/
└── my-work/               # ❌ DELETE (move to /tasks/work)
```

### 4. Translation Keys

Add to EN/BG/RU files:

```typescript
// Navigation
'nav.myPostedTasks': 'My Posted Tasks',
'nav.myApplications': 'My Applications',
'nav.myWork': 'My Work',
'nav.browseTasks': 'Browse Tasks',

// Posted Tasks Page
'postedTasks.title': 'My Posted Tasks',
'postedTasks.subtitle': 'Manage tasks you\'ve created',
'postedTasks.filter.all': 'All',
'postedTasks.filter.open': 'Open',
'postedTasks.filter.inProgress': 'In Progress',
'postedTasks.filter.completed': 'Completed',
'postedTasks.filter.cancelled': 'Cancelled',
'postedTasks.applicationsCount': '{count} applications',
'postedTasks.viewApplications': 'View Applications',
'postedTasks.empty.title': 'No tasks posted yet',
'postedTasks.empty.message': 'Create your first task to get started!',
'postedTasks.empty.createButton': 'Create Task',

// Applications Page (I Sent)
'myApplications.title': 'My Applications',
'myApplications.subtitle': 'Applications you\'ve submitted to tasks',
'myApplications.filter.all': 'All',
'myApplications.filter.pending': 'Pending',
'myApplications.filter.accepted': 'Accepted',
'myApplications.filter.rejected': 'Rejected',
'myApplications.filter.withdrawn': 'Withdrawn',
'myApplications.proposedPrice': 'Proposed: {price} BGN',
'myApplications.viewTask': 'View Task',
'myApplications.withdraw': 'Withdraw Application',
'myApplications.empty.title': 'No applications yet',
'myApplications.empty.message': 'Browse available tasks and apply to get started!',
'myApplications.empty.browseButton': 'Browse Tasks',

// Work Page (keep existing myWork.* keys from task 08)
'myWork.title': 'My Work',
'myWork.subtitle': 'Manage your active tasks',
// ... (rest from task 08-my-work-page-refactor.md)
```

### 5. Notification Deep Links

Update notification links to use new routes:

```typescript
// Old:
/my-tasks?highlight=task-123
/my-applications?highlight=app-456

// New:
/tasks/posted?highlight=task-123         // When someone applies to my task
/tasks/applications?highlight=app-456    // When my application is accepted/rejected
/tasks/work?filter=pending_confirmations&highlight=task-789  // When confirmation needed
```

### 6. Mobile Responsive Behavior

All three new pages should:
- Use responsive card layouts
- Mobile-optimized filter tabs (horizontal scroll if needed)
- Bottom sheet modals for actions
- Touch-friendly buttons and spacing

## Acceptance Criteria

### Route Changes
- [ ] `/my-work` directory renamed to `/tasks/work`
- [ ] `/tasks/posted` page created with task list
- [ ] `/tasks/applications` page created with applications list
- [ ] All routes use `[lang]` parameter for i18n

### Navigation Updates
- [ ] User avatar dropdown updated with new menu structure
- [ ] Profile page quick action buttons updated
- [ ] All navigation links point to correct routes
- [ ] Section headers added ("For Customers", "For Professionals")

### Page Functionality
- [ ] `/tasks/posted` shows customer's created tasks
- [ ] `/tasks/applications` shows professional's sent applications
- [ ] `/tasks/work` shows professional's active work (filters working)
- [ ] All three pages have proper filters and sorting
- [ ] Empty states implemented for all pages
- [ ] Badge counts working correctly

### Translation
- [ ] All new translation keys added to EN
- [ ] All new translation keys added to BG
- [ ] All new translation keys added to RU
- [ ] No missing translation warnings

### Data & Integration
- [ ] Mock data created for all three pages
- [ ] Notification deep links updated
- [ ] URL query params working (filters, highlights)
- [ ] Mobile-responsive layouts tested

## Technical Implementation Notes

### File Moves Required
```bash
# Move /my-work to /tasks/work
mv src/app/[lang]/my-work src/app/[lang]/tasks/work

# Create new directories
mkdir -p src/app/[lang]/tasks/posted
mkdir -p src/app/[lang]/tasks/applications
```

### Component Reuse
Many components from the old "My Applications" implementation can be reused:
- Application cards
- Filter tabs component
- Empty states
- Status badges

### URL Query Parameters
All pages should support:
- `?filter=<filter_name>` - Set active filter
- `?highlight=<item_id>` - Highlight specific item (from notifications)
- `?sort=<sort_option>` - Set sort order

Example:
```typescript
const searchParams = useSearchParams()
const filter = searchParams.get('filter') || 'all'
const highlightId = searchParams.get('highlight')
```

## Priority
**High** - Critical for UX clarity and user role separation

## Estimated Effort
6-8 hours (includes creating 2 new pages + refactoring navigation)

## Dependencies
- Task 08 (My Work page refactor) - Will be integrated into `/tasks/work`
- Notification system - Deep links need updating
- Translation system - New keys across 3 languages

## Future Enhancements (Post-MVP)
- Smart navigation (hide sections if user never used them)
- Badge counts on navigation items (e.g., "My Applications (3)")
- Quick stats cards on each page
- Bulk actions (mark multiple as read, withdraw multiple applications)
- Export functionality (download task/application history)

## Notes
- This is primarily a UX reorganization - no backend changes needed initially
- Can use mock data for development
- Focus on clear visual separation between customer and professional contexts
- Consider adding tooltips/help text on first visit to explain the structure
