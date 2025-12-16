# Category Search Edge Caching

## Task Description
Implement caching for category/subcategory matching on the task creation form to improve performance and reduce client-side computation.

## Current State
- Keywords stored in `category-keywords.ts` (~30KB, ~700 keywords)
- Lazy-loaded via dynamic import on client
- Search runs client-side with `searchCategoriesAsync()`
- Uses `useDeferredValue` to keep UI responsive

## Proposed Solution

### Hybrid Approach: Precompute + Edge API

**1. Precompute Common Searches (Build Time)**
- Generate static JSON with top 100-200 common Bulgarian task phrases
- Include phrases in EN/BG/RU for all languages
- Load this cache client-side for instant lookup
- Examples: "plumber", "electrician", "водопроводчик", "почистване", "ремонт"

**2. Edge API Route (Cache Misses)**
- Create `/api/categories/search?q=...&lang=...`
- Use Vercel Edge Functions for low latency
- Cache responses at edge with `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- Popular searches get cached globally

### Implementation Files

```
/scripts/generate-category-cache.ts    # Build script for common searches
/public/data/category-cache.json       # Precomputed common matches
/app/api/categories/search/route.ts    # Edge API for cache misses
/features/categories/lib/cached-search.ts  # Client hook with cache lookup
```

### Alternative Options (For Reference)

- **Next.js `unstable_cache`**: Server component caching
- **Vercel KV**: Low-latency global key-value store (~$0.30/100K reads)
- **Client-side only**: Keep current approach, rely on browser caching

## Requirements
- [ ] Create build script to generate common search cache
- [ ] Create Edge API route for category search
- [ ] Update client hook to check local cache first, fallback to API
- [ ] Add cache invalidation strategy (rebuild on keyword updates)
- [ ] Measure performance improvement

## Technical Notes
- Edge Functions have 30s timeout, 1MB response limit
- Vercel CDN caches based on URL + headers
- Consider cache key: `${query.toLowerCase()}:${lang}`
- Precomputed cache should include partial matches

## Priority
Low - Current implementation works well with `useDeferredValue`

## Estimated Complexity
Medium - Multiple components involved
