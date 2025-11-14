# Review Count Flow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│                                                                  │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │   reviews    │              │    users     │                 │
│  ├──────────────┤              ├──────────────┤                 │
│  │ id           │              │ id           │                 │
│  │ rating       │    TRIGGER   │ total_reviews│◄────┐           │
│  │ comment      │──────────────►│ average_rating    │           │
│  │ published_at │   UPDATES    └──────────────┘     │           │
│  │ is_hidden    │                                   │           │
│  └──────────────┘                                   │           │
│       │                                             │           │
│       │  3 reviews total:                           │           │
│       │  - Review 1: rating=4, published_at=past    │           │
│       │  - Review 2: rating=5, published_at=past    │           │
│       │  - Review 3: rating=5, published_at=future  │           │
│       │                                             │           │
│       │  Trigger calculates:                        │           │
│       │  - Only reviews WHERE published_at <= NOW() │           │
│       │  - COUNT(*) = 2 ────────────────────────────┘           │
│       │  - AVG(rating) = 4.5                                    │
│       │                                                         │
└───────┼─────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API: GET /api/professionals/[id]              │
│                                                                  │
│  Step 1: Fetch Reviews                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ SELECT * FROM reviews                                  │     │
│  │ WHERE reviewee_id = '...'                             │     │
│  │   AND published_at <= NOW()  ◄─── FILTERS HERE        │     │
│  │   AND is_hidden = false                               │     │
│  └────────────────────────────────────────────────────────┘     │
│       │                                                         │
│       │  Returns: 2 reviews (Review 1 & Review 2)              │
│       ▼                                                         │
│                                                                  │
│  Step 2: Transform Reviews                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ transformedReviews = reviews.map(review => ({         │     │
│  │   ...review,                                          │     │
│  │   isVisible: true,  ◄─── HARDCODED (bypasses pattern) │     │
│  │   visibilityReason: 'visible_high_rating'             │     │
│  │ }))                                                    │     │
│  └────────────────────────────────────────────────────────┘     │
│       │                                                         │
│       ▼                                                         │
│                                                                  │
│  Step 3: Return Data                                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ {                                                      │     │
│  │   professional: {                                      │     │
│  │     reviewsCount: 2,  ◄─── From users.total_reviews   │     │
│  │     rating: 4.5,      ◄─── From users.average_rating  │     │
│  │     reviews: [        ◄─── Array of 2 review objects  │     │
│  │       { rating: 4, isVisible: true, ... },            │     │
│  │       { rating: 5, isVisible: true, ... }             │     │
│  │     ]                                                  │     │
│  │   }                                                    │     │
│  │ }                                                      │     │
│  └────────────────────────────────────────────────────────┘     │
│       │                                                         │
└───────┼─────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  professional-detail-page-content.tsx                    │   │
│  │                                                          │   │
│  │  transformedProfessional = {                            │   │
│  │    reviewCount: professional.reviewsCount,  // = 2      │   │
│  │    reviews: professional.reviews,           // 2 items  │   │
│  │  }                                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ├──────────────────┬─────────────────────────────────┐    │
│       ▼                  ▼                                 ▼    │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │   HEADER    │  │  REVIEWS    │                              │
│  │   SECTION   │  │  SECTION    │                              │
│  └─────────────┘  └─────────────┘                              │
│       │                  │                                      │
│       │                  │                                      │
│       ▼                  ▼                                      │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ professional-header.tsx                             │        │
│  │                                                     │        │
│  │ Display: professional.reviewCount                  │        │
│  │          ↓                                          │        │
│  │      Shows: 2 reviews ✅                            │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ reviews-section.tsx                                 │        │
│  │                                                     │        │
│  │ Step 1: Map reviews with visibility                │        │
│  │ ┌─────────────────────────────────────────────┐     │        │
│  │ │ reviewsWithVisibility = reviews.map(r => ({ │     │        │
│  │ │   ...r,                                     │     │        │
│  │ │   isVisible: r.isVisible ?? true  ◄─── Already true from API│
│  │ │ }))                                         │     │        │
│  │ └─────────────────────────────────────────────┘     │        │
│  │                                                     │        │
│  │ Step 2: Filter visible reviews                     │        │
│  │ ┌─────────────────────────────────────────────┐     │        │
│  │ │ visibleReviews = getVisibleReviews(         │     │        │
│  │ │   reviewsWithVisibility                     │     │        │
│  │ │ )                                           │     │        │
│  │ │ // Returns all 2 reviews (all isVisible)    │     │        │
│  │ └─────────────────────────────────────────────┘     │        │
│  │                                                     │        │
│  │ Display: visibleReviews.length                     │        │
│  │          ↓                                          │        │
│  │      Shows: 2 reviews ✅                            │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                         RESULT                                   │
│                                                                  │
│  Both sections show: 2 reviews ✅                                │
│                                                                  │
│  Why? Because:                                                   │
│  1. Database trigger counts only published reviews (2)           │
│  2. API fetches only published reviews (2)                       │
│  3. API marks all as isVisible: true                             │
│  4. ReviewsSection filters but all are visible (2)               │
│                                                                  │
│  The 3rd review (unpublished) is never fetched from database.    │
└──────────────────────────────────────────────────────────────────┘
```

## Key Insight

**The counts match because both paths filter the same way:**

1. **ProfessionalHeader path**: `users.total_reviews` (counted by trigger with `published_at <= NOW()`)
2. **ReviewsSection path**: API query with `.lte('published_at', NOW())` → same filter

**Pattern detection is currently bypassed** because API hardcodes `isVisible: true`.

This is actually **fine for production** - it keeps things simple and both counts stay in sync.

If you want pattern detection (hiding single negative reviews), you'd need to:
- Remove `isVisible: true` from API
- Let ReviewsSection calculate visibility
- **BUT** then the counts would diverge (Header shows all published, Section shows only visible)
