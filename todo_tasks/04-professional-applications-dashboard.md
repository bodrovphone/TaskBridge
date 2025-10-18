# Professional Applications Dashboard

## Task Description

Build the UI for professionals to view, track, and manage all applications they've submitted to tasks. Includes applications list view, status tracking, application detail view, and withdraw/follow-up actions. Pure frontend with mock data.

## Requirements

### 1. MyApplicationsList Component

**Location:** `/src/features/applications/components/my-applications-list.tsx`

**Features:**
- List view of all applications submitted by the professional
- Sortable by: Newest, Status, Task Date, Price
- Filterable by: Status (All, Pending, Accepted, Rejected, Withdrawn)
- Application cards showing task info and application status
- Quick actions based on status
- Empty state when no applications
- Loading state while fetching

**Application Card Display:**
```
┌────────────────────────────────────────────┐
│ [PENDING]                    Applied 2h ago │
│                                             │
│ Fix Kitchen Sink Leak                      │
│ Customer: John D. • Sofia, Center          │
│                                             │
│ Your Quote: $150 • Timeline: 2-3 days      │
│ Task Budget: $100-200                      │
│                                             │
│ [Plumbing] [Emergency]                     │
│                                             │
│ [View Details] [Withdraw Application]      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ [ACCEPTED] ✅               Accepted 1d ago │
│                                             │
│ Apartment Deep Cleaning                    │
│ Customer: Maria P. • Plovdiv, Center       │
│                                             │
│ Agreed Price: $200 • Timeline: 3 days      │
│ Starts: Tomorrow at 10:00 AM               │
│                                             │
│ [Cleaning] [Apartment]                     │
│                                             │
│ [Message Customer] [View Task]             │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ [REJECTED] ❌               Rejected 3d ago │
│                                             │
│ Paint Living Room Walls                    │
│ Customer: Ivan K. • Varna, Seaside         │
│                                             │
│ Your Quote: $300 • Timeline: 2 days        │
│ Reason: Found a better fit                 │
│                                             │
│ [Painting] [Interior]                      │
│                                             │
│ [View Details] [Delete]                    │
└────────────────────────────────────────────┘
```

### 2. ApplicationDetailView Component

**Location:** `/src/features/applications/components/application-detail-view.tsx`

**Features:**
- Full view of the application details
- Task information display
- What I proposed (price, timeline, message)
- Application status and timeline
- Customer basic info (name, rating)
- Rejection reason (if applicable)
- Actions based on status

**Detail View Sections:**

**For Pending Applications:**
```
┌─────────────────────────────────────────┐
│ Application Status: PENDING             │
├─────────────────────────────────────────┤
│ TASK DETAILS                            │
│ Fix Kitchen Sink Leak                   │
│ Customer: John D. ⭐ 4.5                │
│ Location: Sofia, Center                 │
│ Budget: $100-200                        │
│ Needed by: Jan 20, 2025                │
│                                         │
│ YOUR PROPOSAL                           │
│ Price: $150                             │
│ Timeline: 2-3 days                      │
│ Applied: 2 hours ago                    │
│                                         │
│ YOUR MESSAGE                            │
│ "I have 5 years of experience in       │
│  residential plumbing..."               │
│                                         │
│ WAITING FOR CUSTOMER RESPONSE           │
│ • Usually responds within 24 hours     │
│ • 3 other professionals applied        │
│                                         │
│ [Withdraw Application] [View Task]     │
└─────────────────────────────────────────┘
```

**For Accepted Applications:**
```
┌─────────────────────────────────────────┐
│ Application Status: ACCEPTED ✅         │
├─────────────────────────────────────────┤
│ TASK DETAILS                            │
│ Apartment Deep Cleaning                 │
│ Customer: Maria P. ⭐ 4.8               │
│ Phone: +359 888 123 456                │
│ Email: maria.p@example.com             │
│ Location: Plovdiv, Center              │
│ Address: ul. Ivan Vazov 15, apt. 5     │
│                                         │
│ AGREED TERMS                            │
│ Price: $200                             │
│ Timeline: 3 days                        │
│ Start Date: Jan 16, 2025 at 10:00 AM  │
│ Accepted: 1 day ago                     │
│                                         │
│ NEXT STEPS                              │
│ ✓ Customer approved your application   │
│ • Contact customer to confirm details  │
│ • Complete task by Jan 19, 2025       │
│                                         │
│ [Message Customer] [Mark as Started]   │
│ [Mark as Completed] [Report Issue]     │
└─────────────────────────────────────────┘
```

**For Rejected Applications:**
```
┌─────────────────────────────────────────┐
│ Application Status: REJECTED ❌         │
├─────────────────────────────────────────┤
│ TASK DETAILS                            │
│ Paint Living Room Walls                 │
│ Customer: Ivan K.                       │
│ Location: Varna, Seaside                │
│                                         │
│ YOUR PROPOSAL                           │
│ Price: $300                             │
│ Timeline: 2 days                        │
│ Applied: 5 days ago                     │
│ Rejected: 3 days ago                    │
│                                         │
│ REJECTION REASON                        │
│ "Found a better fit"                    │
│                                         │
│ FEEDBACK                                │
│ Don't take it personally! Keep         │
│ applying to similar tasks.             │
│                                         │
│ [Find Similar Tasks] [Delete]          │
└─────────────────────────────────────────┘
```

### 3. Withdraw Application Dialog

**WithdrawApplicationDialog:**
```
┌─────────────────────────────────────┐
│ Withdraw Your Application?          │
├─────────────────────────────────────┤
│ Task: Fix Kitchen Sink Leak         │
│ Customer: John D.                   │
│                                     │
│ Are you sure you want to withdraw? │
│                                     │
│ Reason (optional):                  │
│ ○ No longer available              │
│ ○ Found other work                 │
│ ○ Task requirements changed        │
│ ○ Price too low                    │
│ ○ Other                            │
│                                     │
│ [Cancel] [Confirm Withdrawal]      │
└─────────────────────────────────────┘
```

### 4. Sort & Filter Controls

**Sort Dropdown:**
- Newest First (default)
- Oldest First
- Status (Pending → Accepted → Rejected)
- Task Date (Nearest first)
- Price: High to Low
- Price: Low to High

**Filter Tabs/Chips:**
```
[All (12)] [Pending (5)] [Accepted (3)] [Rejected (4)] [Withdrawn (0)]
```

### 5. Empty States

**No Applications Yet:**
```
📋
You haven't applied to any tasks yet

Start browsing available tasks and apply
to the ones that match your skills.

[Browse Tasks]
```

**No Pending Applications:**
```
✓
All caught up!

You have no pending applications.
All your applications have been reviewed.

[Browse More Tasks]
```

**No Accepted Applications:**
```
🎯
No accepted applications yet

Keep applying! Your next opportunity
is just around the corner.

[Browse Tasks]
```

### 6. Status Badge Indicators

**Visual Status System:**
- 🟡 **PENDING** - Yellow badge, "Waiting for response"
- 🟢 **ACCEPTED** - Green badge with ✅, "Approved"
- 🔴 **REJECTED** - Red badge with ❌, "Not selected"
- ⚪ **WITHDRAWN** - Gray badge, "Withdrawn by you"

### 7. Quick Actions by Status

**Pending:**
- View Details
- Withdraw Application
- View Task Page

**Accepted:**
- Message Customer
- View Customer Contact
- Mark as Started
- Mark as Completed
- Report Issue

**Rejected:**
- View Details
- Find Similar Tasks
- Delete Application

**Withdrawn:**
- View Details
- Delete Application

## Mock Data Structure

```typescript
interface MyApplication {
  id: string;
  taskId: string;
  task: {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    budget: {
      min: number;
      max: number;
      type: 'fixed' | 'hourly' | 'negotiable';
    };
    location: {
      city: string;
      neighborhood?: string;
    };
    deadline?: Date;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  };
  customer: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    reviewsCount?: number;
    // Contact info only shown if accepted
    phone?: string;
    email?: string;
    address?: string;
  };
  myProposal: {
    price: number;
    timeline: string;
    message: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: Date;
  respondedAt?: Date;
  rejectionReason?: string;
  otherApplicantsCount?: number;
  startDate?: Date; // For accepted applications
}

// Mock data
const mockMyApplications: MyApplication[] = [
  {
    id: 'my-app-1',
    taskId: 'task-1',
    task: {
      id: 'task-1',
      title: 'Fix Kitchen Sink Leak',
      description: 'Kitchen sink is leaking under the cabinet...',
      category: 'home_repair',
      subcategory: 'plumbing',
      budget: {
        min: 100,
        max: 200,
        type: 'negotiable'
      },
      location: {
        city: 'Sofia',
        neighborhood: 'Center'
      },
      deadline: new Date('2025-01-20'),
      status: 'open'
    },
    customer: {
      id: 'customer-1',
      name: 'John D.',
      avatar: '/avatars/john.jpg',
      rating: 4.5,
      reviewsCount: 12
    },
    myProposal: {
      price: 150,
      timeline: '2-3 days',
      message: 'I have 5 years of experience in residential plumbing...'
    },
    status: 'pending',
    appliedAt: new Date('2025-01-15T10:30:00'),
    otherApplicantsCount: 3
  },
  {
    id: 'my-app-2',
    taskId: 'task-2',
    task: {
      id: 'task-2',
      title: 'Apartment Deep Cleaning',
      description: '3-bedroom apartment needs deep cleaning...',
      category: 'personal_care',
      subcategory: 'cleaning',
      budget: {
        min: 150,
        max: 250,
        type: 'fixed'
      },
      location: {
        city: 'Plovdiv',
        neighborhood: 'Center'
      },
      deadline: new Date('2025-01-19'),
      status: 'in_progress'
    },
    customer: {
      id: 'customer-2',
      name: 'Maria P.',
      avatar: '/avatars/maria.jpg',
      rating: 4.8,
      reviewsCount: 25,
      phone: '+359 888 123 456',
      email: 'maria.p@example.com',
      address: 'ul. Ivan Vazov 15, apt. 5, Plovdiv'
    },
    myProposal: {
      price: 200,
      timeline: '3 days',
      message: 'I specialize in apartment deep cleaning with eco-friendly products...'
    },
    status: 'accepted',
    appliedAt: new Date('2025-01-14T14:00:00'),
    respondedAt: new Date('2025-01-14T16:30:00'),
    startDate: new Date('2025-01-16T10:00:00')
  },
  {
    id: 'my-app-3',
    taskId: 'task-3',
    task: {
      id: 'task-3',
      title: 'Paint Living Room Walls',
      description: 'Need professional painting for 25sqm living room...',
      category: 'home_repair',
      subcategory: 'painting',
      budget: {
        min: 200,
        max: 400,
        type: 'negotiable'
      },
      location: {
        city: 'Varna',
        neighborhood: 'Seaside'
      },
      status: 'completed'
    },
    customer: {
      id: 'customer-3',
      name: 'Ivan K.',
      rating: 4.2,
      reviewsCount: 8
    },
    myProposal: {
      price: 300,
      timeline: '2 days',
      message: 'Professional painter with 10 years experience...'
    },
    status: 'rejected',
    appliedAt: new Date('2025-01-10T09:00:00'),
    respondedAt: new Date('2025-01-12T11:00:00'),
    rejectionReason: 'Found a better fit'
  }
];
```

## UI Components Needed

1. **MyApplicationsList** - Main list container with filters/sort
2. **MyApplicationCard** - Individual application card
3. **ApplicationDetailView** - Full detail view (modal/page)
4. **WithdrawDialog** - Withdrawal confirmation
5. **StatusBadge** - Visual status indicators
6. **QuickActions** - Context-aware action buttons
7. **EmptyState** - Various empty states
8. **ApplicationStats** - Summary statistics (optional)

## Page Integration

### Option A: Dedicated Page
**Route:** `/[lang]/my-applications`
- Full page dedicated to applications
- Better for detailed management
- More screen space

### Option B: Profile Tab
**Route:** `/[lang]/profile?tab=applications`
- Part of professional profile
- Integrated experience
- Less navigation

**Recommendation:** Start with **Option A** (dedicated page), can add to profile later.

## Acceptance Criteria

- [ ] MyApplicationsList component created with all filters
- [ ] Application cards show task info and status clearly
- [ ] Sort dropdown working (client-side)
- [ ] Filter tabs working (status filtering)
- [ ] ApplicationDetailView shows complete info
- [ ] Contact info only shown for accepted applications
- [ ] Withdraw dialog with reason selection
- [ ] Status badges with correct colors/icons
- [ ] Quick actions appropriate to each status
- [ ] Empty states for different scenarios
- [ ] Loading states during actions
- [ ] Mobile responsive design
- [ ] Smooth animations for state changes
- [ ] All mock data renders correctly
- [ ] Navigation to task detail pages works

## Technical Notes

- Use NextUI Modal/Sheet for detail view
- Use Framer Motion for smooth transitions
- Implement optimistic UI updates
- Store withdrawn state in localStorage
- Consider using React Query for data management
- Group by date (Today, Yesterday, This Week, Older)
- Add pull-to-refresh on mobile (optional)
- Implement infinite scroll for large lists (future)

## Translation Keys Needed

```typescript
{
  "myApplications.title": "My Applications",
  "myApplications.count": "{count} applications",
  "myApplications.sortBy": "Sort by",
  "myApplications.sortNewest": "Newest First",
  "myApplications.sortOldest": "Oldest First",
  "myApplications.sortStatus": "By Status",
  "myApplications.sortTaskDate": "Task Date",
  "myApplications.sortPriceHigh": "Price: High to Low",
  "myApplications.sortPriceLow": "Price: Low to High",
  "myApplications.filterAll": "All",
  "myApplications.filterPending": "Pending",
  "myApplications.filterAccepted": "Accepted",
  "myApplications.filterRejected": "Rejected",
  "myApplications.filterWithdrawn": "Withdrawn",
  "myApplications.status.pending": "Pending",
  "myApplications.status.accepted": "Accepted",
  "myApplications.status.rejected": "Rejected",
  "myApplications.status.withdrawn": "Withdrawn",
  "myApplications.appliedAgo": "Applied {time} ago",
  "myApplications.acceptedAgo": "Accepted {time} ago",
  "myApplications.rejectedAgo": "Rejected {time} ago",
  "myApplications.yourQuote": "Your Quote",
  "myApplications.taskBudget": "Task Budget",
  "myApplications.timeline": "Timeline",
  "myApplications.agreedPrice": "Agreed Price",
  "myApplications.startDate": "Starts",
  "myApplications.viewDetails": "View Details",
  "myApplications.viewTask": "View Task",
  "myApplications.withdraw": "Withdraw Application",
  "myApplications.messageCustomer": "Message Customer",
  "myApplications.markStarted": "Mark as Started",
  "myApplications.markCompleted": "Mark as Completed",
  "myApplications.reportIssue": "Report Issue",
  "myApplications.findSimilar": "Find Similar Tasks",
  "myApplications.delete": "Delete",
  "myApplications.withdrawDialog.title": "Withdraw Application?",
  "myApplications.withdrawDialog.reason": "Reason (optional)",
  "myApplications.withdrawDialog.reasonUnavailable": "No longer available",
  "myApplications.withdrawDialog.reasonFoundWork": "Found other work",
  "myApplications.withdrawDialog.reasonChanged": "Task requirements changed",
  "myApplications.withdrawDialog.reasonPrice": "Price too low",
  "myApplications.withdrawDialog.reasonOther": "Other",
  "myApplications.withdrawDialog.confirm": "Confirm Withdrawal",
  "myApplications.withdrawDialog.cancel": "Cancel",
  "myApplications.detail.taskDetails": "Task Details",
  "myApplications.detail.yourProposal": "Your Proposal",
  "myApplications.detail.agreedTerms": "Agreed Terms",
  "myApplications.detail.rejectionReason": "Rejection Reason",
  "myApplications.detail.waitingResponse": "Waiting for Customer Response",
  "myApplications.detail.usuallyResponds": "Usually responds within 24 hours",
  "myApplications.detail.otherApplicants": "{count} other professionals applied",
  "myApplications.detail.nextSteps": "Next Steps",
  "myApplications.detail.customerApproved": "Customer approved your application",
  "myApplications.detail.contactCustomer": "Contact customer to confirm details",
  "myApplications.detail.completeBy": "Complete task by {date}",
  "myApplications.detail.feedback": "Don't take it personally! Keep applying to similar tasks.",
  "myApplications.emptyState.title": "You haven't applied to any tasks yet",
  "myApplications.emptyState.message": "Start browsing available tasks and apply to the ones that match your skills.",
  "myApplications.emptyState.browse": "Browse Tasks",
  "myApplications.emptyStatePending.title": "All caught up!",
  "myApplications.emptyStatePending.message": "You have no pending applications. All your applications have been reviewed.",
  "myApplications.emptyStateAccepted.title": "No accepted applications yet",
  "myApplications.emptyStateAccepted.message": "Keep applying! Your next opportunity is just around the corner."
}
```

## Related Components

This feature connects with:
- Task detail pages (viewing the task you applied to)
- Browse tasks page (finding similar tasks)
- Messaging system (contacting customers - future)
- Professional profile (showing application history)
- Notifications (application status updates)

## Future Enhancements

- Real-time notifications when status changes
- Application analytics (acceptance rate, avg response time)
- Similar task recommendations after rejection
- Quick re-apply to similar tasks
- Application templates/saved messages
- Track task completion and ratings received

## Priority

**High** - Core feature for professional users

## Estimated Time

3-4 days

## Dependencies

- Task 03 (Applications Management UI) - Can be developed in parallel
- Mock data for tasks and customers
- Translation keys
- NextUI components
