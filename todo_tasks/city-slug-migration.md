# City Slug Migration - Locale-Independent Location System

## Problem Statement

**Current Issue:**
- Database stores city as free-form `TEXT` (e.g., "Burgas", "София", "Plovdiv")
- UI filters use slugs (e.g., `burgas`, `sofia`, `plovdiv`)
- Query mismatch: `?city=burgas` can't find tasks with `city='Burgas'` in database
- Data inconsistency: Tasks created in different locales may store different city names

**Example Bug:**
```
URL: /en/browse-tasks?city=burgas
Database: city = 'Burgas' (capitalized)
Result: No tasks found ❌
```

## Solution: Option 1 - Store City Slugs

**Approach:**
- Migrate database to store slugs (`burgas`, `sofia`, etc.) instead of labels
- Locale-independent, consistent filtering
- Display still uses translations for user-facing labels

**Benefits:**
- ✅ Works identically in EN/BG/RU
- ✅ Clean URL structure matches database values
- ✅ Simple exact-match queries
- ✅ Easy to add new cities
- ✅ Future-proof for map picker integration

---

## Supported Cities (MVP - Top 8)

| Slug | English | Bulgarian | Russian | Population |
|------|---------|-----------|---------|------------|
| `sofia` | Sofia | София | София | 1,200,000 |
| `plovdiv` | Plovdiv | Пловдив | Пловдив | 340,000 |
| `varna` | Varna | Варна | Варна | 330,000 |
| `burgas` | Burgas | Бургас | Бургас | 200,000 |
| `ruse` | Ruse | Русе | Русе | 150,000 |
| `stara-zagora` | Stara Zagora | Стара Загора | Стара Загора | 140,000 |
| `pleven` | Pleven | Плевен | Плевен | 120,000 |
| `sliven` | Sliven | Сливен | Сливен | 90,000 |

---

## Implementation Tasks

### ✅ Phase 1: Infrastructure Setup (COMPLETED)

- [x] Update `/src/features/cities/lib/cities.ts` to include 8 cities
- [x] Add translations for `pleven` and `sliven` to EN/BG/RU
- [x] Validate translation consistency (all locales have same keys)
- [x] Update PRD.md Section 3.6 with Location Management System documentation

### Phase 2: Database Migration

**Current Schema:**
```sql
-- Tasks table
city TEXT NOT NULL,  -- Currently stores: "Burgas", "София", "Plovdiv", etc.

-- Users table
city TEXT,           -- Currently stores: "Burgas", "София", "Plovdiv", etc.
```

**Migration Steps:**

#### 2.1 Audit Existing Data
```sql
-- Check unique city values in tasks
SELECT DISTINCT city, COUNT(*)
FROM tasks
WHERE city IS NOT NULL
GROUP BY city
ORDER BY COUNT(*) DESC;

-- Check unique city values in users
SELECT DISTINCT city, COUNT(*)
FROM users
WHERE city IS NOT NULL
GROUP BY city
ORDER BY COUNT(*) DESC;
```

#### 2.2 Create Migration Script
Create: `/supabase/migrations/[timestamp]_normalize_city_slugs.sql`

```sql
-- Normalize tasks.city to slugs
UPDATE tasks SET city = 'sofia'
WHERE LOWER(city) IN ('sofia', 'софия', 'sofia, bulgaria');

UPDATE tasks SET city = 'plovdiv'
WHERE LOWER(city) IN ('plovdiv', 'пловдив');

UPDATE tasks SET city = 'varna'
WHERE LOWER(city) IN ('varna', 'варна');

UPDATE tasks SET city = 'burgas'
WHERE LOWER(city) IN ('burgas', 'бургас', 'bourgas');

UPDATE tasks SET city = 'ruse'
WHERE LOWER(city) IN ('ruse', 'русе', 'rousse');

UPDATE tasks SET city = 'stara-zagora'
WHERE LOWER(city) IN ('stara zagora', 'стара загора', 'stara-zagora');

UPDATE tasks SET city = 'pleven'
WHERE LOWER(city) IN ('pleven', 'плевен');

UPDATE tasks SET city = 'sliven'
WHERE LOWER(city) IN ('sliven', 'сливен');

-- Normalize users.city to slugs (same pattern)
UPDATE users SET city = 'sofia'
WHERE LOWER(city) IN ('sofia', 'софия', 'sofia, bulgaria');

UPDATE users SET city = 'plovdiv'
WHERE LOWER(city) IN ('plovdiv', 'пловдив');

-- ... repeat for all cities

-- Add CHECK constraint to prevent invalid values
ALTER TABLE tasks
ADD CONSTRAINT tasks_city_valid
CHECK (city IN ('sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven'));

ALTER TABLE users
ADD CONSTRAINT users_city_valid
CHECK (city IS NULL OR city IN ('sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven'));
```

#### 2.3 Verify Migration
```sql
-- Verify all tasks have valid slugs
SELECT city, COUNT(*)
FROM tasks
GROUP BY city;

-- Check for any tasks with invalid city values (should be 0)
SELECT * FROM tasks
WHERE city NOT IN ('sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven');
```

**Checklist:**
- [ ] Create audit script to check existing city values
- [ ] Run audit on production database (read-only)
- [ ] Create migration SQL with proper LOWER() matching
- [ ] Test migration on staging database
- [ ] Backup production database before migration
- [ ] Run migration on production
- [ ] Verify all city values are slugs
- [ ] Add CHECK constraints to prevent invalid values

---

### Phase 3: Frontend Updates

#### 3.1 Task Creation Form
**File:** `/src/app/[lang]/create-task/page.tsx` or components

**Current:** Free text input or mixed behavior
**Target:** Dropdown selection only (no free text)

**Changes:**
- [ ] Replace any text input with city dropdown component
- [ ] Use `getCitiesWithLabels(t)` for options
- [ ] Store slug value (not label) in form state
- [ ] Validate city is from allowed list before submission

**Component Example:**
```typescript
import { getCitiesWithLabels } from '@/features/cities'

const cities = getCitiesWithLabels(t) // Sorted by population
// Returns: [
//   { slug: 'sofia', label: 'София' },
//   { slug: 'plovdiv', label: 'Пловдив' },
//   ...
// ]

<Select
  value={citySlug}
  onChange={(slug) => setCitySlug(slug)}
  options={cities}
/>
```

#### 3.2 Professional Profile Form
**File:** `/src/app/[lang]/profile/` or professional profile edit components

**Changes:**
- [ ] Replace any text input with city dropdown
- [ ] Use same pattern as task creation
- [ ] Store slug value in profile

#### 3.3 Browse Tasks Filter
**File:** `/src/app/[lang]/browse-tasks/components/city-filter.tsx`

**Status:** ✅ **Already correct!** (uses `getCitiesWithLabels` and stores slugs)

**Verify:**
- [x] Filter displays translated labels
- [x] Filter stores slug values in URL (`?city=burgas`)
- [x] Query sends slug to API

#### 3.4 Browse Professionals Filter
**File:** `/src/features/professionals/components/filters/` (reuses `CityFilter` from browse-tasks)

**Status:** ✅ **Already correct!** (reuses browse-tasks `CityFilter` component)

**Verify:**
- [x] Filter displays translated labels
- [x] Filter stores slug values in URL
- [x] Query sends slug to API

---

### Phase 4: Backend Updates

#### 4.1 Task Repository Query
**File:** `/src/server/tasks/task.repository.ts:243-245`

**Current:**
```typescript
if (options.filters.city) {
  query = query.eq('city', options.filters.city)
}
```

**Status:** ✅ **Already correct!** (exact match on city field)

**After migration, this will work because:**
- Database stores: `burgas`
- URL query: `?city=burgas`
- API receives: `city=burgas`
- Query: `WHERE city = 'burgas'` ✅ Match!

#### 4.2 Professional Repository Query
**File:** `/src/server/professionals/professional.repository.ts`

**Check similar pattern exists:**
- [ ] Verify city filter uses `eq('city', params.city)`
- [ ] No special casing or ILIKE needed (exact slug match)

#### 4.3 API Validation
**Files:** Any API routes that accept city parameter

**Add validation:**
```typescript
import { getCityBySlug } from '@/features/cities'

// In API route handler
const city = searchParams.get('city')
if (city && !getCityBySlug(city)) {
  return NextResponse.json(
    { error: 'Invalid city' },
    { status: 400 }
  )
}
```

**Checklist:**
- [ ] Add city validation to browse-tasks API
- [ ] Add city validation to browse-professionals API
- [ ] Add city validation to create-task API
- [ ] Add city validation to profile update API

---

### Phase 5: Testing

#### 5.1 Functional Testing
- [ ] Create task with each city → Verify slug stored in database
- [ ] Update professional profile with city → Verify slug stored
- [ ] Browse tasks by city (each locale) → Verify correct results
- [ ] Browse professionals by city (each locale) → Verify correct results
- [ ] URL sharing: Copy `?city=burgas` link → Share to friend → Should work

#### 5.2 Locale Testing
**Test Matrix:** Each city × Each locale (8 cities × 3 locales = 24 tests)

| City | EN | BG | RU |
|------|----|----|-----|
| sofia | ✅ Sofia | ✅ София | ✅ София |
| plovdiv | ✅ Plovdiv | ✅ Пловдив | ✅ Пловдив |
| varna | ✅ Varna | ✅ Варна | ✅ Варна |
| burgas | ✅ Burgas | ✅ Бургас | ✅ Бургас |
| ruse | ✅ Ruse | ✅ Русе | ✅ Русе |
| stara-zagora | ✅ Stara Zagora | ✅ Стара Загора | ✅ Стара Загора |
| pleven | ✅ Pleven | ✅ Плевен | ✅ Плевен |
| sliven | ✅ Sliven | ✅ Сливен | ✅ Сливен |

**Test Steps per City:**
1. Switch to locale (EN/BG/RU)
2. Open browse-tasks page
3. Select city from dropdown → Verify correct translated label shown
4. Apply filter → Verify URL contains slug: `?city=burgas`
5. Verify results show tasks from that city
6. Share URL with friend → They should see same results

#### 5.3 Edge Cases
- [ ] Task with no city (old data) → Handle gracefully
- [ ] Invalid city in URL (`?city=invalidcity`) → Show validation error
- [ ] Switching locale with city filter active → Filter persists correctly

---

## Acceptance Criteria

### Must Have (MVP)
- ✅ All 8 cities defined with slugs and translations
- [ ] Database migration completed (all city values are slugs)
- [ ] Task creation uses dropdown (no free text)
- [ ] Professional profile uses dropdown
- [ ] Browse filters work with slugs in all 3 locales
- [ ] URL sharing works: `?city=burgas` shows correct results
- [ ] Database constraints prevent invalid city values

### Should Have
- [ ] API validation rejects invalid city values
- [ ] TypeScript type for CitySlug union
- [ ] Error messages when invalid city provided

### Nice to Have (Post-MVP)
- [ ] Migration script logs all transformed values
- [ ] Admin tool to view city distribution stats
- [ ] Support for multiple cities in professional service_areas

---

## Rollback Plan

If migration causes issues:

```sql
-- Rollback: Remove CHECK constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_city_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_city_valid;

-- Restore from backup (if needed)
-- pg_restore ...
```

**Prevention:**
1. Test migration on staging first
2. Backup production before migration
3. Run migration during low-traffic hours
4. Monitor error logs after deployment

---

## Timeline Estimate

- **Phase 1 (Infrastructure):** ✅ DONE (1 hour)
- **Phase 2 (Database Migration):** 2-3 hours
  - Audit: 30 min
  - Write migration: 1 hour
  - Test on staging: 1 hour
  - Run on production: 30 min
- **Phase 3 (Frontend Updates):** 3-4 hours
  - Task creation form: 1 hour
  - Professional profile: 1 hour
  - Verify filters: 1 hour
  - Testing: 1 hour
- **Phase 4 (Backend Updates):** 2 hours
  - API validation: 1 hour
  - Testing: 1 hour
- **Phase 5 (Testing):** 2-3 hours
  - Functional testing: 1 hour
  - Locale testing: 1 hour
  - Edge cases: 1 hour

**Total:** 10-13 hours

---

## Notes

- Start with Phase 2 (Database Migration) - most critical
- Frontend already mostly correct (filters work)
- Focus on task creation and profile forms
- Add validation to prevent future issues
- Document all city mappings for future additions

## Priority

**High** - Critical for filtering functionality to work correctly

## Status

**In Progress** - Infrastructure ready, migration needed
