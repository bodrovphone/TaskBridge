# Ratings & Reviews System - Complete Backend Implementation (Phase 2)

## Task Description
Implement the **complete backend system** for ratings and reviews, connecting existing UI components to real database operations. This is Phase 2 of the review system - all frontend UI exists and works with mock data.

## Current State Summary

### ✅ What EXISTS (Phase 1 - Completed):
- **Database Schema:** `reviews` table fully defined with all fields
- **Review Tracking Fields:** `reviewed_by_customer` and `reviewed_by_professional` already in `tasks` table
- **UI Components:** ReviewDialog, ReviewsSection, PendingReviewsList, EnforcementDialog (all functional with mock data)
- **Translations:** Complete i18n (EN/BG/RU) for all review strings
- **Types:** Full TypeScript interfaces for reviews
- **Completion Dialog:** Basic confirm/reject dialog exists (no review fields yet)

### ❌ What's MISSING (Phase 2 - This Task):
- **No API endpoints** - All review operations currently use mock data
- **No database triggers** - average_rating and total_reviews not auto-updated
- **No enforcement logic** - Grace period and blocking is frontend-only
- **No grace period tracking** - `tasks_created_since_last_review` field missing from users table
- **No data integration** - Professional detail page shows empty reviews

---

## Implementation Plan

### Part 1: Core Review API Endpoints (3-4 hours)

#### 1.1. Submit Review: `POST /api/tasks/[taskId]/reviews`

**File:** `/src/app/api/tasks/[taskId]/reviews/route.ts` (NEW)

**Request Body:**
```typescript
{
  rating: number,              // 1-5, required
  comment?: string,            // Optional review text
  qualityRating?: number,      // 1-5, optional detailed ratings
  communicationRating?: number,
  timelinessRating?: number,
  professionalismRating?: number
}
```

**Validation:**
- [ ] Verify task exists and status is `completed`
- [ ] Verify requester is the customer (task.customer_id)
- [ ] Check if review already exists (UNIQUE constraint will catch, but check first for better UX)
- [ ] Validate rating is 1-5
- [ ] Verify task has an accepted application (get professional from application)

**Database Operations:**
```typescript
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { rating, comment, qualityRating, communicationRating, timelinessRating, professionalismRating } = body

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  // Get task and verify ownership + status
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*, applications!inner(professional_id, status)')
    .eq('id', params.taskId)
    .eq('customer_id', user.id)
    .eq('status', 'completed')
    .single()

  if (taskError || !task) {
    return NextResponse.json({ error: 'Task not found or not completed' }, { status: 404 })
  }

  // Get the accepted application to find professional
  const acceptedApp = task.applications.find((app: any) => app.status === 'accepted')
  if (!acceptedApp) {
    return NextResponse.json({ error: 'No accepted application found' }, { status: 400 })
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('task_id', params.taskId)
    .eq('reviewer_id', user.id)
    .eq('review_type', 'customer_to_professional')
    .single()

  if (existingReview) {
    return NextResponse.json({ error: 'Review already submitted for this task' }, { status: 400 })
  }

  // Insert review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      task_id: params.taskId,
      reviewer_id: user.id,
      reviewee_id: acceptedApp.professional_id,
      rating,
      comment,
      review_type: 'customer_to_professional',
      quality_rating: qualityRating,
      communication_rating: communicationRating,
      timeliness_rating: timelinessRating,
      professionalism_rating: professionalismRating
    })
    .select()
    .single()

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 })
  }

  // Mark task as reviewed by customer
  await supabase
    .from('tasks')
    .update({ reviewed_by_customer: true })
    .eq('id', params.taskId)

  // Reset grace period counter (will be added after migration)
  await supabase
    .from('users')
    .update({ tasks_created_since_last_review: 0 })
    .eq('id', user.id)

  // Trigger will auto-update professional's average_rating and total_reviews

  return NextResponse.json({
    success: true,
    review
  })
}
```

**Error Cases:**
- 401: Not authenticated
- 403: Not the task customer
- 404: Task not found
- 400: Task not completed / Review already exists / Invalid rating / No accepted application
- 500: Database error

---

#### 1.2. Get Professional Reviews: `GET /api/professionals/[id]/reviews`

**File:** `/src/app/api/professionals/[id]/route.ts` (UPDATE existing endpoint)

**Current State:** Returns `reviews: []` (line 58-61)

**New Implementation:**
```typescript
// Add this function at the top of the file
import { formatDistanceToNow } from 'date-fns'
import { bg, enUS, ru } from 'date-fns/locale'

function getDateLocale(lang: string) {
  switch(lang) {
    case 'bg': return bg
    case 'ru': return ru
    default: return enUS
  }
}

// In GET handler, replace the reviews: [] line with:
const [professionalResult, reviewsResult] = await Promise.all([
  supabaseAdmin.from('users').select('*').eq('id', id).single(),
  supabaseAdmin
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      communication_rating,
      quality_rating,
      professionalism_rating,
      timeliness_rating,
      reviewer:reviewer_id(full_name, avatar_url),
      task:task_id(title, category, subcategory)
    `)
    .eq('reviewee_id', id)
    .eq('review_type', 'customer_to_professional')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50)
])

// Transform reviews to UI format
const transformedReviews = (reviewsResult.data || []).map((review: any) => ({
  id: review.id,
  clientName: review.reviewer?.full_name || 'Unknown',
  clientAvatar: review.reviewer?.avatar_url,
  rating: review.rating,
  comment: review.comment || '',
  date: formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: getDateLocale('bg') // TODO: Get from request headers/query
  }),
  verified: true, // All reviews from completed tasks are verified
  anonymous: false, // MVP: no anonymous reviews yet
  isVisible: true,
  visibilityReason: 'visible_high_rating' as const,
  communicationRating: review.communication_rating,
  qualityRating: review.quality_rating,
  professionalismRating: review.professionalism_rating,
  timelinessRating: review.timeliness_rating
}))

// Return in response
const professional = {
  ...userData,
  reviews: transformedReviews
}
```

**Result:**
- ✅ ReviewsSection will automatically display real reviews
- ✅ Empty state shows when reviews.length === 0
- ✅ Average rating calculated from visible reviews

---

#### 1.3. Get Pending Reviews: `GET /api/reviews/pending`

**File:** `/src/app/api/reviews/pending/route.ts` (NEW)

**Purpose:** Fetch all completed tasks where customer hasn't left a review yet

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get completed tasks where:
  // 1. User is the customer
  // 2. Task is completed
  // 3. Has an accepted application
  // 4. Customer hasn't reviewed yet (reviewed_by_customer = false)
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      completed_at,
      applications!inner(professional_id, status, professional:professional_id(full_name, avatar_url))
    `)
    .eq('customer_id', user.id)
    .eq('status', 'completed')
    .eq('reviewed_by_customer', false)
    .eq('applications.status', 'accepted')
    .order('completed_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const pendingReviews = tasks.map(task => {
    const acceptedApp = (task.applications as any)[0] // Should only be one accepted
    const professional = acceptedApp?.professional

    return {
      id: task.id,
      title: task.title,
      professionalId: acceptedApp?.professional_id,
      professionalName: professional?.full_name || 'Unknown',
      professionalAvatar: professional?.avatar_url,
      completedAt: task.completed_at,
      daysAgo: Math.floor((Date.now() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24))
    }
  })

  return NextResponse.json({
    pendingReviews,
    count: pendingReviews.length
  })
}
```

**Response:**
```typescript
{
  pendingReviews: [
    {
      id: string,
      title: string,
      professionalId: string,
      professionalName: string,
      professionalAvatar?: string,
      completedAt: Date,
      daysAgo: number
    }
  ],
  count: number
}
```

---

#### 1.4. Task Creation Enforcement: `POST /api/tasks/can-create`

**File:** `/src/app/api/tasks/can-create/route.ts` (NEW)

**Purpose:** Check if user can create a new task (enforcement logic from completed task 08)

**Enforcement Hierarchy:**
1. **HARD BLOCK (Priority 1):** Any tasks in `pending_customer_confirmation` status?
2. **SOFT BLOCK (Priority 2):** Count tasks created since last review
   - Grace period: 3 tasks
   - If >= 3 unreviewable tasks created, require reviews first

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // PRIORITY 1: Check for pending confirmations (HARD BLOCK)
  const { data: pendingConfirmations } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      completed_by_professional_at,
      applications!inner(professional_id, status, professional:professional_id(full_name, avatar_url))
    `)
    .eq('customer_id', user.id)
    .eq('status', 'pending_customer_confirmation')
    .eq('applications.status', 'accepted')

  if (pendingConfirmations && pendingConfirmations.length > 0) {
    return NextResponse.json({
      canCreate: false,
      blockType: 'pending_confirmation',
      pendingConfirmations: pendingConfirmations.map(task => ({
        taskId: task.id,
        taskTitle: task.title,
        professionalName: (task.applications as any)[0]?.professional?.full_name,
        professionalId: (task.applications as any)[0]?.professional_id,
        completedAt: task.completed_by_professional_at
      })),
      pendingReviews: [],
      gracePeriodUsed: 0,
      unreviewedCount: 0
    })
  }

  // PRIORITY 2: Check for missing reviews (SOFT BLOCK with grace)
  // Get user's grace period counter (after migration adds this field)
  const { data: userData } = await supabase
    .from('users')
    .select('tasks_created_since_last_review')
    .eq('id', user.id)
    .single()

  const gracePeriodUsed = userData?.tasks_created_since_last_review || 0

  // Get unreviewed completed tasks
  const { data: unreviewedTasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      completed_at,
      applications!inner(professional_id, status, professional:professional_id(full_name, avatar_url))
    `)
    .eq('customer_id', user.id)
    .eq('status', 'completed')
    .eq('reviewed_by_customer', false)
    .eq('applications.status', 'accepted')
    .order('completed_at', { ascending: false })

  const unreviewedCount = unreviewedTasks?.length || 0

  // Enforce after 3 tasks created without review
  if (unreviewedCount > 0 && gracePeriodUsed >= 3) {
    return NextResponse.json({
      canCreate: false,
      blockType: 'missing_reviews',
      pendingConfirmations: [],
      pendingReviews: unreviewedTasks!.map(task => ({
        taskId: task.id,
        taskTitle: task.title,
        professionalName: (task.applications as any)[0]?.professional?.full_name,
        professionalId: (task.applications as any)[0]?.professional_id,
        completedAt: task.completed_at
      })),
      gracePeriodUsed,
      unreviewedCount
    })
  }

  // Allow task creation
  return NextResponse.json({
    canCreate: true,
    blockType: null,
    pendingConfirmations: [],
    pendingReviews: [],
    gracePeriodUsed,
    unreviewedCount
  })
}
```

**Response:**
```typescript
{
  canCreate: boolean,
  blockType: 'pending_confirmation' | 'missing_reviews' | null,
  pendingConfirmations: Task[],  // If blockType = 'pending_confirmation'
  pendingReviews: Task[],        // If blockType = 'missing_reviews'
  gracePeriodUsed: number,       // 0-3
  unreviewedCount: number
}
```

**Frontend Integration:**
- Call this endpoint when user clicks "Create Task" button
- Show appropriate enforcement dialog based on `blockType`
- Prevent task creation form from opening if `canCreate = false`

---

### Part 2: Database Migrations (1-2 hours)

#### 2.1. Add Grace Period Tracking to Users Table

**File:** `/supabase/migrations/20251113_add_grace_period_tracking.sql` (NEW)

```sql
-- Add grace period counter to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS tasks_created_since_last_review INTEGER DEFAULT 0;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_grace_period
ON public.users(id, tasks_created_since_last_review);

-- Add comment
COMMENT ON COLUMN public.users.tasks_created_since_last_review IS
'Tracks how many tasks created since last review submission (for enforcement grace period)';
```

**Note:** `reviewed_by_customer` and `reviewed_by_professional` fields **already exist** in tasks table (lines 120-121 of initial schema)

---

#### 2.2. Auto-update Professional Rating Trigger

**File:** `/supabase/migrations/20251113_reviews_rating_trigger.sql` (NEW)

```sql
-- Function to recalculate professional's average rating
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average and count for the reviewee (professional)
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
    )
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on INSERT
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();

-- Trigger on UPDATE (in case review is edited/hidden)
CREATE TRIGGER on_review_updated
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR
        OLD.is_hidden IS DISTINCT FROM NEW.is_hidden)
  EXECUTE FUNCTION update_professional_rating();

-- Comment
COMMENT ON FUNCTION update_professional_rating() IS
'Auto-updates professional average_rating and total_reviews when reviews are created/updated/hidden';
```

**Purpose:**
- ✅ Keep `users.average_rating` always accurate
- ✅ Keep `users.total_reviews` always accurate
- ✅ Automatically recalculate when reviews are added/updated/hidden
- ✅ Only count visible reviews (is_hidden = false)

---

#### 2.3. Performance Indexes

**File:** `/supabase/migrations/20251113_reviews_indexes.sql` (NEW)

```sql
-- Fast lookup of reviews for a professional (for detail page)
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_type_visible
  ON public.reviews(reviewee_id, review_type, is_hidden, created_at DESC);

-- Fast lookup of pending reviews for a customer
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_type
  ON public.reviews(reviewer_id, review_type);

-- Fast check if review exists for task
CREATE INDEX IF NOT EXISTS idx_reviews_task_reviewer
  ON public.reviews(task_id, reviewer_id);

-- Fast query for completed unreviewed tasks (enforcement)
CREATE INDEX IF NOT EXISTS idx_tasks_customer_status_reviewed
  ON public.tasks(customer_id, status, reviewed_by_customer);

-- Comments
COMMENT ON INDEX idx_reviews_reviewee_type_visible IS
'Optimizes professional detail page review fetching';

COMMENT ON INDEX idx_tasks_customer_status_reviewed IS
'Optimizes pending reviews and enforcement queries';
```

---

#### 2.4. Grace Period Counter Management

**Update Task Creation Endpoint:**

**File:** `/src/app/api/tasks/route.ts` (modify POST handler)

```typescript
// After successful task creation, increment grace period counter
await supabase
  .from('users')
  .update({
    tasks_created_since_last_review: sql`tasks_created_since_last_review + 1`
  })
  .eq('id', user.id)
```

**Note:** When review is submitted (Part 1.1), counter is reset to 0

---

### Part 3: Frontend Integration (2-3 hours)

#### 3.1. Connect ReviewDialog to Real API

**File:** `/src/features/reviews/components/review-dialog.tsx`

**Current State:** Mock `onSubmit` handler

**Update:**
```typescript
const handleSubmitReview = async (data: ReviewSubmitData) => {
  try {
    const response = await fetch(`/api/tasks/${data.taskId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: data.rating,
        comment: data.reviewText,
        // Add detailed ratings if your form collects them
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit review')
    }

    const result = await response.json()

    // Show success toast
    toast.success(t('reviews.submitSuccess'))

    // Refresh pending reviews list
    queryClient.invalidateQueries(['pendingReviews'])

    return result
  } catch (error) {
    // Show error toast
    toast.error(error instanceof Error ? error.message : t('reviews.submitError'))
    throw error
  }
}
```

**Error Handling:**
- [ ] Show toast notification on success
- [ ] Show specific error messages (duplicate, not authorized, etc.)
- [ ] Handle 400 (validation), 403 (not authorized), 404 (task not found), 500 (server error)
- [ ] Refresh UI after successful submission

---

#### 3.2. Connect PendingReviewsList to Real Data

**File:** `/src/features/reviews/components/pending-reviews-list.tsx`

**Current State:** Uses mock data from `lib/mock-reviews-data.ts`

**Update:**
```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['pendingReviews'],
  queryFn: async () => {
    const res = await fetch('/api/reviews/pending')
    if (!res.ok) throw new Error('Failed to fetch pending reviews')
    const data = await res.json()
    return data
  }
})

const pendingReviews = data?.pendingReviews || []
const count = data?.count || 0
```

**Display:**
- [ ] Show loading skeleton while fetching
- [ ] Display count badge in header
- [ ] Handle empty state (no pending reviews)
- [ ] Refresh list after review submitted
- [ ] Show error state if fetch fails

---

#### 3.3. Integrate Enforcement Logic into Create Task Flow

**File:** `/src/hooks/use-create-task.ts` (CREATE NEW or UPDATE existing)

**Implementation:**
```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

export function useCreateTask() {
  const router = useRouter()
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [blockingTasks, setBlockingTasks] = useState<any[]>([])

  // Check if user can create task
  const { data: eligibility } = useQuery({
    queryKey: ['can-create-task'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/can-create')
      if (!res.ok) throw new Error('Failed to check eligibility')
      return res.json()
    }
  })

  const handleCreateTask = async () => {
    if (!eligibility) return

    if (!eligibility.canCreate) {
      if (eligibility.blockType === 'pending_confirmation') {
        // Show pending confirmation dialog
        setBlockingTasks(eligibility.pendingConfirmations)
        setShowConfirmationDialog(true)
      } else if (eligibility.blockType === 'missing_reviews') {
        // Show review enforcement dialog
        setBlockingTasks(eligibility.pendingReviews)
        setShowReviewDialog(true)
      }
      return
    }

    // Allow task creation
    router.push('/create-task')
  }

  return {
    handleCreateTask,
    canCreate: eligibility?.canCreate ?? true,
    blockType: eligibility?.blockType,
    showConfirmationDialog,
    showReviewDialog,
    blockingTasks,
    setShowConfirmationDialog,
    setShowReviewDialog
  }
}
```

**Integration Points:**
- [ ] Header "Create Task" button → `components/common/header.tsx`
- [ ] Landing page CTA → `app/[lang]/page.tsx`
- [ ] Profile page "Create Task" button → `app/[lang]/profile/page.tsx`

**Example Usage:**
```typescript
// In header.tsx or any component with Create Task button
import { useCreateTask } from '@/hooks/use-create-task'

function CreateTaskButton() {
  const {
    handleCreateTask,
    showReviewDialog,
    blockingTasks,
    setShowReviewDialog
  } = useCreateTask()

  return (
    <>
      <Button onClick={handleCreateTask}>
        {t('navigation.createTask')}
      </Button>

      <ReviewEnforcementDialog
        isOpen={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        pendingReviews={blockingTasks}
      />
    </>
  )
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Review submission validation (rating range, duplicate check)
- [ ] Date formatting (i18n: преди X дни)
- [ ] Rating calculation (average, rounding)
- [ ] Grace period counter logic

### Integration Tests
- [ ] Submit review for completed task → Updates professional's average_rating
- [ ] Try to submit duplicate review → Returns 400 error
- [ ] Fetch professional with 0 reviews → Empty state
- [ ] Fetch professional with 10+ reviews → Shows reviews correctly
- [ ] Create task with pending confirmation → Hard blocked
- [ ] Create 4th task without reviews → Soft blocked
- [ ] Submit review → Resets grace period counter

### E2E User Flows
- [ ] **Complete review flow:**
  1. Task marked complete by professional
  2. Customer confirms completion
  3. Task status = completed, reviewed_by_customer = false
  4. Customer tries to create 4th task
  5. Gets blocked with review enforcement dialog
  6. Submits pending reviews
  7. Can now create new task
- [ ] **Professional reviews display:**
  1. Professional completes tasks
  2. Customers leave reviews
  3. Professional's profile shows real reviews
  4. Average rating updates automatically

### Edge Cases
- [ ] Professional with no completed tasks (no reviews possible)
- [ ] Professional with completed tasks but no reviews (empty state)
- [ ] Task cancelled before completion (no review)
- [ ] Customer at exactly 3 tasks grace period (still allowed)
- [ ] Customer at 4th task (blocked)
- [ ] Review submitted for task without accepted application (400 error)
- [ ] Anonymous customer reviews (future feature)
- [ ] Review flagged/hidden (doesn't count in average)

---

## Database Indexes for Performance

**Existing indexes from schema:**
```sql
-- Already exists (good for professional detail page)
CREATE INDEX idx_users_average_rating ON users(average_rating DESC)
  WHERE user_type IN ('professional', 'both');
```

**New indexes (Part 2.3):**
- `idx_reviews_reviewee_type_visible` - Professional review fetching
- `idx_reviews_reviewer_type` - Customer pending reviews
- `idx_reviews_task_reviewer` - Duplicate review check
- `idx_tasks_customer_status_reviewed` - Enforcement queries
- `idx_users_grace_period` - Grace period tracking

---

## Translation Keys (Already Complete ✅)

All translation keys exist in:
- `/src/lib/intl/en/reviews.ts`
- `/src/lib/intl/bg/reviews.ts`
- `/src/lib/intl/ru/reviews.ts`

**Namespaces:**
- `reviews.dialog.*` - Review submission form
- `reviews.pending.*` - Pending reviews list
- `reviews.enforcement.*` - Blocking dialogs
- `professionalDetail.reviews.*` - Reviews display section

---

## Dependencies

### Existing (No Installation Needed):
- ✅ `date-fns` - Date formatting (преди X дни)
- ✅ `@tanstack/react-query` - Data fetching
- ✅ `react-i18next` - Internationalization
- ✅ NextUI components (Modal, Button, Input, etc.)
- ✅ Supabase client (server/client variants)

### Frontend Components (Already Built):
- ✅ `/src/features/reviews/components/review-dialog.tsx`
- ✅ `/src/features/reviews/components/pending-reviews-list.tsx`
- ✅ `/src/features/reviews/components/review-enforcement-dialog.tsx`
- ✅ `/src/features/professionals/components/sections/reviews-section.tsx`

---

## Priority & Effort Estimation

**Priority:** **HIGH** - Core platform feature that drives trust and engagement

**Estimated Effort:**
- Part 1 (API Endpoints): **3-4 hours**
- Part 2 (DB Migrations): **1-2 hours**
- Part 3 (Frontend Integration): **2-3 hours**
- Testing & QA: **2-3 hours**
- **Total:** **8-12 hours** (~1.5-2 development days)

---

## Success Metrics

After implementation, verify:
- ✅ Professionals display real reviews on detail pages
- ✅ Customers can submit reviews after task completion
- ✅ Average rating auto-updates when reviews submitted
- ✅ Task creation blocked when confirmations pending (hard block)
- ✅ Task creation blocked after 3 tasks without reviews (soft block)
- ✅ Grace period counter tracks properly
- ✅ All UI flows work with real data (no more mock data)
- ✅ Performance: Professional detail page loads in <500ms with 20+ reviews

---

## Migration Execution Order

1. **20251113_add_grace_period_tracking.sql** - Add grace period counter
2. **20251113_reviews_rating_trigger.sql** - Auto-update rating trigger
3. **20251113_reviews_indexes.sql** - Performance indexes
4. Deploy backend API endpoints
5. Deploy frontend integration
6. Test with real users
7. Monitor performance and adjust if needed

---

## Follow-up Tasks (Future Enhancements)

### Immediate Post-MVP
- [ ] **Review-on-Completion Flow** (from completed task 06)
  - Add optional review fields to ConfirmCompletionDialog
  - Star rating + comment + actual price paid
  - Allows instant review submission during completion
  - Makes review process smoother (less enforcement needed)

### Future Features
- [ ] Pagination for professionals with 50+ reviews
- [ ] Review filtering (by rating, by date range)
- [ ] "Report review" functionality
- [ ] Professional response to reviews
- [ ] Review statistics dashboard (rating distribution chart)
- [ ] Anonymous review option (privacy setting)
- [ ] Review editing (within 24 hours of submission)
- [ ] Professional-to-customer reviews (bidirectional rating)
- [ ] Review reminders via email/SMS/Telegram
- [ ] Featured reviews / highlight best reviews
- [ ] Photo uploads in reviews

---

## Notes

### Implementation Strategy
- **No breaking changes** - All changes are additive
- **Backward compatible** - Existing code continues to work
- **RLS policies** - Already exist in schema for reviews table
- **Service role key** - Use for reading public reviews (bypass RLS)
- **Auth required** - All review operations need authenticated user
- **Rate limiting** - Consider adding rate limit to review submission (1 review per task)

### Enforcement Philosophy (from completed task 08)

**Two-Tier System:**
1. **HARD BLOCK (Immediate):** Pending confirmations must be resolved
   - Professional completed work and is waiting
   - No grace period - blocks immediately
   - Clear action required message

2. **SOFT BLOCK (Grace Period):** Missing reviews
   - 3-task grace period before enforcement
   - Gentle reminders during grace period
   - Hard block after 3 tasks created

**Why This Approach?**
- ✅ Non-intrusive (only blocks when creating new task)
- ✅ Clear value proposition (help community, get better matches)
- ✅ Fair to users (3-task grace period)
- ✅ Ensures professionals get feedback
- ✅ Builds robust review ecosystem

**Mitigation for Friction:**
- Make reviewing fast (star rating is enough)
- Show progress ("1 of 2 reviews remaining")
- Batch review flow (multiple in sequence)
- Gentle messaging ("Help others" vs "You must")

### Questions Before Starting

Clarify with product owner:
1. Should customers be able to edit reviews after submission?
2. Should professionals be able to respond to reviews?
3. Grace period: Is 3 tasks the right number? (configurable?)
4. Send notification when professional receives review?
5. Reviews visible immediately or require moderation?
6. Should we implement review-on-completion (task 06) alongside this?

---

## Related Documentation

- **Phase 1 (Frontend - Completed):** `/complete_tasks/08-completion-and-review-enforcement.md`
- **Review-on-Completion (Separate):** `/complete_tasks/06-customer-review-on-completion.md`
- **Database Schema:** `/supabase/migrations/20251027000000_initial_schema.sql`
- **PRD:** `/PRD.md` - Section 3.5 (Reviews & Ratings)
- **Implementation Roadmap:** `/docs/implementation-roadmap.md`
