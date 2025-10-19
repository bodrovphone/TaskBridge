# Task Completion UI

## Task Description

Build the UI components for the dual confirmation task completion workflow, including completion dialogs, confirmation prompts, dispute reporting, and task status indicators. Pure frontend with mock data.

## Requirements

### 1. TaskCompletionButton Component

**Location:** `/src/components/tasks/task-completion-button.tsx`

**Features:**
- Visible only when task is "in_progress"
- Different for professional vs customer
- Opens completion confirmation dialog
- Shows loading state during submission

**Button States:**
- Professional: "Mark as Completed"
- Customer: "Confirm Completion"
- Disabled when already marked by user

### 2. MarkAsCompletedDialog (Professional)

**Location:** `/src/components/tasks/mark-completed-dialog.tsx`

```
┌────────────────────────────────────┐
│ Mark Task as Completed?            │
├────────────────────────────────────┤
│ Task: Plumbing Repair              │
│ Customer: Maria P.                 │
│ Payment: $150                      │
│                                    │
│ Have you finished all work?        │
│ ☑ All requirements completed       │
│ ☑ Customer satisfied with result   │
│                                    │
│ Upload completion photos (optional)│
│ [📸 Add Photos]                    │
│                                    │
│ [Cancel] [Mark as Completed]       │
└────────────────────────────────────┘
```

**Features:**
- Checklist of completion criteria
- Optional completion photos upload
- Final notes field (optional)
- Confirmation action

### 3. ConfirmCompletionDialog (Customer)

**Location:** `/src/components/tasks/confirm-completion-dialog.tsx`

```
┌────────────────────────────────────┐
│ Confirm Task Completion?           │
├────────────────────────────────────┤
│ Professional: John D.              │
│ Task: Plumbing Repair              │
│                                    │
│ Is the work completed to your      │
│ satisfaction?                      │
│                                    │
│ ○ Yes, I'm satisfied               │
│ ○ No, there are issues             │
│                                    │
│ If yes:                            │
│ Rate the work quality:             │
│ ⭐⭐⭐⭐⭐                             │
│                                    │
│ [Report Issue] [Confirm Completion]│
└────────────────────────────────────┘
```

**Features:**
- Satisfaction check (Yes/No radio)
- If "No" → Show "Report Issue" path
- If "Yes" → Quick rating stars
- Confirm button only enabled when satisfied

### 4. DisputeReportDialog

**Location:** `/src/components/tasks/dispute-report-dialog.tsx`

```
┌────────────────────────────────────┐
│ Report an Issue                    │
├────────────────────────────────────┤
│ What's the problem?                │
│                                    │
│ ○ Work not completed               │
│ ○ Poor quality                     │
│ ○ Didn't match description         │
│ ○ Professional didn't show up      │
│ ○ Other                            │
│                                    │
│ Describe the issue:                │
│ [Textarea]                         │
│                                    │
│ Upload evidence photos:            │
│ [📸 Add Photos]                    │
│                                    │
│ [Cancel] [Submit Report]           │
└────────────────────────────────────┘
```

**Features:**
- Issue type selection (radio buttons)
- Detailed description (textarea)
- Evidence photos upload
- Submit to admin review (mock)

### 5. TaskStatusBadge Component

**Location:** `/src/components/tasks/task-status-badge.tsx`

**Status Indicators:**

| Status | Badge | Icon | Color | Tooltip |
|--------|-------|------|-------|---------|
| open | Open | 🔓 | Blue | "Accepting applications" |
| in_progress | In Progress | ⚙️ | Yellow | "Work in progress" |
| pending_professional_confirmation | Awaiting Confirmation | ⏳ | Orange | "Waiting for professional to confirm" |
| pending_customer_confirmation | Awaiting Confirmation | ⏳ | Orange | "Waiting for customer to confirm" |
| completed | Completed | ✅ | Green | "Task completed successfully" |
| cancelled | Cancelled | 🚫 | Red | "Task was cancelled" |
| disputed | Under Review | ⚠️ | Purple | "Admin reviewing dispute" |

### 6. Completion Success View

After both parties confirm:

```
┌────────────────────────────────────┐
│        ✅                           │
│   Task Completed!                  │
│                                    │
│ Great work! Both parties have      │
│ confirmed task completion.         │
│                                    │
│ Next Steps:                        │
│ 1. Leave a review for John D.      │
│ 2. Task will be archived in 30 days│
│                                    │
│ [Leave Review] [View Task Details] │
└────────────────────────────────────┘
```

### 7. Pending Confirmation Banner

When one party marks complete:

```
┌────────────────────────────────────────┐
│ ⏳ Waiting for Customer Confirmation    │
│                                        │
│ You marked this task as completed.     │
│ Waiting for Maria P. to confirm.       │
└────────────────────────────────────────┘
```

Or:

```
┌────────────────────────────────────────┐
│ ⏳ Professional Marked Task Complete    │
│                                        │
│ John D. marked this task as completed. │
│ [Confirm Completion] [Report Issue]    │
└────────────────────────────────────────┘
```

### 8. Completion Timeline Widget

**Location:** `/src/components/tasks/completion-timeline.tsx`

Visual timeline showing:
- Task Started (date)
- Professional Marked Complete (date)
- Customer Confirmed (date)
- Task Completed (date)

```
Timeline:
━━●━━━━━○━━━━━○━━━━━●

Started    Pro       Customer   Completed
Jan 10   Marked     Confirmed   Jan 15
         Jan 14     Jan 15
```

## Mock Data & State Management

```typescript
interface TaskCompletionState {
  taskId: string;
  status: TaskStatus;
  professionalConfirmed: boolean;
  customerConfirmed: boolean;
  professionalConfirmedAt?: Date;
  customerConfirmedAt?: Date;
  completedAt?: Date;
  dispute?: {
    reportedBy: 'customer' | 'professional';
    reason: string;
    description: string;
    evidencePhotos: string[];
    createdAt: Date;
  };
}

type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'pending_professional_confirmation'
  | 'pending_customer_confirmation'
  | 'completed'
  | 'cancelled'
  | 'disputed';
```

## UI Components Needed

1. **TaskCompletionButton** - Main action button
2. **MarkAsCompletedDialog** - Professional's completion dialog
3. **ConfirmCompletionDialog** - Customer's confirmation dialog
4. **DisputeReportDialog** - Issue reporting
5. **TaskStatusBadge** - Status indicator
6. **CompletionSuccessView** - Success screen
7. **PendingConfirmationBanner** - Waiting state
8. **CompletionTimeline** - Visual timeline

## Acceptance Criteria

- [ ] TaskCompletionButton shows for in_progress tasks
- [ ] MarkAsCompletedDialog opens for professionals
- [ ] Checklist items work
- [ ] Completion photos upload works
- [ ] ConfirmCompletionDialog opens for customers
- [ ] Satisfaction radio buttons work
- [ ] Quick rating stars interactive
- [ ] DisputeReportDialog opens when issues reported
- [ ] Evidence photos upload in dispute
- [ ] TaskStatusBadge shows correct status
- [ ] All status colors/icons accurate
- [ ] CompletionSuccessView shows after dual confirmation
- [ ] PendingConfirmationBanner shows correctly
- [ ] CompletionTimeline displays milestones
- [ ] Mobile responsive design
- [ ] Smooth animations between states
- [ ] Mock state persists in localStorage

## Technical Notes

- Use Zustand or Context for completion state
- Store state in localStorage for persistence
- Implement optimistic UI updates
- Use Framer Motion for success animations
- Handle edge cases (both mark simultaneously)
- Disable buttons during loading
- Show toast notifications on actions

## Translation Keys Needed

```typescript
{
  "taskCompletion.markCompleted": "Mark as Completed",
  "taskCompletion.confirmCompletion": "Confirm Completion",
  "taskCompletion.markDialog.title": "Mark Task as Completed?",
  "taskCompletion.markDialog.task": "Task",
  "taskCompletion.markDialog.customer": "Customer",
  "taskCompletion.markDialog.payment": "Payment",
  "taskCompletion.markDialog.question": "Have you finished all work?",
  "taskCompletion.markDialog.checkRequirements": "All requirements completed",
  "taskCompletion.markDialog.checkSatisfied": "Customer satisfied with result",
  "taskCompletion.markDialog.photos": "Upload completion photos (optional)",
  "taskCompletion.markDialog.addPhotos": "Add Photos",
  "taskCompletion.confirmDialog.title": "Confirm Task Completion?",
  "taskCompletion.confirmDialog.professional": "Professional",
  "taskCompletion.confirmDialog.question": "Is the work completed to your satisfaction?",
  "taskCompletion.confirmDialog.yes": "Yes, I'm satisfied",
  "taskCompletion.confirmDialog.no": "No, there are issues",
  "taskCompletion.confirmDialog.rateQuality": "Rate the work quality:",
  "taskCompletion.reportIssue": "Report Issue",
  "taskCompletion.dispute.title": "Report an Issue",
  "taskCompletion.dispute.question": "What's the problem?",
  "taskCompletion.dispute.notCompleted": "Work not completed",
  "taskCompletion.dispute.poorQuality": "Poor quality",
  "taskCompletion.dispute.notMatched": "Didn't match description",
  "taskCompletion.dispute.noShow": "Professional didn't show up",
  "taskCompletion.dispute.other": "Other",
  "taskCompletion.dispute.describe": "Describe the issue:",
  "taskCompletion.dispute.evidence": "Upload evidence photos:",
  "taskCompletion.dispute.submit": "Submit Report",
  "taskCompletion.success.title": "Task Completed!",
  "taskCompletion.success.message": "Great work! Both parties have confirmed task completion.",
  "taskCompletion.success.nextSteps": "Next Steps:",
  "taskCompletion.success.step1": "Leave a review",
  "taskCompletion.success.step2": "Task will be archived in 30 days",
  "taskCompletion.success.leaveReview": "Leave Review",
  "taskCompletion.success.viewDetails": "View Task Details",
  "taskCompletion.pending.waitingCustomer": "Waiting for Customer Confirmation",
  "taskCompletion.pending.waitingProfessional": "Waiting for Professional Confirmation",
  "taskCompletion.pending.markedComplete": "marked this task as completed",
  "taskCompletion.pending.youMarked": "You marked this task as completed",
  "taskCompletion.timeline.started": "Started",
  "taskCompletion.timeline.proMarked": "Pro Marked Complete",
  "taskCompletion.timeline.customerConfirmed": "Customer Confirmed",
  "taskCompletion.timeline.completed": "Completed"
}
```

## Priority

**Medium** - Important for user flow completion

## Estimated Time

3-4 days
