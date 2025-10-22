# Task Completion & Review Enforcement System

## Task Description
Implement a two-tier enforcement system for task completions and reviews:

1. **Hard Block:** Customer MUST confirm/reject when professional marks task complete (`pending_customer_confirmation`)
2. **Soft Block:** Customer should leave reviews for completed tasks (3-task grace period before hard block)

## Problem Statement
Currently, customers can:
- ❌ Ignore completion requests from professionals indefinitely
- ❌ Skip reviews forever without consequences
- ❌ Stack multiple incomplete tasks

This creates several issues:
- Professionals stuck waiting for confirmation (blocks their payment/reputation)
- Professionals don't get feedback for their work
- Platform loses valuable trust signals
- Review system becomes sparse and less useful
- Unresolved task statuses clutter the system

We need a **strict but fair** enforcement mechanism with two levels of priority.

## Requirements

### 1. Enforcement Hierarchy

#### Priority 1: HARD BLOCK - Pending Confirmations (CRITICAL)
**Status:** `pending_customer_confirmation`
**What happened:** Professional marked task as complete, awaiting customer response

**Rules:**
- ❌ **Cannot create new task** until customer responds
- ✅ Customer must either **Confirm** or **Reject** completion
- 🔴 **Immediate enforcement** - No grace period
- 🎯 **Why strict?** Professional completed work and is waiting for payment/feedback

**User Message:**
```
⚠️ Action Required
You have a task awaiting your confirmation.

Task: Kitchen sink plumbing repair
Professional: Ivan Georgiev marked this complete 3 days ago

Please confirm or reject the completion before creating a new task.

[Confirm Completion] [View Details]
```

#### Priority 2: SOFT BLOCK - Missing Reviews (IMPORTANT)
**Status:** `completed` + `reviewedByCustomer: false`
**What happened:** Task confirmed complete but customer didn't leave review

**Rules:**
- ⚠️ **Grace period:** Allow 3 new task creations without review
- ❌ **After 3 tasks:** Hard block until reviews submitted
- 💡 **Show reminder banner** during grace period
- 🎯 **Why lenient?** Task is resolved, just need feedback

**User Message (Grace Period 1-3 tasks):**
```
💡 Reminder
You have 2 completed tasks without reviews.

Help professionals by leaving feedback!
[Review Now] [Remind Me Later]
```

**User Message (After 3 tasks - HARD BLOCK):**
```
⚠️ Reviews Required
You've created 3 tasks without reviewing previous work.

Please review your completed tasks before creating more:
- Kitchen sink repair (Ivan Georgiev) - 2 weeks ago
- Apartment cleaning (Maria Petrova) - 1 week ago

[Leave Reviews]
```

#### Priority 3: Tasks In Progress (NO BLOCK)
**Status:** `in_progress`
**What happened:** Task actively being worked on

**Rules:**
- ✅ **No blocking** - Allow multiple simultaneous tasks
- 💡 **Optional reminder** if >5 active tasks
- 🎯 **Why allow?** Legitimate to have multiple projects

### 2. Database Schema Updates

```typescript
interface Task {
  // ... existing fields
  completedAt?: Date
  reviewedByCustomer: boolean  // Track if customer left review
  reviewedByProfessional: boolean  // Track if professional left review
}

interface User {
  // ... existing fields
  tasksCreatedSinceLastReview: number  // Track grace period counter
}

interface Review {
  // ... existing fields
  taskId: string
  reviewerId: string
  revieweeId: string
  rating: number  // 1-5 stars, REQUIRED in enforcement dialog
  reviewText?: string
  actualPricePaid?: number
  createdAt: Date
}
```

### 3. Blocking Logic

**When customer clicks "Create Task":**

```typescript
async function canCreateTask(userId: string): Promise<{
  canCreate: boolean
  blockType: 'pending_confirmation' | 'missing_reviews' | null
  blockingTasks: Task[]
}> {
  // PRIORITY 1: Check for pending confirmations (HARD BLOCK)
  const pendingConfirmations = await db.tasks.find({
    customerId: userId,
    status: 'pending_customer_confirmation'
  })

  if (pendingConfirmations.length > 0) {
    return {
      canCreate: false,
      blockType: 'pending_confirmation',
      blockingTasks: pendingConfirmations
    }
  }

  // PRIORITY 2: Check for missing reviews (SOFT BLOCK with grace)
  const user = await db.users.findById(userId)
  const unreviewed = await db.tasks.find({
    customerId: userId,
    status: 'completed',
    reviewedByCustomer: false
  })

  if (unreviewed.length > 0 && user.tasksCreatedSinceLastReview >= 3) {
    return {
      canCreate: false,
      blockType: 'missing_reviews',
      blockingTasks: unreviewed
    }
  }

  // Allow task creation
  return {
    canCreate: true,
    blockType: null,
    blockingTasks: []
  }
}
```

### 4. Grace Period Counter Management

```typescript
// When task is created
async function createTask(userId: string, taskData: TaskData) {
  // Increment counter
  await db.users.updateOne(
    { _id: userId },
    { $inc: { tasksCreatedSinceLastReview: 1 } }
  )

  // Create task...
}

// When review is submitted
async function submitReview(userId: string, reviewData: ReviewData) {
  // Reset counter
  await db.users.updateOne(
    { _id: userId },
    { $set: { tasksCreatedSinceLastReview: 0 } }
  )

  // Save review...
}

### 3. UI/UX Implementation

#### Option A: Notification Center Approach (Recommended)
**Location:** Notification Center (already implemented)

**User Flow:**
1. Customer clicks "Create Task" button
2. System checks for pending reviews
3. If found:
   - Show notification badge with count
   - Display banner: "You have [X] pending review(s). Please review your completed tasks before creating a new one."
   - Click "Review Now" → Opens notification center to "Reviews Needed" tab
   - Notification center shows list of tasks needing reviews
   - Click task → Opens review dialog for that specific task
4. After all reviews submitted → Can create new task

**Notification Center Tab:**
```
┌─────────────────────────────────────┐
│ Notifications                       │
├─────────────────────────────────────┤
│ [All] [Applications] [Tasks]        │
│ [Reviews Needed] ← NEW TAB          │
├─────────────────────────────────────┤
│ ⚠️ Review Required                   │
│ Kitchen sink plumbing repair        │
│ Ivan Georgiev completed this task   │
│ 3 days ago                          │
│ [Leave Review →]                    │
├─────────────────────────────────────┤
│ ⚠️ Review Required                   │
│ Apartment cleaning                  │
│ Maria Petrova completed this task   │
│ 1 week ago                          │
│ [Leave Review →]                    │
└─────────────────────────────────────┘
```

#### Option B: Inline Dialog on Task Creation
**Location:** Create Task Form

**User Flow:**
1. Customer clicks "Create Task"
2. System detects pending reviews
3. Shows blocking dialog:
   ```
   ┌──────────────────────────────────────┐
   │ ⚠️ Review Required                    │
   ├──────────────────────────────────────┤
   │ Before creating a new task, please   │
   │ review your completed work:          │
   │                                      │
   │ 📋 Kitchen sink repair               │
   │    Professional: Ivan Georgiev       │
   │    Completed: 3 days ago             │
   │    [Review Now]                      │
   │                                      │
   │ 📋 Apartment cleaning                │
   │    Professional: Maria Petrova       │
   │    Completed: 1 week ago             │
   │    [Review Now]                      │
   │                                      │
   │ [Cancel] [Review All]                │
   └──────────────────────────────────────┘
   ```
4. Click "Review Now" → Opens review dialog
5. After submitting review, returns to list
6. Once all reviews done → Automatically proceeds to task creation

#### Review Dialog (Reuse Existing Component)
**Component:** Can extend `ConfirmCompletionDialog` or create standalone `LeaveReviewDialog`

**Fields:**
- **Professional Name** (display only)
- **Task Title** (display only)
- **Rating** (1-5 stars) - **REQUIRED** (changed from optional)
- **Review Text** (textarea, 50-500 chars) - **OPTIONAL** (keep optional for quick reviews)
- **Actual Price Paid** (number input) - **OPTIONAL**

**Changes from Current Implementation:**
- Current: All fields optional when confirming completion
- New: Star rating becomes **required** for standalone review dialog
- Reasoning: If customer already confirmed completion, they must rate at minimum

### 4. Review Reminder Timing

**When to show reminders:**
- ✅ Immediately when trying to create new task (blocking)
- ✅ In notification center (persistent reminder)
- ✅ 3 days after task completion (soft reminder notification)
- ✅ 7 days after task completion (urgent reminder)

**Grace Period:**
- Don't block immediately after completion
- Allow 24 hours grace period before enforcement kicks in
- Gives customer time to naturally leave review

### 5. User Experience Considerations

**Positive Aspects:**
- ✅ Ensures professionals get deserved feedback
- ✅ Builds robust review system
- ✅ Creates accountability
- ✅ Increases platform trust

**Potential Friction:**
- ⚠️ Adds mandatory step before task creation
- ⚠️ Could frustrate users in hurry
- ⚠️ May feel punitive if too aggressive

**Mitigation Strategies:**
1. **Make reviewing fast** - Single screen, minimal fields required (just stars)
2. **Show progress** - "1 of 2 reviews remaining"
3. **Allow batch review** - Review multiple tasks in sequence without closing
4. **Gentle messaging** - "Help others by sharing your experience" vs "You must review"
5. **Quick skip button** - Allow 1-2 free skips per month for edge cases

## Acceptance Criteria

### Phase 1: Detection & Notification
- [ ] Backend tracks `reviewedByCustomer` field on tasks
- [ ] API endpoint checks for pending reviews before task creation
- [ ] Notification center shows "Reviews Needed" tab
- [ ] Badge count shows number of pending reviews
- [ ] Task creation blocked when pending reviews exist

### Phase 2: Review Dialog
- [ ] Standalone review dialog component created
- [ ] Star rating field (required)
- [ ] Review text field (optional, 50-500 chars)
- [ ] Actual price paid field (optional)
- [ ] Dialog shows task and professional info
- [ ] Submit action saves review and marks task as reviewed

### Phase 3: User Flow Integration
- [ ] "Create Task" button checks for pending reviews
- [ ] Blocking dialog shows list of tasks needing review
- [ ] Click "Review Now" opens review dialog
- [ ] After all reviews submitted, proceeds to task creation
- [ ] Notification center "Reviews Needed" tab functional

### Phase 4: Translations
- [ ] All new strings translated (EN/BG/RU)
- [ ] Notification messages localized
- [ ] Dialog content localized
- [ ] Error messages localized

### Phase 5: Polish
- [ ] Smooth animations for dialog transitions
- [ ] Progress indicator for multiple reviews
- [ ] Success toast after each review submitted
- [ ] Mobile-responsive design
- [ ] Loading states handled properly

## Technical Notes

### API Endpoints Needed

**Check Pending Reviews:**
```typescript
GET /api/reviews/pending
Response: {
  hasPendingReviews: boolean
  pendingReviews: Array<{
    taskId: string
    taskTitle: string
    professionalName: string
    professionalId: string
    completedAt: Date
  }>
}
```

**Submit Review:**
```typescript
POST /api/reviews
Body: {
  taskId: string
  rating: number  // 1-5, required
  reviewText?: string
  actualPricePaid?: number
}
Response: {
  success: boolean
  review: Review
}
```

**Create Task with Review Check:**
```typescript
POST /api/tasks
// First check pending reviews
// If found, return 403 with pending review details
// Otherwise, create task normally
```

### Component Structure

```
/src/features/reviews/
├── components/
│   ├── review-dialog.tsx           # Standalone review dialog
│   ├── pending-reviews-list.tsx    # List of tasks needing review
│   └── review-reminder-banner.tsx  # Banner shown on task creation attempt
├── hooks/
│   ├── use-pending-reviews.ts      # Hook to fetch pending reviews
│   └── use-submit-review.ts        # Hook to submit review
└── lib/
    └── reviews-api.ts              # API client functions
```

### Notification Center Integration

Add new notification type:
```typescript
type NotificationType =
  | 'application'
  | 'task'
  | 'system'
  | 'review_needed'  // NEW

interface Notification {
  // ... existing fields
  type: NotificationType
  actionUrl?: string  // Deep link to review dialog
}
```

## Priority
**High** - Critical for building robust review ecosystem and ensuring professional feedback

## Estimated Effort
**4-6 hours**
- Backend review tracking: 1 hour
- Pending review detection API: 1 hour
- Review dialog component: 1.5 hours
- Task creation blocking flow: 1 hour
- Notification center integration: 1 hour
- Translations: 0.5 hours

## Dependencies
- Task completion flow already implemented ✅
- Notification center already implemented ✅
- Review fields already exist in confirmation dialog ✅
- Just need to make enforcement mandatory

## Future Enhancements (Post-MVP)

### Review Incentives
- Badge for "Helpful Reviewer" (50+ reviews)
- Priority visibility in search for users with high review completion rate
- Gamification: Review streak counter

### Professional Review Enforcement
- Same system for professionals reviewing customers
- Balanced enforcement on both sides
- Cannot apply to new tasks until reviewing past customers

### Review Quality Checks
- Detect spam/fake reviews (repeated text, all 5-stars with no text)
- Encourage detailed reviews with character count suggestions
- Highlight helpful reviews voted by community

## Notes

### Why This Approach?

**Pros:**
- ✅ Non-intrusive (only blocks when actually trying to create task)
- ✅ Clear value proposition (help community, get better matches)
- ✅ Uses existing notification system
- ✅ Doesn't require new database migrations (just add boolean fields)
- ✅ Easy to disable/adjust if too aggressive

**Cons:**
- ⚠️ Adds friction to task creation flow
- ⚠️ May annoy power users
- ⚠️ Could hurt conversion if too strict

**Recommendation:**
- Start with **Option A** (Notification Center approach)
- Monitor metrics: task creation drop-off, review completion rate
- Adjust grace period based on user feedback
- Consider allowing 1-2 "free passes" per month for legitimate reasons

### Should We Update PRD?

**YES** - This changes the review flow from "optional forever" to "optional initially, mandatory before next task"

Suggested PRD update (Section 3.4 - Rating & Review System):
```markdown
#### Review Enforcement

**Post-Completion Reviews:**
- Reviews are optional during task completion confirmation
- After 24 hours grace period, pending reviews become mandatory
- Customers must review completed tasks before creating new tasks
- Professional contact info remains accessible for past tasks
- Review dialog allows quick rating (stars only) or detailed review

**Enforcement Flow:**
1. Customer completes task without leaving review (optional)
2. 24 hours pass (grace period)
3. Customer tries to create new task
4. System detects pending reviews
5. Blocks task creation and prompts for reviews
6. After reviews submitted, can proceed with task creation

**Benefits:**
- Ensures professionals receive feedback
- Builds robust review ecosystem
- Maintains platform trust and quality
- Gentle enforcement (not immediate blocking)
```
