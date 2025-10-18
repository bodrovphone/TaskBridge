# Applications Management UI

## Task Description

Build the UI for task owners to review, sort, filter, and manage applications received for their tasks. Includes applications list view, application detail view, and accept/reject actions. Pure frontend with mock data.

## Requirements

### 1. ApplicationsList Component

**Location:** `/src/components/tasks/applications-list.tsx`

**Features:**
- List view of all applications for a task
- Sortable by: Newest, Price (Low to High), Rating, Experience
- Filterable by: Status (All, Pending, Accepted, Rejected)
- Application cards with key information
- Quick action buttons (Accept, Reject, View Details)
- Empty state when no applications
- Loading state while fetching

**Application Card Display:**
```
┌────────────────────────────────────────────┐
│ [Avatar] John Doe                    4.8⭐  │
│          Plumber • 45 completed tasks      │
│                                             │
│ "I have 5 years of experience..."          │
│                                             │
│ Price: $150     Timeline: 2-3 days         │
│                                             │
│ [Plumbing] [Repairs] [Licensed]            │
│                                             │
│ [Accept] [Reject] [View Details]           │
└────────────────────────────────────────────┘
```

### 2. ApplicationDetail Component

**Location:** `/src/components/tasks/application-detail.tsx`

**Features:**
- Full application modal/slideOver
- Professional's complete profile preview
- Full application message
- Portfolio images gallery (if provided)
- Professional's ratings & reviews summary
- Past completed tasks in same category
- Accept/Reject actions
- Message professional button (future)

**Detail View Sections:**
- Professional Info (avatar, name, rating, stats)
- Proposed Price & Timeline (highlighted)
- Application Message (full text)
- Portfolio Gallery (image carousel)
- Professional's Reviews (top 3 reviews)
- Specializations/Categories badges
- Action buttons at bottom

### 3. Accept/Reject Confirmation Dialogs

**AcceptApplicationDialog:**
```
┌─────────────────────────────────────┐
│ Accept John's Application?          │
├─────────────────────────────────────┤
│ Price: $150                         │
│ Timeline: 2-3 days                  │
│                                     │
│ By accepting, you agree to:        │
│ • The proposed price and timeline  │
│ • Share your contact information   │
│ • This will reject all other apps  │
│                                     │
│ [Cancel] [Confirm Accept]          │
└─────────────────────────────────────┘
```

**RejectApplicationDialog:**
```
┌─────────────────────────────────────┐
│ Reject this Application?            │
├─────────────────────────────────────┤
│ Professional: John Doe              │
│                                     │
│ Reason (optional):                  │
│ ○ Found a better fit               │
│ ○ Price too high                   │
│ ○ Timeline doesn't work            │
│ ○ Changed my mind                  │
│ ○ Other                            │
│                                     │
│ [Cancel] [Reject Application]      │
└─────────────────────────────────────┘
```

### 4. Sort & Filter Controls

**Sort Dropdown:**
- Newest First (default)
- Price: Low to High
- Price: High to Low
- Highest Rated
- Most Experience

**Filter Chips:**
- All Applications
- Pending (yellow badge)
- Accepted (green badge)
- Rejected (gray badge)

### 5. Empty States

**No Applications Yet:**
```
🔍
No applications yet

Your task is live! Professionals will
start applying soon.

[Share Task] [Edit Task]
```

**No Pending Applications:**
```
✅
All applications reviewed

You've reviewed all applications.

[View Accepted] [View All]
```

## Mock Data Structure

```typescript
interface MockApplication {
  id: string;
  taskId: string;
  professional: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completedTasks: number;
    specializations: string[];
    reviews: Review[];
  };
  proposedPrice: number;
  timeline: string;
  message: string;
  portfolioImages?: string[];
  experience?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Mock data
const mockApplications: MockApplication[] = [
  {
    id: 'app-1',
    taskId: 'task-123',
    professional: {
      id: 'user-1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
      rating: 4.8,
      completedTasks: 45,
      specializations: ['Plumbing', 'Repairs', 'Licensed'],
      reviews: [/* mock reviews */]
    },
    proposedPrice: 150,
    timeline: '2-3 days',
    message: 'I have 5 years of experience in residential plumbing...',
    portfolioImages: ['/portfolio/1.jpg', '/portfolio/2.jpg'],
    status: 'pending',
    createdAt: new Date('2025-01-15T10:30:00')
  },
  // ... more applications
];
```

## UI Components Needed

1. **ApplicationsList** - Main list container
2. **ApplicationCard** - Individual application card
3. **ApplicationDetail** - Full detail modal
4. **AcceptDialog** - Acceptance confirmation
5. **RejectDialog** - Rejection with reason
6. **SortDropdown** - Sort options
7. **FilterChips** - Status filters
8. **EmptyState** - No applications view

## Acceptance Criteria

- [ ] ApplicationsList component created with grid/list layout
- [ ] Application cards display all key info
- [ ] Sort dropdown working (client-side sorting)
- [ ] Filter chips working (status filtering)
- [ ] ApplicationDetail modal opens on click
- [ ] Portfolio image gallery displays correctly
- [ ] Accept confirmation dialog implemented
- [ ] Reject dialog with reason selection
- [ ] Empty states for different scenarios
- [ ] Loading states during actions
- [ ] Mobile responsive design
- [ ] Animations for state changes
- [ ] Professional profile preview accurate
- [ ] All mock data renders correctly

## Technical Notes

- Use NextUI Modal/Sheet for detail view
- Use Framer Motion for list animations
- Implement optimistic UI updates
- Store accepted/rejected state in localStorage
- Use React Query for mock data fetching
- Implement virtualization for large lists (future)

## Translation Keys Needed

```typescript
{
  "applications.title": "Applications",
  "applications.count": "{count} applications",
  "applications.sortBy": "Sort by",
  "applications.sortNewest": "Newest First",
  "applications.sortPriceLow": "Price: Low to High",
  "applications.sortPriceHigh": "Price: High to Low",
  "applications.sortRating": "Highest Rated",
  "applications.sortExperience": "Most Experience",
  "applications.filterAll": "All",
  "applications.filterPending": "Pending",
  "applications.filterAccepted": "Accepted",
  "applications.filterRejected": "Rejected",
  "applications.accept": "Accept",
  "applications.reject": "Reject",
  "applications.viewDetails": "View Details",
  "applications.price": "Price",
  "applications.timeline": "Timeline",
  "applications.completedTasks": "completed tasks",
  "applications.acceptDialog.title": "Accept Application?",
  "applications.acceptDialog.agree": "By accepting, you agree to:",
  "applications.acceptDialog.agreePrice": "The proposed price and timeline",
  "applications.acceptDialog.agreeContact": "Share your contact information",
  "applications.acceptDialog.agreeReject": "This will reject all other applications",
  "applications.acceptDialog.confirm": "Confirm Accept",
  "applications.acceptDialog.cancel": "Cancel",
  "applications.rejectDialog.title": "Reject Application?",
  "applications.rejectDialog.reason": "Reason (optional)",
  "applications.rejectDialog.reasonBetterFit": "Found a better fit",
  "applications.rejectDialog.reasonPrice": "Price too high",
  "applications.rejectDialog.reasonTimeline": "Timeline doesn't work",
  "applications.rejectDialog.reasonChanged": "Changed my mind",
  "applications.rejectDialog.reasonOther": "Other",
  "applications.rejectDialog.confirm": "Reject Application",
  "applications.emptyState.title": "No applications yet",
  "applications.emptyState.message": "Your task is live! Professionals will start applying soon.",
  "applications.emptyState.share": "Share Task",
  "applications.emptyState.edit": "Edit Task"
}
```

## Priority

**High** - Core feature for MVP

## Estimated Time

3-4 days
