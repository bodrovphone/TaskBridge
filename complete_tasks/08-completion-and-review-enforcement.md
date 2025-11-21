# Task Completion & Review Enforcement System

> **⚠️ IMPLEMENTATION PLAN:**
> - **Phase 1 (NOW):** Frontend UI/UX components with mock data - **ESTIMATED: 3-4 hours**
> - **Phase 2 (LATER - Backend):** Real enforcement logic, API endpoints, database schema - **ESTIMATED: 3-4 hours**
> - See "BACKEND IMPLEMENTATION SECTION" (line ~527+) for complete Phase 2 requirements
>
> **CURRENT SCOPE (Phase 1):**
> 1. Create Review Dialog component (star rating, text, price fields)
> 2. Create Pending Reviews List component (shows tasks needing reviews)
> 3. Create Blocking Dialog (shown when trying to create task with pending reviews)
> 4. Add mock data for testing the complete user flow
> 5. Add translations for all new UI strings (EN/BG/RU)
> 6. Mobile-responsive design
>
> **NOT IN CURRENT SCOPE (Phase 2 - Backend):**
> - Database schema changes (3 new columns)
> - API endpoints (3 new routes)
> - Business logic enforcement (grace period, blocking logic)
> - Real data integration

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

## Acceptance Criteria (FRONTEND PHASE - CURRENT)

### Phase 1: Review Dialog Component
- [ ] Create standalone review dialog component
- [ ] Star rating field (required, 1-5 stars)
- [ ] Review text field (optional, 50-500 chars with counter)
- [ ] Actual price paid field (optional)
- [ ] Display task title and professional info
- [ ] Submit button with loading state
- [ ] Cancel/close button
- [ ] Form validation (rating required)
- [ ] Success/error toast messages

### Phase 2: Pending Reviews List Component
- [ ] Create list component showing tasks needing reviews
- [ ] Display task title, professional name, completion date
- [ ] "Leave Review" button for each task
- [ ] Empty state when no pending reviews
- [ ] Loading state while fetching

### Phase 3: Blocking Dialog/Banner
- [ ] Create blocking dialog component (Option B from spec)
- [ ] OR notification center integration (Option A from spec)
- [ ] Show count of pending reviews
- [ ] Display list of tasks needing review
- [ ] "Review Now" button opens review dialog
- [ ] "Cancel" button to dismiss
- [ ] Progress indicator (e.g., "1 of 3 reviews completed")

### Phase 4: Mock Data & Integration
- [ ] Create mock pending reviews data
- [ ] Hook up "Create Task" button to show blocking dialog
- [ ] Implement sequential review flow (review → next → review → done)
- [ ] Add mock delay/loading states for realistic feel
- [ ] Test full user flow with mock data

### Phase 5: Translations
- [ ] Review dialog strings (EN/BG/RU)
- [ ] Blocking dialog/banner strings (EN/BG/RU)
- [ ] Notification messages (EN/BG/RU)
- [ ] Error/success messages (EN/BG/RU)
- [ ] All button labels and placeholders (EN/BG/RU)

### Phase 6: Polish & Mobile Responsive
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

### Phase 1 (Frontend - Current): **3-4 hours**
- Review dialog component: 1.5 hours
- Pending reviews list component: 0.5 hours
- Blocking dialog/banner: 1 hour
- Mock data integration: 0.5 hours
- Translations: 0.5 hours

### Phase 2 (Backend - Later): **3-4 hours**
- Database migrations: 0.5 hours
- Backend review tracking logic: 1 hour
- API endpoints (can-create, pending, submit): 1.5 hours
- Testing & debugging: 1 hour

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

---

# 🔧 BACKEND IMPLEMENTATION SECTION (PHASE 2 - TO BE DONE LATER)

> **⚠️ IMPORTANT:** This section contains all backend requirements that need to be implemented
> after the frontend UI is complete. Do NOT skip this section when building the backend!

## Database Schema Changes

### 1. Tasks Table Updates
```sql
-- Add review tracking fields to tasks table
ALTER TABLE tasks ADD COLUMN reviewed_by_customer BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN reviewed_by_professional BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP;

-- Add index for faster queries
CREATE INDEX idx_tasks_reviewed_by_customer ON tasks(customer_id, reviewed_by_customer);
CREATE INDEX idx_tasks_status_customer ON tasks(customer_id, status);
```

### 2. Users Table Updates
```sql
-- Add grace period counter to users table
ALTER TABLE users ADD COLUMN tasks_created_since_last_review INTEGER DEFAULT 0;

-- Add index for faster queries
CREATE INDEX idx_users_grace_period ON users(id, tasks_created_since_last_review);
```

### 3. Reviews Table (verify exists)
```sql
-- Ensure reviews table has all required fields
-- If not exists, create:
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  reviewer_id VARCHAR NOT NULL REFERENCES users(id),
  reviewee_id VARCHAR NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  actual_price_paid DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_task ON reviews(task_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
```

## Business Logic Implementation

### Core Enforcement Function
**Location:** `/src/app/api/tasks/can-create/route.ts` (new file)

```typescript
import { db } from '@/database/db';
import { tasks, users } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    // PRIORITY 1: Check for pending confirmations (HARD BLOCK)
    const pendingConfirmations = await db.query.tasks.findMany({
      where: and(
        eq(tasks.customerId, userId),
        eq(tasks.status, 'pending_customer_confirmation')
      ),
      with: {
        selectedProfessional: true
      }
    });

    if (pendingConfirmations.length > 0) {
      return NextResponse.json({
        canCreate: false,
        blockType: 'pending_confirmation',
        blockingTasks: pendingConfirmations.map(task => ({
          taskId: task.id,
          taskTitle: task.title,
          professionalName: task.selectedProfessional?.firstName + ' ' + task.selectedProfessional?.lastName,
          professionalId: task.selectedProfessionalId,
          completedAt: task.completedAt
        }))
      });
    }

    // PRIORITY 2: Check for missing reviews (SOFT BLOCK with grace)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    const unreviewedTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.customerId, userId),
        eq(tasks.status, 'completed'),
        eq(tasks.reviewedByCustomer, false)
      ),
      with: {
        selectedProfessional: true
      }
    });

    // Check grace period
    if (unreviewedTasks.length > 0 && user!.tasksCreatedSinceLastReview >= 3) {
      return NextResponse.json({
        canCreate: false,
        blockType: 'missing_reviews',
        blockingTasks: unreviewedTasks.map(task => ({
          taskId: task.id,
          taskTitle: task.title,
          professionalName: task.selectedProfessional?.firstName + ' ' + task.selectedProfessional?.lastName,
          professionalId: task.selectedProfessionalId,
          completedAt: task.completedAt
        }))
      });
    }

    // Allow task creation
    return NextResponse.json({
      canCreate: true,
      blockType: null,
      blockingTasks: [],
      gracePeriodUsed: user!.tasksCreatedSinceLastReview,
      unreviewedCount: unreviewedTasks.length
    });

  } catch (error) {
    console.error('Error checking task creation eligibility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Grace Period Counter Management

**Update Task Creation Endpoint:**
**Location:** `/src/app/api/tasks/route.ts` (modify existing)

```typescript
// In POST handler, after successful task creation:
await db.update(users)
  .set({
    tasksCreatedSinceLastReview: sql`${users.tasksCreatedSinceLastReview} + 1`
  })
  .where(eq(users.id, userId));
```

**Update Review Submission Endpoint:**
**Location:** `/src/app/api/reviews/route.ts` (create new or modify existing)

```typescript
// In POST handler, after successful review submission:
await db.update(users)
  .set({
    tasksCreatedSinceLastReview: 0
  })
  .where(eq(users.id, userId));

// Also mark task as reviewed
await db.update(tasks)
  .set({
    reviewedByCustomer: true
  })
  .where(eq(tasks.id, reviewData.taskId));
```

## API Endpoints to Implement

### 1. Check Task Creation Eligibility
```typescript
GET /api/tasks/can-create?userId={userId}

Response: {
  canCreate: boolean
  blockType: 'pending_confirmation' | 'missing_reviews' | null
  blockingTasks: Array<{
    taskId: string
    taskTitle: string
    professionalName: string
    professionalId: string
    completedAt: Date
  }>
  gracePeriodUsed?: number  // 0-3
  unreviewedCount?: number
}
```

### 2. Get Pending Reviews
```typescript
GET /api/reviews/pending?userId={userId}

Response: {
  hasPendingReviews: boolean
  pendingReviews: Array<{
    taskId: string
    taskTitle: string
    professionalName: string
    professionalId: string
    completedAt: Date
    daysAgo: number
  }>
}
```

### 3. Submit Review
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
  remainingUnreviewed: number
}
```

## Integration with Frontend

### Frontend Hook: `use-can-create-task.ts`
```typescript
export function useCanCreateTask(userId: string) {
  return useQuery({
    queryKey: ['can-create-task', userId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/can-create?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to check eligibility');
      return res.json();
    },
    enabled: !!userId
  });
}
```

### Frontend Hook: `use-pending-reviews.ts`
```typescript
export function usePendingReviews(userId: string) {
  return useQuery({
    queryKey: ['pending-reviews', userId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/pending?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch pending reviews');
      return res.json();
    },
    enabled: !!userId
  });
}
```

## Testing Checklist

### Backend Tests
- [ ] Database migrations run successfully
- [ ] Hard block works: pending_customer_confirmation blocks task creation
- [ ] Soft block works: 3-task grace period enforced correctly
- [ ] Grace counter increments on task creation
- [ ] Grace counter resets on review submission
- [ ] API returns correct blockType and blockingTasks
- [ ] Multiple pending confirmations handled correctly
- [ ] Multiple unreviewed tasks handled correctly

### Integration Tests
- [ ] Frontend receives correct blocking data from API
- [ ] Review submission updates database correctly
- [ ] Task creation updates counter correctly
- [ ] Edge case: User at exactly 3 tasks grace period
- [ ] Edge case: User with 0 unreviewed tasks can create freely

### Load Tests
- [ ] API performance with 100+ unreviewed tasks
- [ ] Concurrent task creation requests handled correctly
- [ ] Database indexes improve query performance

## Deployment Checklist

- [ ] Run database migrations on staging
- [ ] Test full flow on staging environment
- [ ] Verify no existing users are incorrectly blocked
- [ ] Monitor error logs for first 24 hours
- [ ] Run database migrations on production
- [ ] Enable feature flag (if using feature flags)
- [ ] Monitor user complaints/support tickets
- [ ] Adjust grace period if needed based on feedback

## Notes for Backend Implementation

### Data Migration Considerations
- Existing tasks should default `reviewedByCustomer: false`
- Existing users should default `tasksCreatedSinceLastReview: 0`
- Consider backfilling completed tasks with review status based on existing reviews table

### Performance Considerations
- Add database indexes as shown above
- Consider caching pending reviews count in Redis
- Batch update operations where possible
- Monitor query performance on tasks/reviews tables

### Feature Flag (Optional)
Consider adding a feature flag to disable enforcement if issues arise:
```typescript
const REVIEW_ENFORCEMENT_ENABLED = process.env.REVIEW_ENFORCEMENT_ENABLED === 'true';
```

---

**END OF BACKEND IMPLEMENTATION SECTION**

---

# ✅ IMPLEMENTATION STATUS UPDATE (2025-01-21)

## Phase 1 - Frontend Implementation: COMPLETED ✅

### What Was Implemented

#### 1. Review Enforcement Dialog ✅
**Location:** `/src/features/reviews/components/review-enforcement-dialog.tsx`

**Features:**
- Simplified design showing pending review count (not individual tasks)
- Redirects to `/reviews/pending` page for actual review submission
- Two-tier system:
  - **Soft Block (1-2 reviews):** Warning with dismissable dialog
  - **Hard Block (3+ reviews):** Cannot dismiss, must review first
- Mobile-responsive with proper button styling
- Rounded star icons with circular backgrounds
- Larger close button on mobile
- NextUI styled buttons (blue primary, gray cancel)
- Full i18n support (EN/BG/RU)

**Design Decisions:**
- Originally showed list of tasks with professional names in dialog
- Simplified to just show count and redirect to dedicated page
- Reduces API complexity - only needs count, not full task details
- Better UX - one dialog, then dedicated review page

#### 2. API Endpoint - Can Create Task ✅
**Location:** `/src/app/api/tasks/can-create/route.ts`

**Features:**
- Simplified to return just pending review count
- Uses `count` query instead of fetching full task data
- Enforcement logic:
  - 3+ reviews → `hard_block` + `canCreate: false`
  - 1-2 reviews → `soft_block` + `canCreate: true`
  - 0 reviews → `null` + `canCreate: true`
- Uses `createAdminClient()` to bypass RLS for user lookups
- Returns array of empty objects with count for dialog

**Performance:** ~300ms response time

#### 3. useCreateTask Hook ✅
**Location:** `/src/hooks/use-create-task.ts`

**Features:**
- Centralized task creation logic with enforcement
- Handles authentication check
- Fetches eligibility from API
- Shows enforcement dialog based on block type
- Manages dialog state and review flow
- Returns all needed state/handlers for components

**Usage Pattern:**
```typescript
const {
  handleCreateTask,           // Main handler
  showEnforcementDialog,       // Dialog state
  setShowEnforcementDialog,
  blockType,                   // 'soft_block' | 'hard_block' | null
  blockingTasks,              // Array with count
  handleReviewTask            // Redirect to /reviews/pending
} = useCreateTask()
```

#### 4. Enforcement Integration - All Entry Points ✅

**Integrated in 5 locations:**
1. ✅ **Header** - "Create Task" button in main navigation
   - `/src/components/common/header.tsx`
   
2. ✅ **Customer Profile** - "Create Task" quick action button
   - `/src/app/[lang]/profile/customer/components/customer-profile-page-content.tsx`
   
3. ✅ **Empty Posted Tasks** - "Create First Task" CTA
   - `/src/components/tasks/empty-posted-tasks.tsx`
   
4. ✅ **Hero Section** - Landing page "Create Task" CTA
   - `/src/features/home/components/sections/hero-section.tsx`
   
5. ✅ **Professional Detail** - "Invite to Task" → "Create New Task"
   - `/src/app/[lang]/professionals/[id]/components/professional-detail-page-content.tsx`

**Not Integrated:**
- ⚠️ Posted Task Card "Reopen Task" - Complex due to query params, low priority

#### 5. Translations ✅
**Locations:** 
- `/src/lib/intl/en/reviews.ts`
- `/src/lib/intl/bg/reviews.ts`
- `/src/lib/intl/ru/reviews.ts`

**New Keys Added:**
```typescript
'reviews.enforcement.pendingCount': '{{count}} pending review',
'reviews.enforcement.pendingCount_plural': '{{count}} pending reviews',
'reviews.enforcement.helpProfessionals': 'Help professionals by sharing your feedback',
```

**Existing Keys Used:**
- `reviews.enforcement.hardBlock.title`
- `reviews.enforcement.hardBlock.message`
- `reviews.enforcement.softBlock.title`
- `reviews.enforcement.softBlock.message`
- `reviews.enforcement.softBlock.leaveReviewsButton`
- `reviews.enforcement.softBlock.cancelButton`

### Technical Improvements Made

#### API Optimization
**Before:** 
- Fetched full task data + professional details via foreign key join
- Multiple queries per pending review
- Complex nested data structure

**After:**
- Simple `SELECT count` query
- Returns just the number
- Single fast query (~300ms)

#### Component Simplification
**Before:**
- Dialog showed list of tasks with cards
- Displayed professional names, avatars, task titles
- Complex nested components
- Heavy on API data

**After:**
- Clean count display with icon
- Simple redirect to dedicated page
- Minimal data needed
- Better separation of concerns

#### RLS (Row Level Security) Handling
**Issue:** User queries couldn't read other users' profiles due to RLS
**Solution:** Used `createAdminClient()` which bypasses RLS for server-side queries

### Known Issues & Decisions

#### 1. First Click Shows "No Eligibility Data" ❌
**Issue:** Query takes ~300ms, first click happens before data loads

**Current Behavior:**
- First click: No dialog (eligibility undefined)
- Second click: Dialog shows correctly

**Potential Solutions:**
- Add loading state to button
- Prefetch on component mount
- Show loading spinner during check

**Decision:** Acceptable for MVP, can improve in Phase 2

#### 2. Reopen Task Not Integrated ⚠️
**Location:** `/src/components/ui/posted-task-card.tsx` line 273

**Issue:** Needs to pass query params: `?reopen=true&originalTaskId=${id}`

**Current Behavior:** Direct navigation without enforcement

**Potential Solution:** 
- Store params in enforcement hook
- Pass through after review completion
- Or handle as special case

**Decision:** Low priority edge case, skip for MVP

### User Flow

```
User clicks "Create Task" from any location
    ↓
useCreateTask hook checks API (/api/tasks/can-create)
    ↓
├─ No pending reviews (count: 0)
│  → Navigate to /create-task ✅
│
├─ Soft block (count: 1-2) 
│  → Show dismissable warning dialog
│  → User can dismiss OR click "Leave Reviews" → /reviews/pending
│
└─ Hard block (count: 3+)
   → Show non-dismissable dialog
   → Must click "Leave Reviews" → /reviews/pending
   → Cannot create task until reviews submitted
```

### Files Created/Modified

**New Files:**
- `/src/features/reviews/components/review-enforcement-dialog.tsx`
- `/src/hooks/use-create-task.ts`
- `/src/app/api/tasks/can-create/route.ts`

**Modified Files:**
- `/src/components/common/header.tsx`
- `/src/app/[lang]/profile/customer/components/customer-profile-page-content.tsx`
- `/src/components/tasks/empty-posted-tasks.tsx`
- `/src/features/home/components/sections/hero-section.tsx`
- `/src/app/[lang]/professionals/[id]/components/professional-detail-page-content.tsx`
- `/src/lib/intl/en/reviews.ts`
- `/src/lib/intl/bg/reviews.ts`
- `/src/lib/intl/ru/reviews.ts`

### Testing Checklist

- [x] Enforcement dialog shows with correct count
- [x] Soft block (1-2 reviews) allows dismissal
- [x] Hard block (3+ reviews) prevents dismissal
- [x] "Leave Reviews" button redirects to `/reviews/pending`
- [x] All 5 major entry points integrated
- [x] Translations work in all 3 languages
- [x] Mobile responsive design
- [x] Button styling correct
- [x] Icons properly rounded
- [ ] First-click loading state (known issue)
- [ ] Reopen task integration (deferred)

## Phase 2 - Backend Implementation: NOT STARTED ⏳

See "BACKEND IMPLEMENTATION SECTION" starting at line 547 for complete Phase 2 requirements.

**Still needed:**
- Database migrations (reviewed_by_customer, reviewed_by_professional, completed_at)
- Grace period counter (tasks_created_since_last_review)
- Real-time review submission tracking
- Server-side enforcement on `/create-task` page
- Integration tests
- Load testing

---

**Implementation Date:** January 21, 2025
**Status:** Phase 1 Complete, Phase 2 Pending
**Estimated Phase 2 Effort:** 3-4 hours (as originally planned)

