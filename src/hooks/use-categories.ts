import { useState, useEffect } from 'react'

export interface Subcategory {
  slug: string
  translationKey: string
  icon?: string
  mainCategoryId: string
}

export interface Category {
  id: string
  slug: string
  translationKey: string
  icon?: string
  subcategories: Subcategory[]
}

interface UseCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook for fetching categories from the build-time generated API.
 *
 * This hook fetches categories that are:
 * - Generated at build time (ISR)
 * - Cached for 1 hour
 * - CDN-friendly
 *
 * @returns Categories data, loading state, and error state
 *
 * @example
 * const { categories, isLoading, error } = useCategories()
 *
 * if (isLoading) return <Spinner />
 * if (error) return <Error message={error.message} />
 *
 * return <CategoryList categories={categories} />
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/categories', {
        // Cache on client side for 1 hour
        next: { revalidate: 3600 }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`)
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  }
}

/**
 * Get all subcategories from a category list
 */
export function getAllSubcategoriesFromAPI(categories: Category[]): Subcategory[] {
  return categories.flatMap((cat) => cat.subcategories)
}

/**
 * Get subcategories for a specific main category
 */
export function getSubcategoriesByMainCategoryFromAPI(
  categories: Category[],
  mainCategoryId: string
): Subcategory[] {
  const category = categories.find((cat) => cat.id === mainCategoryId)
  return category?.subcategories || []
}

/**
 * Get main category for a subcategory slug
 */
export function getMainCategoryForSubcategoryFromAPI(
  categories: Category[],
  subcategorySlug: string
): Category | null {
  return (
    categories.find((cat) =>
      cat.subcategories.some((sub) => sub.slug === subcategorySlug)
    ) || null
  )
}
