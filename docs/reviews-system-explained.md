# Reviews System - How It Works

## Overview

The review system uses **automated triggers** to keep `users.average_rating` and `users.total_reviews` in sync with the `reviews` table. It also supports **delayed publishing** for strategic review management.

## Database Architecture

### Tables

1. **reviews** - Stores all review data
   - `rating` (1-5 stars)
   - `comment` (optional text)
   - `published_at` (timestamp - controls when review becomes public)
   - `is_hidden` (boolean - for moderation)
   - `review_type` ('customer_to_professional' or 'professional_to_customer')

2. **users** - Cached aggregates for performance
   - `average_rating` (calculated from published reviews)
   - `total_reviews` (count of published reviews)

### Automatic Triggers

The database has triggers that **automatically update** `users` table when reviews change:

```sql
-- Trigger runs on INSERT or UPDATE of reviews
CREATE TRIGGER trigger_update_professional_rating
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();
```

**What the trigger does:**
1. Recalculates `average_rating` from all reviews where:
   - `review_type = 'customer_to_professional'`
   - `is_hidden = false`
   - `published_at <= NOW()` ⚠️ **Only published reviews count**
   - Rounded to **1 decimal place** (e.g., 4.7 instead of 4.67)

2. Updates `total_reviews` with the count of matching reviews

3. Sets `updated_at = NOW()`

## Review Publishing Flow

### Delayed Publishing Feature

Reviews can be published immediately OR delayed for strategic purposes:

```typescript
// In /app/api/tasks/[id]/reviews/route.ts
const publishedAt = calculatePublishedAt(delayPublishing || false)

// Production: delayed by 1 week
// Development/Staging: delayed by 1 day (for testing)
```

**Why delay publishing?**
- Gives professionals time to respond to customer concerns
- Prevents single negative reviews from unfairly impacting ratings
- Allows pattern detection for legitimate bad experiences

### Review Visibility Rules

1. **High ratings (≥4 stars)**: Always published immediately
2. **Low ratings (≤3 stars)**:
   - Can be delayed (configurable)
   - Hidden until pattern detected (3+ negative reviews)
   - See `/src/lib/reviews/visibility-manager.ts` for logic

## Data Flow

### 1. Customer Submits Review

```
POST /api/tasks/[id]/reviews
  ↓
Insert into reviews table
  ↓
Trigger fires automatically
  ↓
users.average_rating & total_reviews updated
```

### 2. Frontend Fetches Professional

```
GET /api/professionals/[id]
  ↓
Fetch from users table (average_rating, total_reviews)
  ↓
Fetch from reviews WHERE published_at <= NOW()
  ↓
Return to frontend
```

### 3. Frontend Display

```
ProfessionalHeader component
  ↓
Shows: total_reviews from database (published count)

ReviewsSection component
  ↓
Shows: Only visible reviews (published + pattern filtering)
```

## Common "Inconsistencies" (That Are Actually Correct)

### Scenario 1: Count Mismatch

**Observation**: Database shows 3 reviews, but UI shows 2

**Explanation**:
- 3 reviews exist in `reviews` table
- Only 2 have `published_at <= NOW()`
- 1 review is scheduled for future publishing
- `total_reviews = 2` is **CORRECT**

### Scenario 2: Rating Math Doesn't Add Up

**Observation**: 3 reviews (4, 5, 5 stars) but average_rating = 4.5

**Explanation**:
- Only 2 reviews are published (4, 5 stars)
- Average of 2 reviews: (4 + 5) / 2 = 4.5 ✅
- The 3rd review isn't published yet
- Rating will update to 4.7 when 3rd review publishes (rounded to 1 decimal)

### Scenario 3: Reviews Section Shows Different Count

**Observation**: Header shows "2 reviews" but section shows 1 review

**Explanation**:
- Header counts: Published reviews (from database)
- Section displays: Published reviews MINUS hidden (pattern detection)
- This is working as designed for negative review protection

## Manual Recalculation

If data becomes inconsistent due to manual database edits or migrations:

### Option 1: Single Professional

```sql
-- Use the built-in function
SELECT recalculate_professional_rating('professional-uuid-here');
```

### Option 2: All Professionals

```sql
-- Run the script
psql $DATABASE_URL < scripts/recalculate-professional-ratings.sql
```

### Option 3: Via API (Future)

```bash
# Cron job runs this daily for delayed reviews
curl -X POST /api/cron/recalculate-ratings
```

## Debugging Checklist

If you notice "inconsistent" data:

1. **Check published_at dates**
   ```sql
   SELECT id, rating, published_at, (published_at <= NOW()) as is_published
   FROM reviews
   WHERE reviewee_id = 'professional-uuid'
   ORDER BY created_at DESC;
   ```

2. **Check is_hidden flag**
   ```sql
   SELECT id, rating, is_hidden
   FROM reviews
   WHERE reviewee_id = 'professional-uuid';
   ```

3. **Manually recalculate**
   ```sql
   SELECT recalculate_professional_rating('professional-uuid');
   ```

4. **Verify trigger is installed**
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE event_object_table = 'reviews';
   ```

## Testing

### Test Delayed Publishing

1. Submit a review with `delayPublishing: true`
2. Check `published_at` is in the future
3. Verify `total_reviews` doesn't change immediately
4. Wait for publish date or manually update:
   ```sql
   UPDATE reviews
   SET published_at = NOW()
   WHERE id = 'review-uuid';
   ```
5. Verify `total_reviews` and `average_rating` update automatically

### Test Pattern Detection

1. Create professional with 1 negative review (≤3 stars)
2. Verify review is hidden from public view
3. Add 2 more negative reviews
4. Verify all 3 negative reviews become visible (pattern detected)

## Files Reference

- **Triggers**: `/supabase/migrations/20251113_update_rating_trigger_for_published_reviews.sql`
- **Recalc Function**: `/supabase/migrations/20251113_create_rating_recalculation_function.sql`
- **1 Decimal Rounding**: `/supabase/migrations/20251114_round_rating_to_one_decimal.sql`
- **Review API**: `/src/app/api/tasks/[id]/reviews/route.ts`
- **Professional API**: `/src/app/api/professionals/[id]/route.ts`
- **Visibility Logic**: `/src/lib/reviews/visibility-manager.ts`
- **Review Delay**: `/src/lib/utils/review-delay.ts`
- **Recalc Script**: `/scripts/recalculate-professional-ratings.sql`
