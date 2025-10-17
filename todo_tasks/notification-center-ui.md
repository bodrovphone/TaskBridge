# Notification Center UI

## Task Description

Build the complete notification center UI component including the header bell icon, unread badge, dropdown panel, and notification list. Pure frontend with mock notifications - no real-time backend.

## Requirements

### 1. NotificationBell Component

**Location:** `/src/components/common/notification-bell.tsx`

**Features:**
- Bell icon in header navigation
- Unread count badge (red circle with number)
- Click to toggle notification dropdown
- Animated badge when new notifications
- Desktop: Dropdown panel
- Mobile: Full-screen sheet/modal

### 2. NotificationCenter Component

**Location:** `/src/components/common/notification-center.tsx`

**Features:**
- Dropdown panel (desktop) or slideOver (mobile)
- Header with "Notifications" title and "Mark all read"
- Tabs: All | Applications | Tasks | Messages
- Scrollable notification list
- Individual notifications with:
  - Icon based on type
  - Title and message
  - Timestamp (relative: "2 mins ago")
  - Unread indicator (blue dot)
  - Action buttons inline
- Empty state when no notifications
- Infinite scroll (load more)

### 3. Notification Card Design

```
┌──────────────────────────────────────┐
│ [●] [Icon] New Application           │
│            John D. applied to your   │
│            task "Plumbing Repair"    │
│            2 mins ago                │
│            [View Application]        │
├──────────────────────────────────────┤
│ [Icon] Application Accepted          │
│        Your bid for "House Cleaning" │
│        was accepted by Maria P.      │
│        1 hour ago                    │
│        [View Details] [Contact]      │
└──────────────────────────────────────┘

● = Unread indicator (blue dot)
```

### 4. Notification Types & Icons

| Type | Icon | Color | Example |
|------|------|-------|---------|
| Application Received | 📋 | Blue | "New application for 'Plumbing'" |
| Application Accepted | ✅ | Green | "Your application was accepted!" |
| Application Rejected | ❌ | Red | "Application not selected" |
| Task Completed | ✓ | Green | "Task marked as completed" |
| Task Cancelled | 🚫 | Orange | "Task was cancelled" |
| Message Received | 💬 | Purple | "New message from John" |
| Review Received | ⭐ | Yellow | "You received a 5-star review" |
| Payment Received | 💰 | Green | "Payment of $150 received" |

### 5. Header Actions

**Mark All as Read:**
- Button in header
- Clears all unread indicators
- Updates badge count to 0
- Optimistic UI update

**Filter Tabs:**
- **All** - Show all notifications
- **Applications** - Only application-related
- **Tasks** - Task updates (completed, cancelled)
- **Messages** - Future: In-app messages

### 6. Individual Notification Actions

Each notification can have action buttons:
- **View Application** - Navigate to application detail
- **View Task** - Navigate to task detail page
- **Accept/Reject** - Quick actions for applications
- **Mark as Done** - Complete task actions
- **Contact** - Open contact info modal
- **Leave Review** - Open review dialog

### 7. Empty States

**No Notifications:**
```
🔔
No notifications yet

You'll be notified when someone applies
to your tasks or responds to your applications.
```

**No Unread:**
```
✅
You're all caught up!

All notifications have been read.
```

### 8. Mobile Responsiveness

**Desktop (>768px):**
- Dropdown panel below bell icon
- Max width: 400px
- Max height: 600px (scrollable)
- Positioned to right of icon

**Mobile (<768px):**
- Full-screen slideOver from right
- Full viewport height
- Close button in header
- Swipe to close

## Mock Data Structure

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  relatedTaskId?: string;
  relatedApplicationId?: string;
  metadata?: {
    professionalName?: string;
    taskTitle?: string;
    price?: number;
    rating?: number;
  };
}

type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'task_completed'
  | 'task_cancelled'
  | 'message_received'
  | 'review_received'
  | 'payment_received';

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'application_received',
    title: 'New Application',
    message: 'John D. applied to your task "Plumbing Repair"',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    actionUrl: '/tasks/task-123/applications',
    relatedTaskId: 'task-123',
    relatedApplicationId: 'app-1',
    metadata: {
      professionalName: 'John D.',
      taskTitle: 'Plumbing Repair'
    }
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'application_accepted',
    title: 'Application Accepted',
    message: 'Your bid for "House Cleaning" was accepted by Maria P.',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    actionUrl: '/tasks/task-456',
    relatedTaskId: 'task-456',
    metadata: {
      professionalName: 'Maria P.',
      taskTitle: 'House Cleaning'
    }
  },
  // ... more notifications
];
```

## UI Components Needed

1. **NotificationBell** - Bell icon with badge
2. **NotificationCenter** - Main dropdown/panel
3. **NotificationCard** - Individual notification item
4. **NotificationTabs** - Filter tabs
5. **NotificationEmpty** - Empty state
6. **UnreadBadge** - Red circle badge component

## Acceptance Criteria

- [ ] NotificationBell icon in header with badge
- [ ] Badge shows correct unread count
- [ ] Clicking bell toggles notification panel
- [ ] Notification panel displays on desktop (dropdown)
- [ ] Notification panel displays on mobile (slideOver)
- [ ] Filter tabs work (All, Applications, Tasks)
- [ ] Individual notifications render correctly
- [ ] Timestamps display as relative time
- [ ] Unread indicator (blue dot) shows for unread
- [ ] Mark all as read functionality works
- [ ] Individual mark as read works (on click)
- [ ] Action buttons navigate correctly
- [ ] Empty states display when appropriate
- [ ] Infinite scroll/pagination (mock load more)
- [ ] Mobile responsive design
- [ ] Animations smooth (open/close, badge pulse)
- [ ] Clicking outside closes dropdown

## Technical Notes

- Use Radix UI Dropdown or NextUI Popover
- Store notifications in React Context or Zustand
- Use localStorage to persist read/unread state
- Implement optimistic UI updates
- Use date-fns or dayjs for relative time
- Animate badge with Framer Motion
- Close dropdown on navigation
- Auto-mark as read after 3 seconds viewing

## Translation Keys Needed

```typescript
{
  "notifications.title": "Notifications",
  "notifications.markAllRead": "Mark all as read",
  "notifications.tabAll": "All",
  "notifications.tabApplications": "Applications",
  "notifications.tabTasks": "Tasks",
  "notifications.tabMessages": "Messages",
  "notifications.empty.title": "No notifications yet",
  "notifications.empty.message": "You'll be notified when someone applies to your tasks or responds to your applications.",
  "notifications.emptyUnread.title": "You're all caught up!",
  "notifications.emptyUnread.message": "All notifications have been read.",
  "notifications.loadMore": "Load more",
  "notifications.viewApplication": "View Application",
  "notifications.viewTask": "View Task",
  "notifications.contact": "Contact",
  "notifications.leaveReview": "Leave Review",
  "notifications.markAsDone": "Mark as Done",
  "notifications.accept": "Accept",
  "notifications.reject": "Reject",
  "notifications.timeAgo.now": "Just now",
  "notifications.timeAgo.minutesAgo": "{count} mins ago",
  "notifications.timeAgo.hoursAgo": "{count} hours ago",
  "notifications.timeAgo.daysAgo": "{count} days ago",
  "notifications.timeAgo.weeksAgo": "{count} weeks ago"
}
```

## Priority

**High** - Core feature for MVP

## Estimated Time

2-3 days
