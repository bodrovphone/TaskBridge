# Expand Location Support - Photon API + Smart Suggestions

## Status: DEFERRED (For Future Multi-Country Expansion)

**Decision Date:** 2024-11-28
**Reason:** Over-engineering for current MVP. Expanded to 40 Bulgarian cities with local search instead. Photon API integration saved for Serbia/Romania expansion.

---

## Progress Made (November 2024)

### Completed Implementation (Ready to Re-enable)

The following code was implemented and tested but REVERTED in favor of simpler 40-city approach:

#### 1. Photon API Endpoint (`/src/app/api/cities/search/route.ts`)
- Proxy to Photon API with Bulgaria filter
- Returns Bulgarian names by default (no `lang` param needed)
- Generates consistent slugs via transliteration (Cyrillic → Latin)
- Caches responses for 1 hour

#### 2. Transliteration Utility (`/src/lib/utils/transliterate.ts`)
- Bulgarian/Russian/Ukrainian Cyrillic → Latin conversion
- Ensures "Бургас" → "burgas", "Варна" → "varna" consistently
- Used for generating URL-safe slugs from any Cyrillic input

#### 3. CityAutocomplete Component (`/src/components/ui/city-autocomplete.tsx`)
- Smart suggestions on focus (last searched, profile city, popular)
- Debounced Photon API search (300ms)
- Keyboard navigation support
- Falls back to local search on API error

#### 4. useSearchLocationPreference Hook (`/src/hooks/use-search-location-preference.ts`)
- Persists last searched city in localStorage
- Key: `trudify_search_location`
- Shows as suggestion if different from profile city

#### 5. Database Schema Changes (Migration Ready)
- `city_label` column for storing Bulgarian display names
- Removes CHECK constraints on city columns
- Backwards compatible with existing data

---

## Key Technical Learnings

### Photon API Behavior
```
- Photon only supports: lang=en, de, fr, default (NOT Bulgarian!)
- Without lang param: Returns Bulgarian names by default (Cyrillic)
- With lang=en: Returns English names, but Cyrillic search still works
- osm_id: Consistent identifier across languages (useful for future)
```

### Slug Generation Strategy
```
Option A: Use Photon's osm_id → Requires translation table
Option B: Transliterate names → "Бургас" → "burgas" (CHOSEN)
Option C: Store exact Photon names → Inconsistent across languages
```

### Data Consistency Solution
```
1. Call Photon (no lang) → User sees "Варна" in dropdown
2. User selects → Get { name: "Варна", osm_id: 123 }
3. Transliterate: "Варна" → "varna" (slug)
4. Store: city="varna", city_label="Варна"
5. Display: Use city_label for unknown cities, i18n for known
```

---

## Files Created/Modified (To Re-enable Later)

### Created:
- `src/lib/utils/transliterate.ts` - Cyrillic → Latin transliteration
- `src/app/api/cities/search/route.ts` - Photon proxy endpoint
- `src/hooks/use-search-location-preference.ts` - localStorage hook
- `src/components/ui/city-autocomplete.tsx` - Autocomplete component
- `supabase/migrations/20251128_remove_city_check_constraints.sql` - Migration

### Modified (city_label support - REVERTED):
- `src/server/tasks/task.types.ts` - Added city_label to types
- `src/app/[lang]/create-task/lib/validation.ts` - Added city_label field
- `src/app/[lang]/create-task/components/location-section.tsx` - Captures city_label
- `src/features/cities/lib/helpers.ts` - getCityLabelBySlug with fallback
- `src/components/ui/task-card.tsx` - Display with city_label
- `src/components/ui/posted-task-card.tsx` - Display with city_label
- `src/app/[lang]/tasks/[id]/components/task-detail-content.tsx` - Display with city_label

---

## When to Re-enable This

### Triggers for Implementation:
1. **Serbia expansion** - Need cities like Belgrade, Novi Sad, Nis
2. **Romania expansion** - Need Bucharest, Cluj, Timisoara
3. **User complaints** - "My city isn't listed" reaching significant volume
4. **Seasonal locations** - Sunny Beach, Bansko ski resort demand

### Quick Re-enable Steps:
1. Restore `city_label` to task types (see git history)
2. Run the migration to add `city_label` columns
3. Update migration to REMOVE CHECK constraints instead of expanding them
4. Re-integrate Photon API calls in autocomplete components
5. Test transliteration with Serbian/Romanian Cyrillic

---

## Original Task Description

Replace hardcoded city dropdowns with smart autocomplete using Photon API (free, OSM-based), supporting any city in Bulgaria (and future expansion to Europe).

### Current State (Before Deferral)
- **8 cities hardcoded**: Sofia, Plovdiv, Varna, Burgas, Ruse, Stara Zagora, Pleven, Sliven
- **CHECK constraints** in database limiting values
- **Static dropdown** with local search only

### Solution: Photon-First with Local Fallback

```
User opens city picker
    ↓
1. Show suggestions (no typing needed):
   - Last searched: Varna (localStorage, if different from profile)
   - Your city: Sofia (from profile)
   - Popular: [Plovdiv] [Burgas] [Ruse] [Stara Zagora]
    ↓
2. User starts typing → Photon API (debounced 300ms)
    ↓
3. API fails? → Fall back to local cities
```

### Why Photon API?
| Criteria | Photon | Google Places | Mapbox |
|----------|--------|---------------|--------|
| **Cost** | FREE | $2.83/1K | $0.75/1K |
| **Multilingual** | Partial (BG default) | Full | Full |
| **Rate Limits** | High | High | High |
| **Self-hosting** | Optional | No | No |

**Benefits:**
- No need to maintain translations for unlimited cities
- Supports seasonal locations (Sunny Beach, ski resorts)
- Future-proof for Serbia, Romania, Europe expansion
- Free forever

---

## Technical Implementation Details

### Photon API Example
```typescript
// Search for cities
const response = await fetch(
  `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&osm_tag=place:city&osm_tag=place:town`
);

// Response format (Bulgarian names by default)
{
  "features": [
    {
      "properties": {
        "name": "Бургас",        // Bulgarian name
        "countrycode": "bg",
        "osm_key": "place",
        "osm_value": "city"
      },
      "geometry": {
        "coordinates": [27.4626, 42.5048]  // [lng, lat]
      }
    }
  ]
}
```

### Transliteration Function
```typescript
// src/lib/utils/transliterate.ts
const CYRILLIC_TO_LATIN: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L',
  // ... full mapping
};

export function generateCitySlug(name: string): string {
  return transliterate(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### Database Schema (For Future)
```sql
-- Migration: Remove city CHECK constraints and add city_label
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_city_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_city_check;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS city_label VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city_label VARCHAR(255);

COMMENT ON COLUMN tasks.city IS 'City slug (transliterated to Latin)';
COMMENT ON COLUMN tasks.city_label IS 'Bulgarian display name for unknown cities';
```

---

## References
- [Photon API](https://photon.komoot.io/) - Free geocoding
- [Photon GitHub](https://github.com/komoot/photon) - Documentation
- Git history: Search for "city_label" commits from November 2024

---

## Priority
**Low** - Deferred until multi-country expansion needed

## Original Estimated Effort
**Medium** - 2-3 days (mostly done, just needs re-enabling)
