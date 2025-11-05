'use client'

import { useTranslation } from 'react-i18next'
import { Chip } from '@nextui-org/react'
import { X } from 'lucide-react'
import { getCategoryLabelBySlug } from '@/features/categories'
import { getCityLabelBySlug } from '@/features/cities'
import { useProfessionalFilters } from '../../hooks/use-professional-filters'

export function ActiveFilters() {
  const { t } = useTranslation()
  const { filters, updateFilter, resetFilters, activeFilterCount } = useProfessionalFilters()

  if (activeFilterCount === 0) return null

  // Build array of active filter chips
  const activeChips = []

  // Category
  if (filters.category) {
    activeChips.push({
      key: 'category',
      label: getCategoryLabelBySlug(filters.category, t),
      onRemove: () => updateFilter('category', undefined),
    })
  }

  // City
  if (filters.city) {
    activeChips.push({
      key: 'city',
      label: getCityLabelBySlug(filters.city, t),
      onRemove: () => updateFilter('city', undefined),
    })
  }

  // Min Rating
  if (filters.minRating !== undefined) {
    activeChips.push({
      key: 'minRating',
      label: `${filters.minRating}+ ⭐`,
      onRemove: () => updateFilter('minRating', undefined),
    })
  }

  // Min Jobs
  if (filters.minJobs !== undefined) {
    activeChips.push({
      key: 'minJobs',
      label: `${filters.minJobs}+ ${t('professionals.filters.jobs', 'jobs')}`,
      onRemove: () => updateFilter('minJobs', undefined),
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-600">
        {t('professionals.filters.activeFilters', 'Active filters')}:
      </span>

      {activeChips.map((chip) => (
        <Chip
          key={chip.key}
          variant="flat"
          className="bg-blue-100 text-blue-700 border border-blue-300"
          onClose={chip.onRemove}
          endContent={
            <button
              onClick={chip.onRemove}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          }
        >
          {chip.label}
        </Chip>
      ))}

      {activeChips.length > 1 && (
        <Chip
          variant="flat"
          className="bg-red-100 text-red-700 border border-red-300 cursor-pointer hover:bg-red-200"
          onClick={resetFilters}
          endContent={
            <X className="w-3 h-3 ml-1" />
          }
        >
          {t('professionals.filters.clearAll', 'Clear all')}
        </Chip>
      )}
    </div>
  )
}
