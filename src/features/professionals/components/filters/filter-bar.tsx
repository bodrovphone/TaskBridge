'use client'

import { Button } from '@nextui-org/react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CategoryFilter } from '@/app/[lang]/browse-tasks/components/category-filter'
import { CityFilter } from '@/app/[lang]/browse-tasks/components/city-filter'
import { SortDropdown } from '@/app/[lang]/browse-tasks/components/sort-dropdown'
import { RatingFilter } from './rating-filter'
import { CompletedJobsFilter } from './completed-jobs-filter'
import { useProfessionalFilters } from '../../hooks/use-professional-filters'

export function FilterBar() {
  const { t } = useTranslation()
  const { filters, updateFilter, resetFilters, activeFilterCount } = useProfessionalFilters()

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-4 px-6">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter - Reused from browse-tasks */}
        <CategoryFilter
          value={filters.category}
          onChange={(value) => updateFilter('category', value)}
        />

        {/* City Filter - Reused from browse-tasks */}
        <CityFilter
          value={filters.city}
          onChange={(value) => updateFilter('city', value)}
        />

        {/* Rating Filter - Professional specific */}
        <RatingFilter
          value={filters.minRating}
          onChange={(value) => updateFilter('minRating', value)}
        />

        {/* Completed Jobs Filter - Professional specific */}
        <CompletedJobsFilter
          value={filters.minJobs}
          onChange={(value) => updateFilter('minJobs', value)}
        />

        {/* Sort Dropdown - Aligned to the right on desktop */}
        <div className="ml-auto">
          <SortDropdown
            value={filters.sortBy as any || 'featured'}
            onChange={(value) => updateFilter('sortBy', value as any)}
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
            {t('professionals.filters.reset', 'Reset')} ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  )
}
