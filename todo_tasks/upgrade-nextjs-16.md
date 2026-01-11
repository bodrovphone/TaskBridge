# Upgrade Next.js to v16

## Task Description
Upgrade from Next.js 15.4.8 to Next.js 16.x to benefit from Turbopack (default bundler), improved performance, and potentially resolve legacy JavaScript polyfill issues.

## Requirements
- Upgrade Next.js to latest v16
- Migrate all breaking changes
- Verify build and runtime functionality
- Test all pages and API routes

## Breaking Changes to Address

### 1. Node.js Version
- Requires Node.js 20.9+ (v18 no longer supported)
- Update `.nvmrc` or engine requirements if needed

### 2. Async Dynamic APIs
All dynamic APIs must now be awaited:
```typescript
// Before (v15)
const { id } = params;
const query = searchParams.get('q');

// After (v16)
const { id } = await params;
const query = (await searchParams).get('q');
```

Files to update:
- All `page.tsx` files using `params` or `searchParams`
- All `layout.tsx` files using `params`
- All route handlers using these APIs

### 3. Async Request APIs
```typescript
// Before
const cookieStore = cookies();
const headersList = headers();

// After
const cookieStore = await cookies();
const headersList = await headers();
```

### 4. Middleware Migration
- `middleware.ts` deprecated, replaced by `proxy.ts`
- Review current middleware and migrate logic

### 5. Parallel Routes
- All parallel route slots require explicit `default.js` files
- Audit `/app` directory for parallel routes

### 6. Image Component Defaults
- `minimumCacheTTL`: 60s → 4 hours
- `dangerouslyAllowLocalIP`: now blocks by default
- Review `next.config.js` image settings

## Acceptance Criteria
- [ ] Node.js version updated to 20.9+
- [ ] All `params`/`searchParams` access converted to async
- [ ] All `cookies()`/`headers()` calls converted to async
- [ ] `middleware.ts` migrated to `proxy.ts`
- [ ] Parallel routes have `default.js` files
- [ ] Build passes without errors
- [ ] All pages render correctly
- [ ] API routes function correctly
- [ ] Lighthouse scores maintained or improved
- [ ] Legacy JavaScript polyfill warnings resolved

## Technical Notes
- Turbopack becomes default bundler (2-5x faster builds)
- May resolve the 11.5 KiB polyfill issue from `next/dist/build/polyfills/polyfill-module.js`
- Consider enabling `turbopackFileSystemCacheForDev` for faster dev restarts
- New caching APIs available (`updateTag`, `refresh`)

## Resources
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Supported Browsers](https://nextjs.org/docs/architecture/supported-browsers)

## Priority
Medium - Performance improvement, not blocking current functionality

## Estimated Effort
4-6 hours (depending on codebase size and number of affected files)
