# Upgrade Next.js to v16

## Status: 90% Complete

## Task Description
Upgrade from Next.js 15.4.8 to Next.js 16.x to benefit from Turbopack (default bundler), improved performance, and potentially resolve legacy JavaScript polyfill issues.

## Progress

### Completed
- [x] Upgraded `next` from 15.4.8 to **16.1.1**
- [x] Upgraded `eslint` from 8.x to **9.39.2**
- [x] Upgraded `eslint-config-next` from 15.x to **16.1.1**
- [x] Upgraded `next-intl` from 4.6.1 to **4.7.0**
- [x] Fixed NextUI imports in Server Components (7 pages)
- [x] Created `ButtonLink` component for Server Component usage
- [x] Added `.npmrc` with `legacy-peer-deps=true` for Vercel deployment
- [x] Build passes with Turbopack
- [x] TypeScript type-check passes

### Fixed Files (NextUI → Plain HTML/Tailwind)
- `src/app/[lang]/for-customers/page.tsx`
- `src/app/[lang]/for-professionals/page.tsx`
- `src/app/[lang]/faq/page.tsx`
- `src/app/[lang]/terms/page.tsx`
- `src/app/[lang]/privacy/page.tsx`
- `src/app/[lang]/blog/page.tsx`
- `src/app/[lang]/[slug]/page.tsx`

### Pending (Final Stage)

#### 1. Migrate `middleware.ts` → `proxy.ts`
**Status:** Optional for now - middleware.ts still works but is deprecated

**When to migrate:**
- Wait for `next-intl` to officially support `proxy.ts`
- Current middleware handles locale routing + Supabase session refresh

**Migration command:**
```bash
npx @next/codemod@canary middleware-to-proxy .
```

**Key changes:**
- `proxy.ts` uses Node.js runtime (not Edge)
- Auth checks should move to Layout guards or Route Handlers
- `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`

#### 2. Upgrade `next-auth` v4 → v5 (Auth.js)
**Status:** Optional - v4 works with `legacy-peer-deps`

**Current workaround:**
- `.npmrc` with `legacy-peer-deps=true` allows `next-auth@4.24.11` to work with Next.js 16

**When to upgrade:**
- When ready for Auth.js migration (breaking changes in v5)
- v5 natively supports Next.js 16

**Migration guide:**
- https://authjs.dev/getting-started/migrating-to-v5

## Acceptance Criteria
- [x] Node.js version updated to 20.9+ (already >=24.0.0)
- [x] All `params`/`searchParams` access converted to async (already done in v15)
- [x] All `cookies()`/`headers()` calls converted to async (already done in v15)
- [ ] `middleware.ts` migrated to `proxy.ts` (deferred - still works)
- [x] Build passes without errors
- [x] All pages render correctly
- [x] API routes function correctly
- [ ] Upgrade `next-auth` to v5 (deferred - v4 works with legacy-peer-deps)

## Technical Notes
- Turbopack is now default bundler (~9-11s compilation)
- Next.js 16 is stricter about Server/Client component boundaries
- NextUI components cannot be imported in Server Components (use plain HTML or client wrappers)
- `next-auth@4.x` peer dependency warning is safe to ignore with `.npmrc`

## Resources
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Middleware to Proxy Migration](https://nextjs.org/docs/messages/middleware-to-proxy)
- [proxy.ts File Conventions](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)

## Priority
Medium - Core upgrade complete, remaining items are optional improvements
