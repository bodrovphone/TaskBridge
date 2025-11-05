'use client'

import { useTranslation } from 'react-i18next'
import { Chip } from '@nextui-org/react'
import { X } from 'lucide-react'
import { getCategoryLabelBySlug } from '@/features/categories'
import { getCityLabelBySlug } from '@/features/cities'
import { useTaskFilters } from '../hooks/use-task-filters'

export function ActiveFilters() {
  const { t } = useTranslation()
  const { filters, updateFilter, updateFilters, resetFilters, activeFilterCount } = useTaskFilters()

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

  // Budget
  if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
    let budgetLabel = ''
    if (filters.budgetMin !== undefined && filters.budgetMax !== undefined) {
      budgetLabel = `${filters.budgetMin}-${filters.budgetMax} лв`
    } else if (filters.budgetMin !== undefined) {
      budgetLabel = `${filters.budgetMin}+ лв`
    } else if (filters.budgetMax !== undefined) {
      budgetLabel = `< ${filters.budgetMax} лв`
    }

    activeChips.push({
      key: 'budget',
      label: budgetLabel,
      onRemove: () => updateFilters({ budgetMin: undefined, budgetMax: undefined }),
    })
  }

  // Urgency
  if (filters.urgency) {
    const urgencyLabels = {
      same_day: t('browseTasks.filters.urgentSameDay', 'Urgent (Same Day)'),
      within_week: t('browseTasks.filters.thisWeek', 'This Week'),
      flexible: t('browseTasks.filters.flexible', 'Flexible'),
    }
    activeChips.push({
      key: 'urgency',
      label: urgencyLabels[filters.urgency],
      onRemove: () => updateFilter('urgency', undefined),
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-600">
        {t('browseTasks.filters.activeFilters', 'Active filters')}:
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
          {t('browseTasks.filters.clearAll', 'Clear all')}
        </Chip>
      )}
    </div>
  )
}
