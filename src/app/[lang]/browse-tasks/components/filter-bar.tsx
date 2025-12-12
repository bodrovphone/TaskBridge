'use client'

import { useCallback } from 'react'
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
  const { filters, updateFilter, updateFilters, resetFilters, activeFilterCount } = useTaskFilters()

  // Smooth scroll to results after filter selection
  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      const resultsElement = document.getElementById('browse-tasks-results')
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
  const handleFilterChange = useCallback((key: string, value: any) => {
    updateFilter(key as any, value)
    scrollToResults()
  }, [updateFilter, scrollToResults])

  // Handle multiple filter changes with scroll
  const handleFiltersChange = useCallback((updates: any) => {
    updateFilters(updates)
    scrollToResults()
  }, [updateFilters, scrollToResults])

  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Components */}
          <CategoryFilter
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
          />

          <CityFilter
            value={filters.city}
            onChange={(value) => handleFilterChange('city', value)}
          />

          <BudgetFilter
            value={{ min: filters.budgetMin, max: filters.budgetMax }}
            onChange={(value) => {
              handleFiltersChange({ budgetMin: value.min, budgetMax: value.max })
            }}
          />

          <UrgencyFilter
            value={filters.urgency}
            onChange={(value) => handleFilterChange('urgency', value)}
          />

          {/* Sort Dropdown */}
          <div className="ml-auto">
            <SortDropdown
              value={filters.sortBy || 'newest'}
              onChange={(value) => handleFilterChange('sortBy', value)}
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
