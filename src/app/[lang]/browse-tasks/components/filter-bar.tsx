'use client'

import { Button } from '@nextui-org/react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CategoryFilter } from './category-filter'
import { CityFilter } from './city-filter'
import { BudgetFilter } from './budget-filter'
import { UrgencyFilter } from './urgency-filter'
import { SortDropdown } from './sort-dropdown'
import { useTaskFilters } from '../hooks/use-task-filters'

export function FilterBar() {
  const { t } = useTranslation()
  const { filters, updateFilter, resetFilters, activeFilterCount } = useTaskFilters()

  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Components */}
          <CategoryFilter
            value={filters.category}
            onChange={(value) => updateFilter('category', value)}
          />

          <CityFilter
            value={filters.city}
            onChange={(value) => updateFilter('city', value)}
          />

          <BudgetFilter
            value={{ min: filters.budgetMin, max: filters.budgetMax }}
            onChange={(value) => {
              updateFilter('budgetMin', value.min)
              updateFilter('budgetMax', value.max)
            }}
          />

          <UrgencyFilter
            value={filters.urgency}
            onChange={(value) => updateFilter('urgency', value)}
          />

          {/* Sort Dropdown */}
          <div className="ml-auto">
            <SortDropdown
              value={filters.sortBy || 'newest'}
              onChange={(value) => updateFilter('sortBy', value)}
            />
          </div>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="light"
              color="danger"
              startContent={<X className="w-4 h-4" />}
              onPress={resetFilters}
            >
              {t('browseTasks.filters.reset', 'Reset')} ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
