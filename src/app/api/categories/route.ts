import { NextResponse } from 'next/server'
import { MAIN_CATEGORIES, getAllSubcategories } from '@/features/categories'

// Enable ISR - revalidate every hour
export const revalidate = 3600
export const dynamic = 'force-static'

/**
 * GET /api/categories
 *
 * Returns all categories with their subcategories in a nested structure.
 * This route is statically generated at build time and revalidated every hour.
 *
 * @todo When we have database, replace this with actual DB queries:
 * const categories = await db.query.categories.findMany({ with: { subcategories: true } })
 */
export async function GET() {
  try {
    // Transform our current category structure into API response format
    const categories = MAIN_CATEGORIES.map((mainCategory) => {
      const subcategories = getAllSubcategories().filter(
        (sub) => sub.mainCategoryId === mainCategory.id
      )

      return {
        id: mainCategory.id,
        slug: mainCategory.slug,
        translationKey: mainCategory.translationKey,
        icon: mainCategory.icon,
        subcategories: subcategories.map((sub) => ({
          slug: sub.slug,
          translationKey: sub.translationKey,
          mainCategoryId: sub.mainCategoryId,
        })),
      }
    })

    return NextResponse.json(categories, {
      headers: {
        // CDN-friendly caching headers
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
