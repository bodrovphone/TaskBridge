'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { TaskSortOption } from '@/server/tasks/task.query-types'

/**
 * Task filter state
 */
export interface TaskFilters {
  q?: string              // Full-text search query
  category?: string
  city?: string
  budgetMin?: number
  budgetMax?: number
  urgency?: 'same_day' | 'within_week' | 'flexible'
  sortBy?: TaskSortOption
  page?: number
}

/**
 * Hook for managing task filters with URL synchronization
 */
export function useTaskFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize filters from URL
  const [filters, setFilters] = useState<TaskFilters>(() => {
    return {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      budgetMin: searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined,
      budgetMax: searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined,
      urgency: (searchParams.get('urgency') as any) || undefined,
      sortBy: (searchParams.get('sortBy') as TaskSortOption) || 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    }
  })

  // Sync filters with URL changes
  useEffect(() => {
    const newFilters: TaskFilters = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      budgetMin: searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined,
      budgetMax: searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined,
      urgency: (searchParams.get('urgency') as any) || undefined,
      sortBy: (searchParams.get('sortBy') as TaskSortOption) || 'newest',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    }
    setFilters(newFilters)
  }, [searchParams])

  /**
   * Update a single filter and sync with URL
   */
  const updateFilter = useCallback((key: keyof TaskFilters, value: any, skipUrlUpdate = false) => {
    const newFilters = { ...filters, [key]: value }

    // Reset to page 1 when filters change (except when changing page)
    if (key !== 'page') {
      newFilters.page = 1
    }

    setFilters(newFilters)

    // Skip URL update if debouncing (e.g., for search)
    if (skipUrlUpdate) return

    // Build URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v))
      }
    })

    // Update URL - use replace to avoid scroll issues
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [filters, pathname, router])

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback((updates: Partial<TaskFilters>) => {
    const newFilters = { ...filters, ...updates, page: 1 }
    setFilters(newFilters)

    // Build URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v))
      }
    })

    // Update URL - use replace to avoid scroll issues
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [filters, pathname, router])

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    const defaultFilters: TaskFilters = {
      sortBy: 'newest',
      page: 1,
    }
    setFilters(defaultFilters)
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  /**
   * Build API query string
   *
   * IMPORTANT: Browse mode always filters to status='open' only
   * Professionals should only see available tasks, not in-progress/completed/cancelled
   *
   * IMPORTANT: In browse mode, 'category' filter actually represents subcategory slugs
   * (e.g., 'fish-care', 'plumber'). We send these as 'subcategory' to match the DB schema.
   *
   * When 'q' is provided, the API will use full-text search on task content.
   */
  const buildApiQuery = useCallback(() => {
    const params = new URLSearchParams()
    params.set('mode', 'browse')

    // HARDCODED: Only show open tasks on browse page
    // This ensures professionals only see available tasks they can apply to
    params.set('status', 'open')

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // In browse mode, 'category' filter is actually a subcategory slug
        // Rename it to 'subcategory' for the API query to match DB schema
        const apiKey = key === 'category' ? 'subcategory' : key
        params.set(apiKey, String(value))
      }
    })

    return params.toString()
  }, [filters])

  /**
   * Count active filters (excluding sort and page)
   */
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== 'sortBy' &&
      key !== 'page' &&
      value !== undefined &&
      value !== null &&
      value !== ''
  ).length

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    buildApiQuery,
    activeFilterCount,
  }
}
