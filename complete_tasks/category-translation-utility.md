# Fix Category Translation Prefix Technical Debt

## Task Description
Currently, we have scattered `skill.startsWith('categories.')` checks across the application to handle category translation. This is technical debt that needs a proper solution.

## Current Problem

**Database Schema:**
- `service_categories` column stores: `['plumbing', 'electrical']` (without prefix)

**Translation Keys:**
- Need format: `'categories.plumbing'`, `'categories.electrical'` (with prefix)

**Current Workaround (in 4+ places):**
```typescript
{t(skill.startsWith('categories.') ? skill : `categories.${skill}`)}
```

**Files with workaround:**
1. `/src/app/[lang]/tasks/[id]/components/sections/applications-section.tsx` (2 places)
2. `/src/components/tasks/application-detail.tsx` (1 place)
3. `/src/components/tasks/application-card.tsx` (2 places)

## Proposed Solutions

### Option 1: Create Utility Function (Quick Fix)
Create a reusable translation helper:

```typescript
// /src/lib/utils/category-translation.ts
export function translateCategory(categoryKey: string, t: (key: string) => string): string {
  const key = categoryKey.startsWith('categories.')
    ? categoryKey
    : `categories.${categoryKey}`;
  return t(key);
}

// Usage:
{translateCategory(skill, t)}
```

**Pros:**
- Quick to implement
- Centralizes the logic
- Easy to update later

**Cons:**
- Still a workaround
- Adds extra function call overhead

### Option 2: Fix at API Level (Proper Solution)
Transform data at the API boundary:

```typescript
// In /src/app/api/tasks/[id]/applications/route.ts
const mappedApplications = applications.map(app => ({
  ...app,
  professional: {
    ...app.professional,
    service_categories: app.professional.service_categories?.map(cat =>
      cat.startsWith('categories.') ? cat : `categories.${cat}`
    )
  }
}));
```

**Pros:**
- Fix once, works everywhere
- Clean component code
- Consistent data format throughout app

**Cons:**
- Need to update all API endpoints that return professionals
- Need to update mock data

### Option 3: Fix at Database Level (Future-Proof)
Store categories with prefix in database:

```sql
-- Migration to add prefix to existing data
UPDATE users
SET service_categories = ARRAY(
  SELECT 'categories.' || unnest(service_categories)
)
WHERE service_categories IS NOT NULL;
```

**Pros:**
- Most future-proof solution
- Single source of truth
- No runtime overhead

**Cons:**
- Requires database migration
- Need to update all insert/update queries
- Risk of breaking existing data

## Requirements

- [ ] Choose solution approach (recommend Option 2 for MVP, Option 3 for production)
- [ ] Implement chosen solution
- [ ] Remove all `startsWith('categories.')` checks from components
- [ ] Update mock data to use consistent format
- [ ] Test in all 3 locales (EN/BG/RU)
- [ ] Document the decision in CLAUDE.md

## Technical Notes

**Affected Data Flow:**
1. Database → API → Frontend (Option 2 or 3)
2. Mock data → Frontend (needs update regardless)

**Components to Clean Up After Fix:**
- ApplicationsSection
- ApplicationCard
- ApplicationDetail
- Any future components showing categories

## Priority
**Medium** - Currently working with workaround, but accumulating technical debt with each new component

## Estimated Effort
- Option 1: 30 minutes
- Option 2: 1-2 hours (all API endpoints)
- Option 3: 2-3 hours (migration + testing)
