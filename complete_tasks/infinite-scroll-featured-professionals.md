# Infinite Scroll + Featured Professionals for Browse Professionals Page

## Task Description
Implement the same infinite scroll and featured professionals system that we have for browse tasks page. This includes smart featured professionals selection, infinite scroll for filtered results, and improved empty state design.

## Requirements

### Backend - Featured Professionals Logic
- [ ] Add `findFeaturedProfessionals()` method to professionals repository
- [ ] Implement quality scoring algorithm:
  - Has profile photo: +3 points
  - Has portfolio images: +2 points
  - Long bio (>150 chars): +2 points
  - Has reviews/ratings: +2 points
  - Verified professional: +3 points
- [ ] Ensure category/specialization diversity (no more than 2 from same category)
- [ ] Limit to top 20 featured professionals
- [ ] Add API endpoint support for `?featured=true` parameter

### Frontend - Infinite Scroll Implementation
- [ ] Replace `useQuery` → `useInfiniteQuery` for filtered professionals
- [ ] Implement Intersection Observer for automatic scroll detection
- [ ] Add loading spinner when fetching more professionals
- [ ] Add "You've reached the end" message when all loaded
- [ ] Remove Previous/Next pagination buttons
- [ ] Cap animation delays for smooth experience with many professionals

### Frontend - Featured Professionals Display Logic
- [ ] **No filters applied**: Show ONLY Featured Professionals (20 curated)
- [ ] **Filters active with results**: Show ONLY filtered results with infinite scroll
- [ ] **Filters active with no results**: Show "no results" + Featured Professionals as fallback

### UI/UX Improvements
- [ ] Update "No Results" section with colorful design:
  - Purple → Pink → Blue gradient background
  - Animated search icon with sparkles
  - Humorous message: "Oops! No professionals here... yet! They're coming from registrations right now, check back soon!"
  - Secondary color button with shadow
- [ ] Ensure smooth animations (cap delays at 1s for large lists)
- [ ] Add helpful subtext guiding users to adjust filters

### Technical Notes
- Use same patterns as browse-tasks implementation:
  - `useInfiniteQuery` with `getNextPageParam`
  - Flatten pages: `data?.pages.flatMap(page => page.professionals)`
  - Intersection observer at 10% visibility threshold
  - Always fetch featured (used for both primary and fallback)
- Maintain existing URL query param sync for filters
- Ensure type safety with full TypeScript support

## Acceptance Criteria
- [ ] Featured professionals fetch 20 high-quality, diverse professionals
- [ ] Infinite scroll triggers automatically when user scrolls to bottom
- [ ] Loading indicator shows when fetching next page
- [ ] "End of list" message displays when all professionals loaded
- [ ] No filters: Show only featured professionals
- [ ] Filters applied: Show filtered results with infinite scroll
- [ ] No results: Show colorful empty state + featured professionals
- [ ] Type-check passes with no errors
- [ ] Animations smooth and performant

## API Changes Needed
```typescript
// GET /api/professionals?featured=true
// Returns: { professionals: [...], pagination: {...} }
// Limit: 20 professionals, scored and diverse

// GET /api/professionals?category=X&page=2
// Supports pagination for infinite scroll
```

## Files to Modify
1. `/src/server/professionals/professional.repository.ts` - Add featured query
2. `/src/server/professionals/professional.service.ts` - Add featured method
3. `/src/app/api/professionals/route.ts` - Add featured endpoint
4. `/src/features/professionals/components/professionals-page.tsx` - Infinite scroll
5. `/src/features/professionals/components/sections/results-section.tsx` - UI updates

## Priority
Medium - Improves UX consistency across browse pages

## Estimated Time
2-3 hours

## Dependencies
None - can be implemented independently

## Notes
- Follow exact same patterns as browse-tasks implementation for consistency
- Reuse animation and styling patterns for cohesive design
- Consider adding more scoring criteria specific to professionals (e.g., completion rate, response time)
