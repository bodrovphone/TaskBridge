# Build-Time Category Generation with Next.js

## Task Description

Implement build-time static generation (SSG) for categories using Next.js recommended patterns. This will fetch categories from the database during build time and generate optimized static data, reducing runtime database queries and improving performance.

## Current State

Categories are currently:
- Hardcoded in `/src/features/categories/lib/data.ts`
- Loaded at runtime on every request
- Not connected to database

## Goal State

Categories will be:
- Fetched from database at build time
- Generated as static JSON data
- Served with optimal Next.js caching
- Incrementally regenerated when database changes (ISR)

## Next.js Approach

### Option 1: Static Generation with `generateStaticParams` (Recommended)

For app router, use Next.js 15's recommended pattern:

```typescript
// /src/app/api/categories/route.ts
import { db } from '@/database/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static' // Generate at build time
export const revalidate = 3600 // Revalidate every hour (ISR)

export async function GET() {
  const categories = await db.query.categories.findMany({
    with: {
      subcategories: true
    }
  })

  return NextResponse.json(categories)
}
```

### Option 2: Generate Static JSON during build

```typescript
// scripts/generate-categories.ts
import { db } from '@/database/client'
import fs from 'fs/promises'
import path from 'path'

async function generateCategories() {
  const categories = await db.query.categories.findMany({
    with: {
      subcategories: true
    }
  })

  const outputPath = path.join(process.cwd(), 'public/data/categories.json')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(categories, null, 2))

  console.log('✅ Categories generated successfully')
}

generateCategories().catch(console.error)
```

```json
// package.json
{
  "scripts": {
    "generate:categories": "tsx scripts/generate-categories.ts",
    "build": "npm run generate:categories && next build"
  }
}
```

### Option 3: Server-Side Cache with Data Cache API

```typescript
// /src/lib/data/categories.ts
import { db } from '@/database/client'
import { unstable_cache } from 'next/cache'

export const getCategories = unstable_cache(
  async () => {
    const categories = await db.query.categories.findMany({
      with: {
        subcategories: true
      }
    })
    return categories
  },
  ['categories-list'],
  {
    revalidate: 3600, // 1 hour
    tags: ['categories']
  }
)

// Invalidate cache when categories change
import { revalidateTag } from 'next/cache'
revalidateTag('categories')
```

## Requirements

- [ ] Create database schema for categories and subcategories
- [ ] Set up Drizzle ORM queries for fetching categories
- [ ] Implement build-time generation script or API route
- [ ] Add ISR (Incremental Static Regeneration) with appropriate revalidation time
- [ ] Create React hooks/utilities for consuming static categories
- [ ] Add cache invalidation mechanism for admin updates
- [ ] Update category selection component to use static data
- [ ] Add fallback for development mode (direct DB queries)
- [ ] Document the approach in README

## Acceptance Criteria

- [ ] Categories are fetched from database at build time
- [ ] Static categories are served with optimal caching headers
- [ ] ISR revalidates categories periodically (every 1-4 hours)
- [ ] Manual cache invalidation works for admin updates
- [ ] Build process generates categories before Next.js build
- [ ] No runtime database queries for category data in production
- [ ] Development mode has fast refresh without full rebuilds
- [ ] TypeScript types are generated from database schema

## Technical Implementation

### 1. Database Schema

```typescript
// /src/database/schema.ts
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameBg: text('name_bg').notNull(),
  nameRu: text('name_ru').notNull(),
  descriptionEn: text('description_en'),
  descriptionBg: text('description_bg'),
  descriptionRu: text('description_ru'),
  icon: text('icon'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameBg: text('name_bg').notNull(),
  nameRu: text('name_ru').notNull(),
  icon: text('icon'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

### 2. Client-Side Hook

```typescript
// /src/hooks/use-categories.ts
import useSWR from 'swr'

export function useCategories() {
  const { data, error, isLoading } = useSWR('/api/categories', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000 // 1 hour
  })

  return {
    categories: data,
    isLoading,
    isError: error
  }
}
```

### 3. API Route with ISR

```typescript
// /src/app/api/categories/route.ts
import { db } from '@/database/client'
import { categories, subcategories } from '@/database/schema'
import { eq } from 'drizzle-orm'

export const revalidate = 3600 // ISR: revalidate every hour
export const dynamic = 'force-static'

export async function GET() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .leftJoin(subcategories, eq(categories.id, subcategories.categoryId))
      .orderBy(categories.order, subcategories.order)

    // Transform to nested structure
    const transformed = allCategories.reduce((acc, row) => {
      const category = row.categories
      const subcategory = row.subcategories

      if (!acc[category.id]) {
        acc[category.id] = {
          ...category,
          subcategories: []
        }
      }

      if (subcategory) {
        acc[category.id].subcategories.push(subcategory)
      }

      return acc
    }, {})

    return Response.json(Object.values(transformed), {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
```

## Benefits

### Performance
- **Zero runtime DB queries** for category data
- **Instant page loads** with static data
- **CDN cacheable** responses
- **Reduced database load** significantly

### Developer Experience
- **Type safety** from database schema
- **Fast development** with hot reload
- **Easy updates** via database migrations
- **Simple invalidation** with Next.js cache tags

### Scalability
- **Handles high traffic** without DB strain
- **Global distribution** via CDN
- **Automatic regeneration** with ISR
- **Graceful degradation** with stale-while-revalidate

## Recommended Approach

**Hybrid Solution:**
1. Use **API Route with ISR** (`/api/categories/route.ts`) for serving categories
2. Add **Cache Tags** for manual invalidation when admin updates categories
3. Use **SWR/React Query** on client for optimal data fetching
4. Implement **generateStaticParams** for category pages

This gives us:
- ✅ Build-time generation (ISR)
- ✅ Automatic revalidation
- ✅ Manual cache invalidation
- ✅ Optimal client-side caching
- ✅ CDN-friendly responses

## Migration Path

1. **Phase 1**: Create database schema and seed with current categories
2. **Phase 2**: Implement API route with ISR
3. **Phase 3**: Update components to use new API
4. **Phase 4**: Add cache invalidation for admin
5. **Phase 5**: Remove hardcoded category data

## Configuration

```typescript
// next.config.js
module.exports = {
  experimental: {
    // Enable optimistic client cache
    isrMemoryCacheSize: 50 * 1024 * 1024, // 50MB
  },
}
```

## Testing Strategy

- [ ] Test build-time generation locally
- [ ] Verify ISR revalidation works
- [ ] Test cache invalidation
- [ ] Load test with stale data
- [ ] Verify Vercel deployment caching

## Priority

**Medium-High** - Should be implemented once we have database and before scaling

## Estimated Effort

**Medium** - 1-2 days
- Day 1: Database schema, seed data, API route with ISR
- Day 2: Client hooks, cache invalidation, testing

## References

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Incremental Static Regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)

## Notes

- This approach aligns with Next.js 15 best practices
- ISR provides the perfect balance between static and dynamic
- Can be deployed to Vercel with zero configuration
- Cache warming can be added for critical categories
- Consider adding cache warming on deployment via build hook
