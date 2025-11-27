# Expand Location Support - Bulgarian Cities with 20K+ Population

## Task Description
Expand TaskBridge's location system from 8 hardcoded cities to support all Bulgarian cities with 20,000+ population (approximately 40+ cities), with smart autocomplete using Photon API (free, OSM-based).

## Current State
- **8 cities supported**: Sofia, Plovdiv, Varna, Burgas, Ruse, Stara Zagora, Pleven, Sliven
- **CHECK constraints** in database limiting values
- **Static dropdown** with local search only
- **Missing**: ~30+ cities with 20K+ population (Dobrich, Shumen, Pernik, Yambol, etc.)

## Proposed Solution
Hybrid approach: **User preference** → Local city list → Server cache → Photon API

### Search Priority Order (Fastest to Slowest)
```
1. User's saved location (localStorage + DB)  → Instant (0ms)
2. Local city list (40+ cities)               → Instant (0ms)
3. Server-side cache (Vercel KV)              → Fast (~50ms)
4. Photon API (external)                      → Slower (~200ms)
```

### Why Photon API?
| Criteria | Photon | Google Places | Mapbox | Nominatim |
|----------|--------|---------------|--------|-----------|
| **Cost** | FREE | $2.83/1K (after $200 credit) | $0.75/1K | FREE |
| **Autocomplete** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ BANNED |
| **Rate Limits** | High | High | High | 1/sec |
| **Multilingual** | ✅ BG/EN/RU | ✅ | ✅ | ✅ |
| **Self-hosting** | Optional | No | No | Possible |

---

## Requirements

### Phase 1: Expand Local City Database
- [ ] Add all Bulgarian cities with 20K+ population (~40 cities)
- [ ] Include city data: slug, translationKey, population, latitude, longitude
- [ ] Update translation files (EN/BG/RU) for all new cities
- [ ] Maintain backward compatibility with existing 8 cities

### Phase 2: Database Migration
- [ ] Remove restrictive CHECK constraints from tasks.city and users.city
- [ ] Add latitude/longitude columns for future distance-based features
- [ ] Add `preferred_city` column to users table for cross-device persistence
- [ ] Create migration script with rollback capability
- [ ] Test migration on staging before production

### Phase 3: User Location Preference System
**Goal**: Remember user's location preference for instant suggestions on return visits

**Client-side (localStorage):**
- [ ] Create `useLocationPreference` hook to read/write localStorage
- [ ] Store last selected city: `{ slug: 'burgas', timestamp: 1234567890 }`
- [ ] Auto-suggest saved location as first option in city picker
- [ ] Clear preference if user explicitly selects different city

**Server-side (users table):**
- [ ] Add `preferred_city` field to user profile (nullable)
- [ ] Sync localStorage preference to DB on login (merge strategy: newest wins)
- [ ] Load preference from DB on login to populate localStorage
- [ ] Update preference when user changes city in profile settings

**UX Flow:**
```
┌─────────────────────────────────────────────────────────┐
│  City Selection (user has saved preference: Burgas)     │
├─────────────────────────────────────────────────────────┤
│  ⭐ Your location: Burgas              [Use this]       │
│  ─────────────────────────────────────────────────      │
│  Popular cities:                                        │
│  [Sofia] [Plovdiv] [Varna] [Burgas]                     │
│  ─────────────────────────────────────────────────      │
│  🔍 Search for other cities...                          │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- Zero API calls for returning users
- Instant UX - no waiting for suggestions
- Works offline (localStorage)
- Syncs across devices (when logged in)

### Phase 4: Smart Autocomplete Component
- [ ] Create reusable `<CityAutocomplete>` component
- [ ] Implement 4-tier search: user preference → local cities → cached results → Photon API
- [ ] Add 300ms debounce to reduce API calls
- [ ] Show "Your location" first if user has saved preference
- [ ] Show "Popular cities" chips for quick selection (Sofia, Plovdiv, Varna, Burgas)
- [ ] Handle loading states and API errors gracefully
- [ ] Support keyboard navigation (arrow keys, enter to select)

### Phase 5: Photon API Integration
- [ ] Create `/api/cities/search` endpoint to proxy Photon requests
- [ ] Implement server-side caching with Vercel KV or PostgreSQL
- [ ] Filter results to Bulgaria only (`countrycode=bg`)
- [ ] Parse and normalize Photon response to match local format
- [ ] Add fallback to local search if API fails

### Phase 6: Update All Location Components
**INPUT Components to update:**
- [ ] `src/app/[lang]/create-task/components/location-section.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/city-filter.tsx`
- [ ] `src/features/professionals/components/sections/search-filters-section.tsx`
- [ ] `src/app/[lang]/profile/components/shared/personal-info-section.tsx`

**DISPLAY Components (should work automatically with `getCityLabelBySlug()` updates):**
- [ ] Verify task-card.tsx displays new cities correctly
- [ ] Verify professional-card.tsx fallback works for unknown cities
- [ ] Test all display components with new city data

### Phase 7: Testing & Documentation
- [ ] Test autocomplete with Bulgarian keyboard input (Cyrillic)
- [ ] Test with slow network conditions
- [ ] Test edge cases: special characters, very short queries
- [ ] Update CLAUDE.md with new city system documentation
- [ ] Add JSDoc comments to new components and utilities

---

## Acceptance Criteria
- [ ] Users can select from 40+ Bulgarian cities (all with 20K+ population)
- [ ] Autocomplete shows suggestions as user types (within 500ms)
- [ ] Popular cities (top 8) appear immediately without typing
- [ ] **User's saved location appears first as "Your location" suggestion**
- [ ] **Location preference persists in localStorage (works offline)**
- [ ] **Location preference syncs to users table (works across devices)**
- [ ] Works in all 3 languages (EN/BG/RU)
- [ ] No external API calls for the top 40 cities (local data)
- [ ] **Zero API calls for returning users with saved preference**
- [ ] API errors don't break the UI (graceful fallback)
- [ ] Existing tasks/profiles with 8 original cities still work
- [ ] Mobile-friendly touch interactions

---

## Technical Notes

### Photon API Example
```typescript
// Search for cities in Bulgaria
const response = await fetch(
  `https://photon.komoot.io/api/?q=${query}&limit=10&lang=bg&osm_tag=place:city&osm_tag=place:town`
);

// Response format
{
  "features": [
    {
      "properties": {
        "name": "Бургас",
        "city": "Бургас",
        "state": "Бургас",
        "country": "България",
        "osm_key": "place",
        "osm_value": "city"
      },
      "geometry": {
        "coordinates": [27.4626, 42.5048]
      }
    }
  ]
}
```

### User Location Preference Hook
```typescript
// src/hooks/use-location-preference.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface LocationPreference {
  slug: string;
  timestamp: number;
}

const STORAGE_KEY = 'trudify_location_preference';

export function useLocationPreference() {
  const { user, isAuthenticated } = useAuth();
  const [preference, setPreference] = useState<LocationPreference | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPreference(JSON.parse(stored));
    }
  }, []);

  // Sync with DB when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.preferred_city) {
      const dbPref = { slug: user.preferred_city, timestamp: Date.now() };
      // Merge: use newest preference
      if (!preference || dbPref.timestamp > preference.timestamp) {
        setPreference(dbPref);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPref));
      }
    }
  }, [isAuthenticated, user]);

  const savePreference = async (citySlug: string) => {
    const newPref = { slug: citySlug, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPref));
    setPreference(newPref);

    // Sync to DB if authenticated
    if (isAuthenticated) {
      await updateUserPreferredCity(citySlug);
    }
  };

  return { preference, savePreference };
}
```

### Caching Strategy
```typescript
// Vercel KV caching
import { kv } from '@vercel/kv';

async function getCachedCities(query: string) {
  const cacheKey = `city:search:${query.toLowerCase()}`;

  // Check cache first
  const cached = await kv.get(cacheKey);
  if (cached) return cached;

  // Fetch from Photon
  const results = await fetchPhotonCities(query);

  // Cache for 24 hours
  await kv.set(cacheKey, results, { ex: 86400 });

  return results;
}
```

### City Data Structure (Expanded)
```typescript
interface City {
  slug: string;           // 'burgas'
  translationKey: string; // 'cities.burgas'
  population: number;     // 210000
  latitude: number;       // 42.5048
  longitude: number;      // 27.4626
  oblast: string;         // 'burgas' (province)
}

// Top 40 Bulgarian cities with 20K+ population
export const CITIES: City[] = [
  { slug: 'sofia', translationKey: 'cities.sofia', population: 1295931, latitude: 42.6977, longitude: 23.3219, oblast: 'sofia-city' },
  { slug: 'plovdiv', translationKey: 'cities.plovdiv', population: 343424, latitude: 42.1354, longitude: 24.7453, oblast: 'plovdiv' },
  // ... 38 more cities
];
```

### Files to Create
1. `src/components/ui/city-autocomplete.tsx` - Reusable autocomplete component
2. `src/hooks/use-location-preference.ts` - Hook for localStorage + DB sync
3. `src/app/api/cities/search/route.ts` - Photon proxy with caching
4. `src/features/cities/lib/cities-extended.ts` - Full 40+ city list
5. `supabase/migrations/YYYYMMDD_expand_city_support.sql` - DB migration (includes preferred_city column)

### Files to Modify
1. `src/features/cities/lib/cities.ts` - Expand city list
2. `src/features/cities/lib/helpers.ts` - Update helper functions
3. `src/lib/intl/en/common.ts` - Add city translations
4. `src/lib/intl/bg/common.ts` - Add city translations
5. `src/lib/intl/ru/common.ts` - Add city translations
6. All INPUT components listed above

---

## Priority
**High** - Limiting users from smaller cities reduces market reach significantly

## Estimated Complexity
**Medium-High** - Multiple components, database migration, API integration

---

## References
- [Photon API](https://photon.komoot.io/) - Free geocoding
- [Bulgaria Cities Population](https://worldpopulationreview.com/cities/bulgaria)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)

## Related Files (Current Implementation)
- `src/features/cities/lib/cities.ts:1-60` - Current 8 cities
- `src/features/cities/lib/helpers.ts:1-47` - Helper functions
- `src/app/[lang]/browse-tasks/components/city-filter.tsx:1-127` - Filter UI
- `src/app/[lang]/create-task/components/location-section.tsx:1-143` - Form input
- `supabase/migrations/20251106000000_normalize_city_slugs.sql:1-124` - Current constraints
