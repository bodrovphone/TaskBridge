# Professional Detail Page - Reviews & Ratings Integration

## Task Description
Wire up the Reviews & Ratings section on the professional detail page to fetch and display real review data from the `reviews` table in Supabase. The UI components already exist and work with mock data - we just need to integrate with the database.

## Current State
- ✅ UI components exist: `<ReviewsSection />` with all dialogs and interactions
- ✅ Conditional rendering: Only shows when `reviews.length > 0`
- ❌ API returns empty array: `reviews: []`
- ✅ Database table exists: `reviews` table in Supabase

## Target State
- Reviews fetched from database for each professional
- Display real ratings, comments, and metadata
- All existing UI features work with real data (dialogs, filtering, etc.)

## Requirements

### 1. Database Schema Review
Review the `reviews` table schema from `/src/types/database.types.ts`:
- [ ] Check all available columns
- [ ] Understand review types (customer_to_professional, professional_to_customer)
- [ ] Review relationship to `users` and `tasks` tables

### 2. API Implementation
Update `/src/app/api/professionals/[id]/route.ts`:

- [ ] Fetch reviews where `reviewee_id = professional.id`
- [ ] Use service role to bypass RLS (public reviews should be visible)
- [ ] Fetch in parallel with main professional query for performance
- [ ] Filter by `review_type = 'customer_to_professional'` (customers rating professionals)
- [ ] Order by `created_at DESC` (newest first)
- [ ] Limit to last 50 reviews (or configurable)

```typescript
// Parallel fetch example
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
      task:task_id(title, category)
    `)
    .eq('reviewee_id', id)
    .eq('review_type', 'customer_to_professional')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50)
]);
```

### 3. Data Transformation
Transform database reviews to match UI component expectations:

- [ ] Map database fields to UI interface:
  - `id` → `id`
  - `rating` → `rating`
  - `comment` → `comment`
  - `created_at` → `date` (formatted as "преди X дни/седмици")
  - `reviewer.full_name` → `clientName`
  - `reviewer.avatar_url` → `clientAvatar` (optional)
  - Determine `verified` based on task completion status
  - Check if review should be `anonymous` based on privacy settings
  - Set `isVisible` and `visibilityReason` (all fetched reviews are visible)

```typescript
interface ReviewForUI {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  date: string; // "преди 1 седмица"
  verified: boolean;
  anonymous: boolean;
  isVisible: boolean;
  visibilityReason: 'visible_high_rating' | 'visible_pattern_detected' | 'hidden_pending_pattern';
  // Optional detailed ratings
  communicationRating?: number;
  qualityRating?: number;
  professionalismRating?: number;
  timelinessRating?: number;
}
```

### 4. Empty State Handling
- [ ] When `reviews.length === 0`, section should not render (existing behavior)
- [ ] Consider adding a placeholder in the header stats: "No reviews yet" vs "4.8 (23 reviews)"

### 5. Average Rating Calculation
- [ ] Verify `average_rating` in users table is kept up-to-date
- [ ] Ensure `total_reviews` count matches actual review count
- [ ] Consider trigger/function to auto-update on new review

### 6. Privacy & Moderation
Review existing features and ensure they work:
- [ ] Hidden reviews (`is_hidden = true`) should not be fetched
- [ ] Flagged reviews (`is_flagged = true`) - decide if they should show
- [ ] Anonymous reviews - display as "Анонимен потребител"
- [ ] Safety warnings for patterns of negative reviews

### 7. Testing Checklist
- [ ] Professional with 0 reviews - section doesn't render
- [ ] Professional with 1-3 reviews - displays correctly
- [ ] Professional with 10+ reviews - pagination/load more works
- [ ] Detailed rating breakdowns display correctly
- [ ] Review dates format correctly (i18n)
- [ ] Anonymous reviews display properly
- [ ] Verified badge shows for completed task reviews
- [ ] Click through to task details works (if implemented)

## Technical Notes

### Database Query Performance
- Use `.select()` with specific fields and joins to minimize data transfer
- Consider adding index on `(reviewee_id, review_type, is_hidden, created_at)` for fast queries
- Limit to 50 most recent reviews to avoid large payloads

### Review Types
From database schema, review types are:
- `customer_to_professional` - Customer rating the professional (THIS ONE for detail page)
- `professional_to_customer` - Professional rating the customer (not shown on professional profile)

### Date Formatting
Use existing i18n date formatting:
```typescript
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS, ru } from 'date-fns/locale';

const timeAgo = formatDistanceToNow(new Date(review.created_at), {
  addSuffix: true,
  locale: getDateLocale(i18n.language),
});
```

### Fallback Behavior
If API fetch fails:
- Log error but don't break page
- Return empty reviews array
- Section simply won't render (graceful degradation)

## Dependencies
- Existing `<ReviewsSection />` component in `/src/features/professionals/components/sections/reviews-section.tsx`
- `reviews` table in Supabase with proper RLS policies
- `date-fns` for date formatting (already installed)

## Priority
**Medium** - Professional profiles work without reviews, but they add significant trust and credibility

## Estimated Effort
- API implementation: 1 hour
- Data transformation: 1 hour
- Testing & edge cases: 1 hour
- **Total**: ~3 hours

## Follow-up Tasks
- [ ] Add pagination for professionals with 50+ reviews
- [ ] Add review filtering (by rating, by recency)
- [ ] Add "Report review" functionality
- [ ] Add review response feature (professional can respond to reviews)
- [ ] Add review statistics (average per category, distribution chart)
