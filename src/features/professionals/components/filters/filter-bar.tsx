'use client'

import { useCallback } from 'react'
import { Button } from '@nextui-org/react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CategoryFilter } from '@/app/[lang]/browse-tasks/components/category-filter'
import { CityFilter } from '@/app/[lang]/browse-tasks/components/city-filter'
import { SortDropdown } from '@/app/[lang]/browse-tasks/components/sort-dropdown'
import { RatingFilter } from './rating-filter'
import { CompletedJobsFilter } from './completed-jobs-filter'
import { useProfessionalFilters, type ProfessionalFilters, type ProfessionalFilterValue } from '../../hooks/use-professional-filters'

export function FilterBar() {
  const t = useTranslations()
  const { filters, updateFilter, resetFilters, activeFilterCount } = useProfessionalFilters()

  // Smooth scroll to results after filter selection
  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      const resultsElement = document.getElementById('professionals-results')
      if (resultsElement) {
        const headerOffset = 100
        const elementPosition = resultsElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
  }, [])

  // Handle filter change with scroll
  const handleFilterChange = useCallback((key: keyof ProfessionalFilters, value: ProfessionalFilterValue) => {
    updateFilter(key, value)
    scrollToResults()
  }, [updateFilter, scrollToResults])

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-4 px-6">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter - Reused from browse-tasks */}
        <CategoryFilter
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        {/* City Filter - Reused from browse-tasks */}
        <CityFilter
          value={filters.city}
          onChange={(value) => handleFilterChange('city', value)}
        />

        {/* Rating Filter - Professional specific */}
        <RatingFilter
          value={filters.minRating}
          onChange={(value) => handleFilterChange('minRating', value)}
        />

        {/* Completed Jobs Filter - Professional specific */}
        <CompletedJobsFilter
          value={filters.minJobs}
          onChange={(value) => handleFilterChange('minJobs', value)}
        />

        {/* Sort Dropdown - Aligned to the right on desktop */}
        <div className="ml-auto">
          <SortDropdown
            value={filters.sortBy as any || 'featured'}
            onChange={(value) => handleFilterChange('sortBy', value as any)}
          />
        </div>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="light"
            color="danger"
            startContent={<X className="w-4 h-4" />}
            onPress={resetFilters}
            className="font-medium"
          >
            {t('professionals.filters.reset')} ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  )
}
