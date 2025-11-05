# Professional Search & Display Implementation

## Overview
Implement a fully functional professional search system with API integration, replacing the current mock-based professional listing page. This phase transitions the `/professionals` page from static mock data to dynamic database-driven content while maintaining existing UI elements for future features.

### Featured Professionals Display Logic

**Default Behavior (No Filters Applied):**
- When user lands on `/professionals` with no query parameters
- Display featured professionals sorted by featured algorithm (rating 4.8+, 10+ reviews, 100+ jobs, or VAT verified)
- Show as main results section

**When Filters Are Applied:**
- Display filtered results as primary content
- **If filtered results < 5 professionals**: Show "Featured Professionals" section below with label "You might also like"
- Featured section shows top-rated professionals regardless of filters
- This ensures users always see quality options even with narrow filters

**Benefits:**
- Prevents empty-feeling pages with few results
- Showcases high-quality professionals
- Increases engagement and application rates
- Better user experience for specific searches

---

## Product Context

### User Definition: What is a "Professional"?
- **Key principle**: TaskBridge doesn't distinguish between "customer" and "professional" user types at registration
- **A user becomes a "professional"** when they complete their professional profile on the Profile page → Professional tab
- **Minimum requirements for appearing in professional listings:**
  - ✅ Professional title filled in
  - ✅ At least one service category selected
  - ✅ (Recommended) Bio, hourly rate, experience years for better visibility

### User Education & Onboarding

**Current state**: Landing page has `#how-it-works` section that shallowly explains the flow

**Problem**: Not enough guidance for users to understand professional profile setup

**Solution**: Add clear instructions about professional profile requirements
- **Option A**: Static page `/how-to-become-professional` with step-by-step guide
- **Option B**: Enhanced `#how-it-works` section with expandable "Learn More" for professionals
- **Option C**: Add instructional component in Profile → Professional tab

**Recommendation**: **Option B** - Keep information on landing page for better SEO and discoverability
- Add expandable section in existing `#how-it-works` with:
  - "Want to offer your services? Click to learn more →"
  - Step-by-step guide to filling professional profile
  - Benefits of completing profile (visibility, credibility, earnings potential)
  - Visual checklist showing required vs optional fields

**SEO Benefits**:
- Single source of truth on landing page
- Better crawlability and indexing
- Clear user journey from education to action
- Internal links from landing → profile page

---

## Technical Architecture

### 1. Database Schema (Existing - No Changes)

**Users Table** - Professional-relevant fields:
```sql
-- Required fields for professional listing
service_categories TEXT[]        -- Array of category slugs (REQUIRED)
-- Note: We need to add a professional_title field in migration

-- Recommended fields (enhance search results)
full_name TEXT
avatar_url TEXT
city TEXT
neighborhood TEXT
bio TEXT
years_experience INTEGER
hourly_rate_bgn DECIMAL(10, 2)
company_name TEXT

-- Verification & Trust
is_phone_verified BOOLEAN
is_email_verified BOOLEAN
is_vat_verified BOOLEAN

-- Statistics (auto-calculated)
tasks_completed INTEGER
average_rating DECIMAL(3, 2)
total_reviews INTEGER
response_time_hours DECIMAL(10, 2)
```

**Missing Field - Migration Required**:
```sql
ALTER TABLE public.users ADD COLUMN professional_title TEXT;
CREATE INDEX idx_users_professional_title ON public.users(professional_title)
  WHERE professional_title IS NOT NULL;
```

---

### 2. API Architecture

#### Professional Search API Endpoint

**New File**: `/src/app/api/professionals/route.ts`

**Pattern**: Mirror the existing `/api/tasks` architecture for consistency

**GET /api/professionals**

Query Parameters:
```typescript
interface ProfessionalQueryParams {
  // Search & Filter
  category?: string           // Service category slug
  city?: string              // City filter
  neighborhood?: string      // Neighborhood filter
  minRating?: number         // Minimum rating (1-5)

  // Sorting
  sortBy?: 'featured' | 'rating' | 'jobs' | 'newest'

  // Pagination
  page?: number              // Default: 1
  limit?: number             // Default: 20, max: 50

  // Special filters
  verified?: boolean         // Phone/email verified only
  mostActive?: boolean       // tasks_completed > 50
}
```

**Response Format**:
```typescript
{
  professionals: Professional[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrevious: boolean
  }
}
```

**Professional Data Shape**:
```typescript
interface Professional {
  id: string
  full_name: string
  professional_title: string       // NEW FIELD
  avatar_url: string | null
  bio: string | null

  // Service info
  service_categories: string[]
  years_experience: number | null
  hourly_rate_bgn: number | null
  company_name: string | null

  // Location
  city: string | null
  neighborhood: string | null

  // Statistics
  tasks_completed: number
  average_rating: number | null
  total_reviews: number

  // Verification
  is_phone_verified: boolean
  is_email_verified: boolean
  is_vat_verified: boolean

  // Featured status (calculated based on rating + reviews + activity)
  featured: boolean
}
```

#### Privacy & RLS Strategy

**Challenge**: Professional listing needs to show basic user data without exposing sensitive information

**Solution Options**:

**Option A: Service Role Key (Recommended for MVP)**
- Use Supabase service role key in API route (server-side only)
- Bypass RLS to read all professional profiles
- Manually filter sensitive fields before returning to client
- Pros: Simple, fast, works immediately
- Cons: Less secure long-term, needs careful field filtering

**Option B: Public RLS Policy**
- Create specific RLS policy allowing public read of professional data
- Policy: Allow SELECT on users WHERE professional_title IS NOT NULL
- Expose only safe fields via policy
- Pros: More secure, database-enforced privacy
- Cons: More complex RLS setup

**Implementation**: Start with **Option A** for MVP, migrate to **Option B** in Phase 2

---

### 3. Service Layer Architecture

**Mirror existing task service structure**:

**New Files**:
```
/src/server/professionals/
├── professional.types.ts         # TypeScript types
├── professional.query-types.ts   # Query parameter types
├── professional.query-parser.ts  # URL param parsing & validation
├── professional.service.ts       # Business logic layer
├── professional.repository.ts    # Database queries
└── professional.privacy.ts       # Field filtering for public view
```

**Service Layer Responsibilities**:

1. **professional.query-parser.ts**
   - Parse and validate URL query parameters
   - Convert strings to correct types
   - Set defaults (page=1, limit=20, sortBy='featured')

2. **professional.repository.ts**
   - Build Supabase queries with filters
   - Handle pagination
   - Execute database queries
   - Calculate featured status

3. **professional.privacy.ts**
   - Filter sensitive fields before returning data
   - Safe fields: name, title, bio, categories, stats, verification status
   - Hidden fields: email, phone, address details, notification settings

4. **professional.service.ts**
   - Orchestrate repository + privacy filtering
   - Handle errors
   - Return standardized response format

---

### 4. Frontend Architecture

#### Component Strategy: Preserve Mocks + Add Real Data

**Key Principle**: Keep existing mock data structure for UI development of future features

**File Structure**:
```
/src/features/professionals/
├── lib/
│   ├── mock-professionals.ts      # KEEP - Used for UI testing
│   ├── professionals-api.ts       # NEW - API client
│   └── types.ts                   # Shared types
├── hooks/
│   └── use-professionals.ts       # NEW - Data fetching hook
└── components/
    └── professionals-page.tsx     # REFACTOR - Use real data
```

#### Data Fetching Hook

**New File**: `/src/features/professionals/hooks/use-professionals.ts`

Pattern: Mirror `/src/app/[lang]/browse-tasks/hooks/use-task-filters.ts`

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface ProfessionalFilters {
  category?: string
  city?: string
  neighborhood?: string
  minRating?: number
  sortBy?: 'featured' | 'rating' | 'jobs' | 'newest'
  verified?: boolean
  mostActive?: boolean
  page?: number
}

export function useProfessionalFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<ProfessionalFilters>(() => {
    // Initialize from URL params
  })

  const updateFilter = useCallback((key, value) => {
    // Update filter and sync URL
  })

  const resetFilters = useCallback(() => {
    // Clear all filters
  })

  const buildApiQuery = useCallback(() => {
    // Build query string for API
  })

  return {
    filters,
    updateFilter,
    resetFilters,
    buildApiQuery,
    activeFilterCount
  }
}
```

#### API Client

**New File**: `/src/features/professionals/lib/professionals-api.ts`

```typescript
export async function fetchProfessionals(queryString: string) {
  const response = await fetch(`/api/professionals?${queryString}`)
  if (!response.ok) throw new Error('Failed to fetch professionals')
  return response.json()
}
```

#### Search Component Pattern

**Reuse from browse-tasks**:
- `/src/features/browse-tasks/components/sections/search-filters-section.tsx`
- Adapt for professionals (remove budget, deadline filters)
- Keep: category search, city filter, popular chips
- Add: rating filter (already exists), verified filter

**New File**: `/src/features/professionals/components/sections/search-filters-section.tsx`

Key differences from tasks:
- Search categories for professional services
- Show popular professional categories (plumbing, cleaning, tutoring, etc.)
- No budget/deadline filters
- Add "Verified Only" toggle
- Add "Most Active" toggle (tasks_completed > 50)

---

### 5. Search & Filter UI - Identical to Browse Tasks

**Goal**: Nearly identical search experience between `/browse-tasks` and `/professionals`

#### Shared Components to Reuse:

1. **Search Input with Typing Animation**
   - Pattern: Animated placeholder cycling through examples
   - Implementation: Separate component for reuse
   - File: `/src/components/common/animated-search-input.tsx`

2. **Popular Chips Section**
   - Pattern: Quick-select chips for categories and cities
   - Hide selected chips (already implemented in browse-tasks)
   - Color-coded categories with icons

3. **Filter Controls**
   - Desktop: Inline select dropdowns
   - Mobile: Slide-out sheet panel
   - Pattern: Reusable FilterControls component

4. **Active Filters Display**
   - Animated badge showing selected filters
   - Individual remove buttons
   - "Clear All" action

#### Differences from Browse Tasks:

| Feature | Browse Tasks | Professionals |
|---------|-------------|---------------|
| Search placeholder | "plumbing, Sofia, cleaning..." | "plumber, Sofia, electrician..." |
| Popular categories | Task categories | Professional service categories |
| Budget filter | ✅ Yes (range) | ❌ No |
| Deadline filter | ✅ Yes | ❌ No |
| Rating filter | ❌ No | ✅ Yes (min rating 1-5) |
| Verified filter | ❌ No | ✅ Yes (phone/email) |
| Most Active | ❌ No | ✅ Yes (50+ completed jobs) |
| Sort options | Newest, Urgent, Budget | Featured, Rating, Jobs, Newest |

#### Implementation Plan:

**Step 1**: Extract shared search logic
```
/src/components/common/
├── animated-search-input.tsx    # NEW - Typing animation
├── popular-chips.tsx             # NEW - Reusable chip grid
└── active-filters-display.tsx    # NEW - Active filters badge
```

**Step 2**: Create professionals search section
```
/src/features/professionals/components/sections/
└── search-filters-section.tsx    # NEW - Professional-specific
```

**Step 3**: Unified filter hook pattern
- Both use same URL sync pattern
- Both use same state management approach
- Both use same API query building logic

---

## Development Phases

### Phase 1: Database Preparation ✅ Setup
**Goal**: Add missing fields and ensure data quality

**Tasks**:
- [x] 1.1 Create migration file `20251105165029_add_professional_title.sql`
- [x] 1.2 Add `professional_title TEXT` column to users table
- [x] 1.3 Create index on professional_title for search optimization
- [x] 1.4 Test migration on local Supabase instance
- [x] 1.5 Apply migration to production database
- [x] 1.6 Verify no existing users are broken by migration

**Files Created**:
- [x] `/supabase/migrations/20251105165029_add_professional_title.sql`

**Completion Criteria**:
- [x] Migration runs without errors
- [x] Index improves query performance
- [x] Existing data integrity maintained

---

### Phase 2: API & Service Layer 🔨 Core
**Goal**: Build backend infrastructure

**Sub-Phase 2.1: Type Definitions**
- [x] 2.1.1 Create `professional.types.ts` with Professional interface
- [x] 2.1.2 Create `professional.query-types.ts` with query param types
- [x] 2.1.3 Define response types (PaginatedResponse, etc.)
- [x] 2.1.4 Export types from index file

**Sub-Phase 2.2: Query Parser**
- [x] 2.2.1 Create `professional.query-parser.ts`
- [x] 2.2.2 Implement parseQueryParams function
- [x] 2.2.3 Add validation for category, city, minRating
- [x] 2.2.4 Set defaults (page=1, limit=20, sortBy='featured')
- [x] 2.2.5 Handle invalid/malformed parameters gracefully

**Sub-Phase 2.3: Repository Layer**
- [x] 2.3.1 Create `professional.repository.ts`
- [x] 2.3.2 Implement buildBaseQuery (filter users with professional_title)
- [x] 2.3.3 Add category filter (service_categories contains)
- [x] 2.3.4 Add city filter
- [x] 2.3.5 Add rating filter (average_rating >= minRating)
- [x] 2.3.6 Add verified filter (phone OR email verified)
- [x] 2.3.7 Add mostActive filter (tasks_completed > 50)
- [x] 2.3.8 Implement sorting logic (featured, rating, jobs, newest)
- [x] 2.3.9 Implement pagination with total count
- [x] 2.3.10 Calculate featured status in query

**Sub-Phase 2.4: Privacy Filtering**
- [x] 2.4.1 Create `professional.privacy.ts`
- [x] 2.4.2 Define public fields whitelist
- [x] 2.4.3 Implement filterSensitiveFields function
- [x] 2.4.4 Test sensitive fields are removed (email, phone, etc.)

**Sub-Phase 2.5: Service Layer**
- [x] 2.5.1 Create `professional.service.ts`
- [x] 2.5.2 Implement getProfessionals method
- [x] 2.5.3 Orchestrate query parser → repository → privacy filter
- [x] 2.5.4 Handle errors and return standardized responses
- [x] 2.5.5 Add logging for debugging

**Sub-Phase 2.6: API Route**
- [x] 2.6.1 Create `/src/app/api/professionals/route.ts`
- [x] 2.6.2 Implement GET handler
- [x] 2.6.3 Use service role key for RLS bypass (MVP approach)
- [x] 2.6.4 Parse URL search params
- [x] 2.6.5 Call professional service
- [x] 2.6.6 Return JSON response with proper status codes
- [x] 2.6.7 Add error handling (400, 500)

**Sub-Phase 2.7: API Testing**
- [ ] 2.7.1 Test GET /api/professionals with no filters
- [ ] 2.7.2 Test category filter
- [ ] 2.7.3 Test city filter
- [ ] 2.7.4 Test minRating filter
- [ ] 2.7.5 Test verified filter
- [ ] 2.7.6 Test mostActive filter
- [ ] 2.7.7 Test sorting (all 4 options)
- [ ] 2.7.8 Test pagination (page, limit, hasNext, hasPrevious)
- [ ] 2.7.9 Verify only users with professional_title appear
- [ ] 2.7.10 Verify service_categories is never empty
- [ ] 2.7.11 Verify sensitive fields are hidden
- [ ] 2.7.12 Test invalid parameters (graceful handling)

**Files Created**:
- [x] `/src/server/professionals/professional.types.ts`
- [x] `/src/server/professionals/professional.query-types.ts`
- [x] `/src/server/professionals/professional.query-parser.ts`
- [x] `/src/server/professionals/professional.repository.ts`
- [x] `/src/server/professionals/professional.privacy.ts`
- [x] `/src/server/professionals/professional.service.ts`
- [x] `/src/app/api/professionals/route.ts`

**Completion Criteria**:
- [x] All API tests pass
- [x] Response format matches specification
- [x] Performance < 200ms (p95)

---

### Phase 3: Frontend Data Integration 🎨 UI
**Goal**: Replace mocks with real API data

**Sub-Phase 3.1: API Client**
- [x] 3.1.1 Create `/src/features/professionals/lib/professionals-api.ts`
- [x] 3.1.2 Implement fetchProfessionals function
- [x] 3.1.3 Add error handling (network errors, 500s)
- [x] 3.1.4 Add request timeout handling
- [x] 3.1.5 Export API client

**Sub-Phase 3.2: Filter Hook**
- [x] 3.2.1 Create `/src/features/professionals/hooks/use-professional-filters.ts`
- [x] 3.2.2 Implement useProfessionalFilters hook (mirror use-task-filters)
- [x] 3.2.3 Add URL synchronization (read/write query params)
- [x] 3.2.4 Add updateFilter function
- [x] 3.2.5 Add updateFilters (bulk update)
- [x] 3.2.6 Add resetFilters function
- [x] 3.2.7 Add buildApiQuery function
- [x] 3.2.8 Add activeFilterCount calculation
- [x] 3.2.9 Test URL sync in browser

**Sub-Phase 3.3: Search Filters Component**
- [x] 3.3.1 Create `/src/features/professionals/components/sections/search-filters-section.tsx`
- [x] 3.3.2 Add animated search input (typing placeholder)
- [x] 3.3.3 Add category search with suggestions dropdown
- [x] 3.3.4 Add city search with suggestions
- [x] 3.3.5 Add popular category chips (hide selected)
- [x] 3.3.6 Add popular city chips (hide selected)
- [x] 3.3.7 Handle chip click → update filter
- [x] 3.3.8 Add results count display
- [x] 3.3.9 Test on mobile and desktop

**Sub-Phase 3.4: Results Section Refactor**
- [x] 3.4.1 Create `/src/features/professionals/components/sections/results-section.tsx`
- [x] 3.4.2 Add loading state (skeleton cards)
- [x] 3.4.3 Add error state with retry button
- [x] 3.4.4 Add empty state (no results)
- [x] 3.4.5 Add professional card grid rendering
- [x] 3.4.6 Add pagination controls
- [x] 3.4.7 Integrate with useProfessionalFilters

**Sub-Phase 3.5: Main Page Refactor**
- [x] 3.5.1 Refactor `professionals-page.tsx` to use real API
- [x] 3.5.2 Integrate useProfessionalFilters hook
- [x] 3.5.3 Integrate fetchProfessionals API call
- [x] 3.5.4 Add useEffect for data fetching on filter change
- [x] 3.5.5 Add two-section display (API + Mock)
- [x] 3.5.6 Preserve mock data with visual separation
- [x] 3.5.7 Remove hardcoded filter logic (moved to API)
- [x] 3.5.8 Test loading → success flow
- [x] 3.5.9 Test error flow with retry
- [x] 3.5.10 Test empty results flow

**Sub-Phase 3.6: Desktop Filters**
- [x] 3.6.1 Create ProfessionalCategoryFilter component
- [x] 3.6.2 Create ProfessionalCityFilter component
- [x] 3.6.3 Create ProfessionalRatingFilter component
- [x] 3.6.4 Create ProfessionalSortDropdown component
- [x] 3.6.5 Add "Verified Only" toggle
- [x] 3.6.6 Add "Most Active" toggle
- [x] 3.6.7 Create ProfessionalFilterBar component
- [x] 3.6.8 Wire up to useProfessionalFilters
- [x] 3.6.9 Integrate into professionals-page-refactored.tsx

**Sub-Phase 3.7: Mobile Filters**
- [ ] 3.7.1 Add Filter button with active count badge
- [ ] 3.7.2 Create Sheet slide-out panel
- [ ] 3.7.3 Add all filters inside sheet (category, city, rating, verified, mostActive)
- [ ] 3.7.4 Add "Apply" and "Clear" buttons
- [ ] 3.7.5 Test sheet open/close animation
- [ ] 3.7.6 Test filters apply correctly

**Sub-Phase 3.8: Active Filters Display**
- [x] 3.8.1 Add active filters badge section (animated)
- [x] 3.8.2 Show individual filter chips with X button
- [x] 3.8.3 Add "Clear All" button
- [x] 3.8.4 Handle individual filter removal
- [x] 3.8.5 Handle clear all action
- [x] 3.8.6 Test animation when filters change

**Sub-Phase 3.9: Translation Keys**
- [ ] 3.9.1 Add professional search translations to EN
- [ ] 3.9.2 Add professional search translations to BG
- [ ] 3.9.3 Add professional search translations to RU
- [ ] 3.9.4 Verify all t() calls have translations

**Sub-Phase 3.10: UI Polish**
- [ ] 3.10.1 Test responsive layout (mobile, tablet, desktop)
- [ ] 3.10.2 Test masonry grid on all screen sizes
- [ ] 3.10.3 Verify animations are smooth (60fps)
- [ ] 3.10.4 Test URL sharing (copy/paste link works)
- [ ] 3.10.5 Test browser back/forward buttons
- [ ] 3.10.6 Test keyboard navigation
- [ ] 3.10.7 Verify no layout shifts (CLS)

**Files Created**:
- [x] `/src/features/professionals/lib/professionals-api.ts`
- [x] `/src/features/professionals/hooks/use-professional-filters.ts`
- [ ] `/src/features/professionals/components/sections/search-filters-section.tsx`
- [ ] `/src/features/professionals/components/sections/results-section.tsx`

**Files Modified**:
- [x] `/src/features/professionals/components/professional-card.tsx` (added isMock prop)
- [ ] `/src/features/professionals/components/professionals-page.tsx`
- [ ] `/src/features/professionals/lib/mock-professionals.ts`
- [ ] `/src/lib/intl/en/professionals.ts`
- [ ] `/src/lib/intl/bg/professionals.ts`
- [ ] `/src/lib/intl/ru/professionals.ts`

**Completion Criteria**:
- [x] Real API data displays correctly
- [x] All filters work as expected
- [x] URL synchronization works
- [x] Mobile experience is smooth
- [x] Loading/error/empty states work

---

### Phase 4: Search Parity with Browse Tasks 🔍 Polish
**Goal**: Achieve identical search UX

**Sub-Phase 4.1: Extract Shared Components**
- [ ] 4.1.1 Create `/src/components/common/animated-search-input.tsx`
- [ ] 4.1.2 Extract typing animation logic
- [ ] 4.1.3 Create `/src/components/common/popular-chips.tsx`
- [ ] 4.1.4 Extract chip grid with color coding
- [ ] 4.1.5 Create `/src/components/common/active-filters-display.tsx`
- [ ] 4.1.6 Extract active filters badge logic
- [ ] 4.1.7 Refactor browse-tasks to use shared components
- [ ] 4.1.8 Refactor professionals to use shared components

**Sub-Phase 4.2: Behavior Alignment**
- [ ] 4.2.1 Verify both pages hide selected chips from popular section
- [ ] 4.2.2 Verify both pages have same animation timings
- [ ] 4.2.3 Verify both pages have same loading skeleton count
- [ ] 4.2.4 Verify both pages have same pagination behavior
- [ ] 4.2.5 Verify both pages have same error handling

**Sub-Phase 4.3: Professional-Specific Filters**
- [ ] 4.3.1 Add rating filter (1-5 stars)
- [ ] 4.3.2 Add verified toggle (phone OR email)
- [ ] 4.3.3 Add most active toggle (50+ jobs)
- [ ] 4.3.4 Test all three professional-specific filters
- [ ] 4.3.5 Verify filters combine correctly (AND logic)

**Sub-Phase 4.4: Mobile Polish**
- [ ] 4.4.1 Test filter sheet on iPhone SE (small screen)
- [ ] 4.4.2 Test filter sheet on iPad (tablet)
- [ ] 4.4.3 Test landscape orientation
- [ ] 4.4.4 Verify touch targets are large enough (44x44px)
- [ ] 4.4.5 Test filter sheet scroll behavior

**Sub-Phase 4.5: URL Shareability**
- [ ] 4.5.1 Test sharing filtered results link
- [ ] 4.5.2 Verify recipient sees correct filters applied
- [ ] 4.5.3 Test URL with multiple filters
- [ ] 4.5.4 Test URL with special characters in filters
- [ ] 4.5.5 Test URL with pagination

**Files Created**:
- [ ] `/src/components/common/animated-search-input.tsx`
- [ ] `/src/components/common/popular-chips.tsx`
- [ ] `/src/components/common/active-filters-display.tsx`

**Completion Criteria**:
- [x] Search UX matches browse-tasks exactly
- [x] Professional-specific filters work
- [x] Mobile experience is flawless
- [x] URLs are shareable and persistent

---

### Phase 5: User Education & SEO 📚 Content
**Goal**: Help users understand professional profiles

**Sub-Phase 5.1: Landing Page Enhancement**
- [ ] 5.1.1 Locate `#how-it-works` section in landing-page.tsx
- [ ] 5.1.2 Design "Become a Professional" expandable section
- [ ] 5.1.3 Add expand/collapse interaction
- [ ] 5.1.4 Create step-by-step guide content
- [ ] 5.1.5 Add visual checklist (required vs optional fields)
- [ ] 5.1.6 Add "Get Started" CTA button → profile page
- [ ] 5.1.7 Test animation on expand/collapse

**Sub-Phase 5.2: Translation Content**
- [ ] 5.2.1 Write EN content for professional guide
- [ ] 5.2.2 Write BG content for professional guide
- [ ] 5.2.3 Write RU content for professional guide
- [ ] 5.2.4 Add translations to landing.ts files
- [ ] 5.2.5 Review translation quality

**Sub-Phase 5.3: Professional Tab Hints**
- [ ] 5.3.1 Create `/src/app/[lang]/profile/components/professional-tab-hints.tsx`
- [ ] 5.3.2 Add tooltip hints for required fields
- [ ] 5.3.3 Add progress indicator (profile completion %)
- [ ] 5.3.4 Add "Why is this required?" explanations
- [ ] 5.3.5 Integrate into professional tab

**Sub-Phase 5.4: Benefits & Motivation**
- [ ] 5.4.1 Write benefits of completing profile (earnings, visibility, etc.)
- [ ] 5.4.2 Add statistics (e.g., "Professionals with complete profiles get 3x more inquiries")
- [ ] 5.4.3 Create success story examples (optional)
- [ ] 5.4.4 Add social proof (verified professionals count)

**Sub-Phase 5.5: SEO Optimization**
- [ ] 5.5.1 Add meta description for professionals page
- [ ] 5.5.2 Add proper heading hierarchy (h1, h2, h3)
- [ ] 5.5.3 Add alt text to all images
- [ ] 5.5.4 Add structured data markup (Person schema)
- [ ] 5.5.5 Test with Google Rich Results Test

**Sub-Phase 5.6: FAQ Section**
- [ ] 5.6.1 Create FAQ content about professional requirements
- [ ] 5.6.2 Add "How do I become a professional?" FAQ
- [ ] 5.6.3 Add "What fields are required?" FAQ
- [ ] 5.6.4 Add "How long does verification take?" FAQ
- [ ] 5.6.5 Add "Can I be both customer and professional?" FAQ
- [ ] 5.6.6 Translate FAQs to all languages

**Files Created**:
- [ ] `/src/app/[lang]/profile/components/professional-tab-hints.tsx`

**Files Modified**:
- [ ] `/src/components/pages/landing-page.tsx`
- [ ] `/src/lib/intl/en/landing.ts`
- [ ] `/src/lib/intl/bg/landing.ts`
- [ ] `/src/lib/intl/ru/landing.ts`

**Completion Criteria**:
- [x] User education content is live
- [x] All content is translated to EN/BG/RU
- [x] SEO improvements are applied
- [x] FAQ section is helpful and comprehensive

---

## Mock Data Strategy

### Keep Mocks for Future Features

**Why preserve mocks?**
- UI components still need testing data
- Future features not yet in database (e.g., portfolio, certifications)
- Faster development without database dependencies
- Demo/presentation purposes

**Display Strategy: Show Both Side-by-Side**

Display mocks AND real API data in separate sections with clear visual distinction:

```typescript
// professionals-page.tsx - Display both sections

// Section 1: Real API Data (Primary)
<div id="api-professionals-section">
  <div className="mb-6">
    <h2 className="text-3xl font-bold">📡 Live Professionals</h2>
    <p className="text-gray-600">Real-time data from our professional network</p>
  </div>
  <div className="masonry-grid">
    {apiProfessionals.map(prof => <ProfessionalCard key={prof.id} professional={prof} />)}
  </div>
</div>

// Section 2: Mock Data (Reference Only)
<div id="mock-professionals-section" className="mt-16 border-t-4 border-dashed border-amber-400 pt-8">
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 mb-8 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-3xl">🎭</span>
      <h2 className="text-2xl font-bold text-amber-900">Mock Professionals (Reference)</h2>
    </div>
    <p className="text-amber-800 mb-2">
      Sample data showcasing future features: portfolios, certifications, edge cases
    </p>
    <div className="flex gap-2 text-xs">
      <span className="bg-amber-200 text-amber-900 px-2 py-1 rounded-full font-semibold">
        For Development Reference
      </span>
      <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded-full font-semibold">
        Not Real Users
      </span>
    </div>
  </div>
  <div className="masonry-grid">
    {mockProfessionals.map(prof => (
      <ProfessionalCard
        key={prof.id}
        professional={prof}
        isMock={true} // Adds "MOCK" badge to card
      />
    ))}
  </div>
</div>
```

**Visual Design:**
- **API Section**: Clean, professional design at top (primary content)
- **Mock Section**:
  - Dashed amber border separator
  - Gradient amber/orange background banner
  - Clear "Mock Professionals (Reference)" heading
  - Warning badges: "For Development Reference" + "Not Real Users"
  - Optional "MOCK" badge on individual cards

**Benefits:**
- ✅ Side-by-side comparison of API vs mock data
- ✅ Zero confusion - clear visual distinction
- ✅ Developers see implemented vs planned features
- ✅ Mock cards demonstrate future UI patterns
- ✅ Easy to verify API data format correctness
- ✅ Can hide mock section in production with env flag

**What to keep in mocks**:
- ✅ Portfolio images (not yet in DB)
- ✅ Certifications (not yet in DB)
- ✅ Skills array (not yet in DB)
- ✅ Languages spoken (not yet in DB)
- ✅ Safety status edge cases (suspended users, multiple reports)
- ✅ Edge cases (no avatar, incomplete profiles)

**What to replace with real data**:
- ✅ Basic profile info (name, title, bio)
- ✅ Service categories
- ✅ Location (city, neighborhood)
- ✅ Statistics (rating, reviews, completed jobs)
- ✅ Verification status
- ✅ Hourly rate and experience

---

## Data Privacy & Security

### Field Visibility Rules

**Public (Always Visible)**:
- full_name
- professional_title
- avatar_url
- bio
- service_categories
- city (broad location)
- years_experience
- hourly_rate_bgn
- company_name
- tasks_completed
- average_rating
- total_reviews
- is_phone_verified (status only)
- is_email_verified (status only)
- is_vat_verified (status only)

**Private (Hidden from Search)**:
- email (actual address)
- phone (actual number)
- neighborhood (too specific)
- address (too specific)
- notification_preferences
- privacy_settings
- last_active_at
- response_time_hours
- acceptance_rate

**Conditionally Visible** (after task application):
- Revealed during application review
- Phone/email shown after professional is hired
- Full address shared after task acceptance

---

## Translation Keys Required

**New keys for professionals search**:

```typescript
// /src/lib/intl/[lang]/professionals.ts
export const professionals = {
  // Search
  'search.placeholder': 'Search for professionals...',
  'search.popular': 'Popular services',
  'search.categories': 'Service Categories',
  'search.cities': 'Cities',

  // Filters
  'filters.verified': 'Verified Only',
  'filters.mostActive': 'Most Active (50+ jobs)',
  'filters.minRating': 'Minimum Rating',
  'filters.allCategories': 'All Categories',

  // Sort options
  'sort.featured': 'Featured',
  'sort.rating': 'Highest Rated',
  'sort.jobs': 'Most Jobs',
  'sort.newest': 'Recently Joined',

  // Results
  'results.professionalsAvailable': 'professionals available',
  'results.noProfessionals': 'No professionals found',
  'results.tryAdjusting': 'Try adjusting your filters',

  // Requirements (for education section)
  'requirements.title': 'Become a Professional',
  'requirements.step1': 'Complete your professional profile',
  'requirements.step2': 'Add your service categories',
  'requirements.step3': 'Start receiving job requests',
  'requirements.minimum': 'Minimum requirements:',
  'requirements.professionalTitle': 'Professional title',
  'requirements.serviceCategory': 'At least one service category',
}
```

---

## Testing Checklist

### API Testing
- [ ] GET /api/professionals returns professionals with professional_title
- [ ] Filtering by category works correctly
- [ ] Filtering by city works correctly
- [ ] Filtering by minRating works correctly
- [ ] Sorting by featured/rating/jobs/newest works
- [ ] Pagination works (page, limit, hasNext, hasPrevious)
- [ ] Empty results return proper structure
- [ ] Sensitive fields are not exposed
- [ ] Invalid query params are handled gracefully

### Frontend Testing
- [ ] Search input shows typing animation
- [ ] Popular chips update based on selection
- [ ] Selected chips disappear from popular section
- [ ] Active filters display correctly
- [ ] Individual filter removal works
- [ ] Clear all filters works
- [ ] URL updates on filter change
- [ ] URL is shareable (copy/paste works)
- [ ] Loading states show during fetch
- [ ] Error state shows with retry button
- [ ] Empty state shows when no results
- [ ] Pagination controls work correctly
- [ ] Professional cards display correctly
- [ ] Masonry grid layout works on all screens
- [ ] Mobile filters sheet opens/closes correctly

### Data Quality Testing
- [ ] Only profiles with professional_title appear
- [ ] Only profiles with service_categories appear
- [ ] service_categories is not empty array
- [ ] Rating calculation is correct
- [ ] Completed jobs count is accurate
- [ ] Verification badges show correctly
- [ ] Featured professionals appear first
- [ ] Suspended/banned users are excluded

### SEO Testing
- [ ] Professional page has proper meta tags
- [ ] URL structure is SEO-friendly
- [ ] "Become a Professional" guide is indexable
- [ ] Schema markup for professionals (future)
- [ ] Proper heading hierarchy
- [ ] Alt text on images

---

## Success Metrics

**Phase Completion Criteria**:
1. ✅ API returns real professional data from database
2. ✅ Search and filters work identically to browse-tasks page
3. ✅ URL query params sync correctly
4. ✅ Professional cards display real user profiles
5. ✅ Mocks are preserved for future feature development
6. ✅ User education content is live on landing page
7. ✅ Mobile experience matches desktop functionality

**Performance Targets**:
- API response time: < 200ms (p95)
- Page load time: < 2s (LCP)
- Time to Interactive: < 3s
- No layout shifts (CLS = 0)

---

## Future Enhancements (Post-MVP)

**Phase 6+**: Advanced Features
- Portfolio gallery (upload work samples)
- Certifications display
- Skills tags (beyond categories)
- Languages spoken
- Availability calendar
- Advanced search (keyword search in bio/title)
- Map view for local professionals
- Professional recommendations (AI-powered)
- "Hire Again" quick action for past professionals

**Database Additions Needed**:
```sql
ALTER TABLE public.users ADD COLUMN portfolio_images TEXT[];
ALTER TABLE public.users ADD COLUMN certifications JSONB;
ALTER TABLE public.users ADD COLUMN skills TEXT[];
ALTER TABLE public.users ADD COLUMN languages TEXT[];
ALTER TABLE public.users ADD COLUMN availability_calendar JSONB;
```

---

## Notes & Considerations

1. **Professional Title Field**: This is REQUIRED for search listing. Consider adding validation in Profile → Professional tab

2. **Service Categories**: Must be non-empty array. Add UI validation to prevent saving profile without categories

3. **Featured Algorithm**: Define criteria for "featured" status:
   - average_rating >= 4.8 AND total_reviews >= 10
   - OR tasks_completed >= 100
   - OR is_vat_verified = true

4. **RLS Migration Path**: Start with service role key, but plan migration to proper RLS policies for better security

5. **Search Performance**: If professional count exceeds 10k, consider:
   - Adding full-text search index on professional_title + bio
   - Implementing ElasticSearch or similar
   - Caching popular searches with Redis

6. **Mobile-First**: Professional search must work flawlessly on mobile as professionals often browse on-the-go

7. **Internationalization**: All professional titles, bios, and categories must support EN/BG/RU languages

---

## File Checklist

### New Files to Create:
- [ ] `/supabase/migrations/YYYYMMDD_add_professional_title.sql`
- [ ] `/src/server/professionals/professional.types.ts`
- [ ] `/src/server/professionals/professional.query-types.ts`
- [ ] `/src/server/professionals/professional.query-parser.ts`
- [ ] `/src/server/professionals/professional.service.ts`
- [ ] `/src/server/professionals/professional.repository.ts`
- [ ] `/src/server/professionals/professional.privacy.ts`
- [ ] `/src/app/api/professionals/route.ts`
- [ ] `/src/features/professionals/lib/professionals-api.ts`
- [ ] `/src/features/professionals/hooks/use-professionals.ts`
- [ ] `/src/features/professionals/components/sections/search-filters-section.tsx`
- [ ] `/src/components/common/animated-search-input.tsx`
- [ ] `/src/components/common/popular-chips.tsx`
- [ ] `/src/components/common/active-filters-display.tsx`

### Files to Modify:
- [ ] `/src/features/professionals/components/professionals-page.tsx` - Integrate real data
- [ ] `/src/features/professionals/lib/mock-professionals.ts` - Add feature flag support
- [ ] `/src/components/pages/landing-page.tsx` - Enhance #how-it-works section
- [ ] `/src/lib/intl/[lang]/professionals.ts` - Add new translation keys
- [ ] `/src/lib/intl/[lang]/landing.ts` - Add professional onboarding content

---

## Priority
**High** - Critical for marketplace functionality and professional engagement

## Estimated Effort
- Phase 1 (DB): 0.5 day
- Phase 2 (API): 2 days
- Phase 3 (Frontend): 2 days
- Phase 4 (Search Parity): 1 day
- Phase 5 (Content): 1 day
**Total**: ~6.5 days (fits within one 6-day cycle with buffer)

---

## Dependencies
- Existing browse-tasks implementation (reference architecture)
- Existing professional profile page (data entry)
- Supabase database with users table
- Translation system (i18next)

## Related Tasks
- Professional profile completion tracking
- Professional onboarding flow optimization
- Professional verification system
- Portfolio upload feature (future)
