/**
 * Professional Filters Hook
 * Manages professional search filters with URL synchronization
 * Mirrors the pattern from browse-tasks/hooks/use-task-filters.ts
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { ProfessionalSortOption } from '@/server/professionals/professional.query-types'

/**
 * Professional filter state
 */
export interface ProfessionalFilters {
  category?: string               // Service category slug
  city?: string                  // City filter
  neighborhood?: string          // Neighborhood filter
  minRating?: number            // Minimum rating (1-5)
  minJobs?: number              // Minimum completed jobs
  sortBy?: ProfessionalSortOption
  page?: number
}

/**
 * Hook for managing professional filters with URL synchronization
 */
export function useProfessionalFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isUpdatingRef = useRef(false)

  // Initialize filters from URL
  const [filters, setFilters] = useState<ProfessionalFilters>(() => {
    return {
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      neighborhood: searchParams.get('neighborhood') || undefined,
      minRating: searchParams.get('minRating')
        ? Number(searchParams.get('minRating'))
        : undefined,
      minJobs: searchParams.get('minJobs')
        ? Number(searchParams.get('minJobs'))
        : undefined,
      sortBy:
        (searchParams.get('sortBy') as ProfessionalSortOption) || 'featured',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    }
  })

  // Sync filters with URL changes
  useEffect(() => {
    const newFilters: ProfessionalFilters = {
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      neighborhood: searchParams.get('neighborhood') || undefined,
      minRating: searchParams.get('minRating')
        ? Number(searchParams.get('minRating'))
        : undefined,
      minJobs: searchParams.get('minJobs')
        ? Number(searchParams.get('minJobs'))
        : undefined,
      sortBy:
        (searchParams.get('sortBy') as ProfessionalSortOption) || 'featured',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    }
    setFilters(newFilters)
  }, [searchParams])

  /**
   * Update a single filter and sync with URL
   * @param skipScrollRestore - Set to true when scrollToResults will be called after (avoids race condition)
   */
  const updateFilter = useCallback(
    (key: keyof ProfessionalFilters, value: any, skipScrollRestore = false) => {
      const newFilters = { ...filters, [key]: value }

      // Reset to page 1 when filters change (except when changing page)
      if (key !== 'page') {
        newFilters.page = 1
      }

      setFilters(newFilters)

      // Build URL params
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          if (typeof v === 'boolean' && v === false) {
            // Skip false booleans
            return
          }
          params.set(k, String(v))
        }
      })

      // Update URL without scroll reset
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })

      // Only restore scroll position if not about to scroll to results
      if (!skipScrollRestore) {
        const scrollY = window.scrollY
        isUpdatingRef.current = true
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY)
          isUpdatingRef.current = false
        })
      }
    },
    [filters, pathname, router]
  )

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback(
    (updates: Partial<ProfessionalFilters>) => {
      const newFilters = { ...filters, ...updates, page: 1 }
      setFilters(newFilters)

      // Build URL params
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          if (typeof v === 'boolean' && v === false) {
            // Skip false booleans
            return
          }
          params.set(k, String(v))
        }
      })

      // Save scroll position, update URL, then restore scroll
      const scrollY = window.scrollY
      isUpdatingRef.current = true
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY)
        isUpdatingRef.current = false
      })
    },
    [filters, pathname, router]
  )

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    const defaultFilters: ProfessionalFilters = {
      sortBy: 'featured',
      page: 1,
    }
    setFilters(defaultFilters)
    // Save scroll position, update URL, then restore scroll
    const scrollY = window.scrollY
    isUpdatingRef.current = true
    router.replace(pathname, { scroll: false })
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY)
      isUpdatingRef.current = false
    })
  }, [pathname, router])

  /**
   * Build API query string
   */
  const buildApiQuery = useCallback(() => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        params.set(key, String(value))
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
      value !== '' &&
      value !== false
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
