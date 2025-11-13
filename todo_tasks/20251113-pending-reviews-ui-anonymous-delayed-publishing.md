# Pending Reviews UI + Anonymous & Delayed Publishing

## Task Description
Create a dedicated "Pending Reviews" page where customers can proactively browse and submit reviews for completed tasks. Add privacy controls: anonymous reviews and delayed publishing (1 week) to prevent professional retaliation.

## Current State
✅ API endpoint exists: `/api/reviews/pending` (fetches pending reviews)
✅ Component exists: `PendingReviewsList` (UI to display pending reviews)
✅ Component exists: `ReviewDialog` (review submission form)
✅ Notifications sent on task completion with `task_completed` type
❌ No dedicated page/route for browsing pending reviews
❌ No navigation link to access pending reviews
❌ No badge indicator showing count of pending reviews
❌ No anonymous review option
❌ No delayed publishing option
❌ Database schema missing `is_anonymous` and `published_at` fields
⚠️ Notification messages don't explicitly prompt for reviews
⚠️ Notification actionUrls point to wrong pages

## Requirements

### 1. Database Schema Updates

**Add to `reviews` table:**
```sql
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- Index for published reviews filtering
CREATE INDEX IF NOT EXISTS idx_reviews_published_at
  ON public.reviews(published_at, is_hidden)
  WHERE is_hidden = false;

-- Update existing reviews to have published_at = created_at
UPDATE public.reviews
SET published_at = created_at
WHERE published_at IS NULL;
```

**Update RLS policies** to respect `published_at`:
- Reviews with `published_at > NOW()` should only be visible to reviewer
- Update professional review queries to filter `published_at <= NOW()`

### 2. API Updates

**Update `/api/professionals/[id]/route.ts`** - Filter published reviews:
```typescript
.select('...')
.eq('reviewee_id', id)
.eq('review_type', 'customer_to_professional')
.eq('is_hidden', false)
.lte('published_at', new Date().toISOString())  // ✅ Only published reviews
.order('created_at', { ascending: false })
```

**Update `/api/tasks/[id]/reviews/route.ts`** - Accept new fields:
```typescript
const {
  rating,
  comment,
  qualityRating,
  communicationRating,
  timelinessRating,
  professionalismRating,
  isAnonymous,        // ✅ NEW
  delayPublishing     // ✅ NEW
} = body

const publishedAt = delayPublishing
  ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()  // 1 week delay
  : new Date().toISOString()

await supabase
  .from('reviews')
  .insert({
    // ... existing fields
    is_anonymous: isAnonymous || false,
    published_at: publishedAt
  })
```

**Important**: When reviews are delayed, professional's `average_rating` and `total_reviews` should NOT update until `published_at` is reached. Update database trigger:

```sql
-- Modify trigger to only count published reviews
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()  -- ✅ Only published reviews
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND review_type = 'customer_to_professional'
        AND is_hidden = false
        AND published_at <= NOW()  -- ✅ Only published reviews
    )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Create cron job** to trigger rating recalculation when delayed reviews become published:
- `/api/cron/publish-delayed-reviews` - Runs daily, triggers `update_professional_rating()` for affected professionals

### 3. ReviewDialog UI Updates

**File**: `src/features/reviews/components/review-dialog.tsx`

**Add checkboxes** (below review text area, before submit button):

```tsx
{/* Privacy Controls */}
<div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
  <h4 className="font-medium text-sm text-gray-700">
    {t('reviews.dialog.privacyOptions')}
  </h4>

  {/* Anonymous Review */}
  <label className="flex items-start gap-3 cursor-pointer">
    <Checkbox
      checked={isAnonymous}
      onCheckedChange={setIsAnonymous}
    />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">
        {t('reviews.dialog.postAnonymously')}
      </p>
      <p className="text-xs text-gray-600">
        {t('reviews.dialog.postAnonymouslyDescription')}
      </p>
    </div>
  </label>

  {/* Delayed Publishing */}
  <label className="flex items-start gap-3 cursor-pointer">
    <Checkbox
      checked={delayPublishing}
      onCheckedChange={setDelayPublishing}
    />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">
        {t('reviews.dialog.delayPublishing')}
      </p>
      <p className="text-xs text-gray-600">
        {t('reviews.dialog.delayPublishingDescription')}
      </p>
    </div>
  </label>
</div>

{/* Info callout when delayed */}
{delayPublishing && (
  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
    <p className="text-sm text-blue-900">
      {t('reviews.dialog.delayedPublishingInfo')}
    </p>
  </div>
)}
```

**Update submission handler**:
```typescript
const handleSubmit = () => {
  onSubmit({
    rating,
    reviewText: comment,
    isAnonymous,        // ✅ NEW
    delayPublishing     // ✅ NEW
  })
}
```

**Update types** in `src/features/reviews/lib/types.ts`:
```typescript
export interface ReviewSubmitData {
  rating: number
  reviewText?: string
  isAnonymous?: boolean      // ✅ NEW
  delayPublishing?: boolean  // ✅ NEW
}
```

### 4. Pending Reviews Page

**Create**: `/src/app/[lang]/reviews/pending/page.tsx`

```tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PendingReviewsList, ReviewDialog } from '@/features/reviews'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@nextui-org/react'

export default function PendingReviewsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // Fetch pending reviews
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['pendingReviews'],
    queryFn: async () => {
      const res = await fetch('/api/reviews/pending')
      if (!res.ok) throw new Error('Failed to fetch pending reviews')
      return res.json()
    }
  })

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: ReviewSubmitData }) => {
      const res = await fetch(`/api/tasks/${taskId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit review')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] })
      queryClient.invalidateQueries({ queryKey: ['can-create-task'] })

      toast({
        title: t('reviews.dialog.successTitle'),
        description: t('reviews.dialog.successMessage'),
        variant: 'default'
      })

      setShowReviewDialog(false)
      setCurrentTaskId(null)
    },
    onError: (error: Error) => {
      toast({
        title: t('reviews.dialog.errorTitle'),
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleReviewTask = (taskId: string) => {
    setCurrentTaskId(taskId)
    setShowReviewDialog(true)
  }

  const handleSubmitReview = async (data: ReviewSubmitData) => {
    if (!currentTaskId) return
    await submitReviewMutation.mutateAsync({ taskId: currentTaskId, data })
  }

  const getCurrentTask = () => {
    return tasks?.find((t: any) => t.id === currentTaskId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('reviews.pending.pageTitle')}
          </h1>
          <p className="text-gray-600">
            {t('reviews.pending.pageDescription')}
          </p>
        </div>

        {/* Pending Reviews List */}
        <PendingReviewsList
          tasks={tasks || []}
          onReviewTask={handleReviewTask}
          isLoading={isLoading}
        />

        {/* Review Dialog */}
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => {
            setShowReviewDialog(false)
            setCurrentTaskId(null)
          }}
          task={getCurrentTask()}
          onSubmit={handleSubmitReview}
          isLoading={submitReviewMutation.isPending}
        />
      </div>
    </div>
  )
}
```

### 5. Navigation Integration

**A) Create Pending Reviews Count Hook**

**File**: `src/hooks/use-pending-reviews-count.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'

export function usePendingReviewsCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['pendingReviewsCount'],
    queryFn: async () => {
      const res = await fetch('/api/reviews/pending')
      if (!res.ok) return 0
      const data = await res.json()
      return data.length || 0
    },
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: true
  })
}
```

**B) Update Header Navigation**

**File**: `src/components/common/header.tsx`

```tsx
import { usePendingReviewsCount } from '@/hooks/use-pending-reviews-count'

function Header() {
  const { data: pendingReviewCount = 0 } = usePendingReviewsCount()

  // ... in mobile menu, add to "For Customers" section:

  <NavbarMenuItem>
    <NextUILink
      href={`/${lang}/reviews/pending`}
      className="w-full text-gray-900 hover:text-primary font-medium py-2 flex items-center gap-2"
      size="lg"
      onPress={() => {
        setIsMenuOpen(false)
        router.push(`/${lang}/reviews/pending`)
      }}
    >
      <Star size={18} className="text-gray-500" />
      {t('nav.pendingReviews')}
      {pendingReviewCount > 0 && (
        <Chip size="sm" color="warning" variant="flat">
          {pendingReviewCount}
        </Chip>
      )}
    </NextUILink>
  </NavbarMenuItem>
}
```

**C) Update User Avatar Dropdown**

**File**: `src/components/ui/user-avatar-dropdown.tsx`

Add pending reviews link in customer section with badge.

**D) Update Profile Page Quick Actions**

Add "Pending Reviews" button with badge indicator.

### 6. Notification Updates

**A) Update Notification Messages**

**File**: `src/lib/utils/notification-i18n.ts`

```typescript
taskCompleted: {
  en: {
    title: 'Task Completed - Review Needed ⭐',
    message: '"{taskTitle}" is completed. Please take a moment to leave a review for {professionalName}.',
    telegram: '✅ Great news! Your task "{taskTitle}" was completed by {professionalName}.\n\n⭐ Please leave a review to help others find great professionals.\n\n{link}'
  },
  bg: {
    title: 'Задача завършена - Необходима е оценка ⭐',
    message: '"{taskTitle}" е завършена. Моля, оставете оценка за {professionalName}.',
    telegram: '✅ Чудесни новини! Вашата задача "{taskTitle}" беше завършена от {professionalName}.\n\n⭐ Моля, оставете оценка, за да помогнете на други да намерят добри професионалисти.\n\n{link}'
  },
  ru: {
    title: 'Задание завершено - Нужен отзыв ⭐',
    message: '"{taskTitle}" завершено. Пожалуйста, оставьте отзыв для {professionalName}.',
    telegram: '✅ Отличные новости! Ваше задание "{taskTitle}" было завершено специалистом {professionalName}.\n\n⭐ Пожалуйста, оставьте отзыв, чтобы помочь другим найти хороших профессионалов.\n\n{link}'
  }
}
```

**B) Update Notification ActionUrls**

**In**: `src/app/api/tasks/[id]/mark-complete/route.ts`

Change line 133:
```typescript
actionUrl: isProfessional ? '/reviews/pending' : '/tasks/work',
// Professional marks complete → Customer sees review page
// Customer marks complete → Professional sees work page
```

**In**: `src/app/api/tasks/[id]/confirm-completion/route.ts`

Change line 196:
```typescript
actionUrl: '/tasks/work',  // Professional always sees their work page
```

### 7. Translation Keys

**Add to** `src/lib/intl/[lang]/reviews.ts`:

```typescript
// Pending Reviews Page
'reviews.pending.pageTitle': 'Pending Reviews',
'reviews.pending.pageDescription': 'Leave reviews for completed tasks to help other customers',

// Review Dialog - Privacy Options
'reviews.dialog.privacyOptions': 'Privacy Options',
'reviews.dialog.postAnonymously': 'Post review anonymously',
'reviews.dialog.postAnonymouslyDescription': 'Your name will be hidden from the professional',
'reviews.dialog.delayPublishing': 'Delay publishing (1 week)',
'reviews.dialog.delayPublishingDescription': 'Review will be published in 1 week to protect your privacy',
'reviews.dialog.delayedPublishingInfo': 'This review will be published on {date}. The professional will not see it until then.',

// Navigation
'nav.pendingReviews': 'Pending Reviews',
```

## Acceptance Criteria

- [ ] Database migration adds `is_anonymous` and `published_at` columns
- [ ] Database trigger only counts published reviews in professional ratings
- [ ] API endpoint filters reviews by `published_at <= NOW()`
- [ ] ReviewDialog has "Anonymous" checkbox
- [ ] ReviewDialog has "Delay Publishing" checkbox with info callout
- [ ] Review submission includes new fields
- [ ] Pending Reviews page created at `/reviews/pending`
- [ ] Navigation link added to header with badge indicator
- [ ] Badge shows count of pending reviews (0 hidden, >0 shown)
- [ ] Notification messages explicitly mention leaving reviews
- [ ] Notification actionUrls point to `/reviews/pending`
- [ ] Anonymous reviews hide reviewer name in professional's review list
- [ ] Delayed reviews don't affect professional rating until published
- [ ] Cron job exists to recalculate ratings when delayed reviews publish
- [ ] All translations added (EN/BG/RU)
- [ ] Test anonymous review submission
- [ ] Test delayed review submission (verify not visible immediately)
- [ ] Test professional can't see delayed review
- [ ] Test rating recalculation after delay period

## Technical Notes

### Database Considerations
- **Default values**: `is_anonymous = false`, `published_at = NOW()`
- **Existing reviews**: Set `published_at = created_at` in migration
- **Cascade behavior**: If review is deleted before publishing, no rating impact

### Privacy Implementation
- **Anonymous reviews**: Show "Anonymous Customer" instead of full name
- **Delayed reviews**: Not visible in any query until `published_at <= NOW()`
- **Rating calculation**: Only published reviews count toward `average_rating`

### Cron Job Logic
```typescript
// /api/cron/publish-delayed-reviews/route.ts
// Runs daily at midnight
export async function GET(request: NextRequest) {
  // Find reviews that just became published (published_at was in past 24h)
  const { data: newlyPublished } = await supabase
    .from('reviews')
    .select('reviewee_id')
    .lte('published_at', new Date().toISOString())
    .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .eq('review_type', 'customer_to_professional')

  // Trigger rating recalculation for affected professionals
  const uniqueProfessionals = [...new Set(newlyPublished.map(r => r.reviewee_id))]

  for (const profId of uniqueProfessionals) {
    // Trigger function will recalculate based on published_at
    await supabase.rpc('update_professional_rating_for_user', { user_id: profId })
  }
}
```

### Edge Cases
1. **Customer deletes account before delayed review publishes**: Review stays but shows "Anonymous Customer"
2. **Professional blocks customer before review publishes**: Review still publishes (no retaliation)
3. **Customer leaves multiple delayed reviews**: All publish independently on their schedules

## Priority
**High** - Critical for user trust and platform safety

## Estimated Effort
**6-8 hours**
- Database migration + trigger updates: 1 hour
- API updates (reviews filtering, submission): 1.5 hours
- ReviewDialog UI updates (checkboxes, state): 1.5 hours
- Pending Reviews page creation: 1.5 hours
- Navigation integration (badges, links): 1 hour
- Notification message updates: 0.5 hour
- Cron job implementation: 1 hour
- Translation keys: 0.5 hour
- Testing (anonymous, delayed, ratings): 1.5 hours

## Dependencies
- Existing review system (✅ implemented)
- PendingReviewsList component (✅ exists)
- ReviewDialog component (✅ exists)
- Notification system (✅ exists)
- TanStack Query for data fetching (✅ exists)

## Files to Create/Modify

**New Files:**
- `src/app/[lang]/reviews/pending/page.tsx`
- `src/hooks/use-pending-reviews-count.ts`
- `src/app/api/cron/publish-delayed-reviews/route.ts`
- `supabase/migrations/20251113_add_review_privacy_fields.sql`
- `supabase/migrations/20251113_update_rating_trigger_for_published_reviews.sql`

**Modified Files:**
- `src/features/reviews/components/review-dialog.tsx`
- `src/features/reviews/lib/types.ts`
- `src/components/common/header.tsx`
- `src/components/ui/user-avatar-dropdown.tsx`
- `src/app/api/professionals/[id]/route.ts`
- `src/app/api/tasks/[id]/reviews/route.ts`
- `src/app/api/tasks/[id]/mark-complete/route.ts`
- `src/lib/utils/notification-i18n.ts`
- `src/lib/intl/en/reviews.ts`
- `src/lib/intl/bg/reviews.ts`
- `src/lib/intl/ru/reviews.ts`
