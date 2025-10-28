'use client'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react'
import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CategoryFilter } from './category-filter'
import { CityFilter } from './city-filter'
import { BudgetFilter } from './budget-filter'
import { UrgencyFilter } from './urgency-filter'
import { SortDropdown } from './sort-dropdown'
import { useTaskFilters } from '../hooks/use-task-filters'

export function FiltersModal() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const { filters, updateFilter, resetFilters, activeFilterCount } = useTaskFilters()

  return (
    <>
      {/* Trigger Button */}
      <Button
        onPress={onOpen}
        variant="bordered"
        startContent={<SlidersHorizontal className="w-4 h-4" />}
        className="md:hidden"
      >
        {t('browseTasks.filters.filters', 'Filters')}
        {activeFilterCount > 0 && ` (${activeFilterCount})`}
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="full"
        scrollBehavior="inside"
        classNames={{
          base: 'md:hidden',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t('browseTasks.filters.filters', 'Filters')}
                {activeFilterCount > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    {activeFilterCount} {t('browseTasks.filters.active', 'active')}
                  </span>
                )}
              </ModalHeader>

              <ModalBody>
                <div className="space-y-6 py-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('browseTasks.filters.category', 'Category')}
                    </label>
                    <CategoryFilter
                      value={filters.category}
                      onChange={(value) => updateFilter('category', value)}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('browseTasks.filters.city', 'City')}
                    </label>
                    <CityFilter
                      value={filters.city}
                      onChange={(value) => updateFilter('city', value)}
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('browseTasks.filters.budget', 'Budget')}
                    </label>
                    <BudgetFilter
                      value={{ min: filters.budgetMin, max: filters.budgetMax }}
                      onChange={(value) => {
                        updateFilter('budgetMin', value.min)
                        updateFilter('budgetMax', value.max)
                      }}
                    />
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('browseTasks.filters.urgency', 'Urgency')}
                    </label>
                    <UrgencyFilter
                      value={filters.urgency}
                      onChange={(value) => updateFilter('urgency', value)}
                    />
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('browseTasks.sortBy', 'Sort by')}
                    </label>
                    <SortDropdown
                      value={filters.sortBy || 'newest'}
                      onChange={(value) => updateFilter('sortBy', value)}
                    />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => {
                    resetFilters()
                    onClose()
                  }}
                  isDisabled={activeFilterCount === 0}
                >
                  {t('browseTasks.filters.reset', 'Reset')}
                </Button>
                <Button color="primary" onPress={onClose}>
                  {t('browseTasks.filters.showResults', 'Show Results')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
