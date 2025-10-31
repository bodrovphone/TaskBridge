'use client'

import { motion } from 'framer-motion'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Chip,
  Divider,
} from '@nextui-org/react'
import { SlidersHorizontal, Grid3X3, MapPin, Wallet, Clock, ArrowUpDown, Sparkles, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CategoryFilter } from './category-filter'
import { CityFilter } from './city-filter'
import { BudgetFilter } from './budget-filter'
import { UrgencyFilter } from './urgency-filter'
import { SortDropdown } from './sort-dropdown'
import { useTaskFilters } from '../hooks/use-task-filters'

const filterSections = [
  { key: 'category', icon: Grid3X3, labelKey: 'browseTasks.filters.category', color: 'text-blue-500' },
  { key: 'city', icon: MapPin, labelKey: 'browseTasks.filters.city', color: 'text-emerald-500' },
  { key: 'budget', icon: Wallet, labelKey: 'browseTasks.filters.budget', color: 'text-amber-500' },
  { key: 'urgency', icon: Clock, labelKey: 'browseTasks.filters.urgency', color: 'text-orange-500' },
  { key: 'sort', icon: ArrowUpDown, labelKey: 'browseTasks.filters.sortBy', color: 'text-purple-500' },
]

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
        size="lg"
        startContent={<SlidersHorizontal className="w-5 h-5" />}
        className="md:hidden relative"
      >
        {t('browseTasks.filters.filters', 'Filters')}
        {activeFilterCount > 0 && (
          <Chip
            size="sm"
            color="primary"
            variant="solid"
            className="absolute -top-2 -right-2 min-w-6 h-6"
          >
            {activeFilterCount}
          </Chip>
        )}
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="full"
        scrollBehavior="inside"
        classNames={{
          base: 'md:hidden',
          wrapper: 'items-end',
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              y: 50,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {/* Header with gradient background */}
              <ModalHeader className="flex flex-col gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-gray-100">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <SlidersHorizontal className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {t('browseTasks.filters.filters', 'Filters')}
                      </h2>
                      {activeFilterCount > 0 && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Chip size="sm" color="primary" variant="flat">
                            {activeFilterCount} {t('browseTasks.filters.active', 'active')}
                          </Chip>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Close Icon Button */}
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={onClose}
                    className="min-w-10 w-10 h-10"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </Button>
                </div>
              </ModalHeader>

              <ModalBody className="bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-6 py-6">
                  {/* Filter Sections with Icons */}
                  {filterSections.map(({ key, icon: Icon, labelKey, color }, index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <label className="text-sm font-semibold text-gray-800">
                          {t(labelKey)}
                        </label>
                      </div>

                      <div className="pl-7">
                        {key === 'category' && (
                          <CategoryFilter
                            value={filters.category}
                            onChange={(value) => updateFilter('category', value)}
                          />
                        )}
                        {key === 'city' && (
                          <CityFilter
                            value={filters.city}
                            onChange={(value) => updateFilter('city', value)}
                          />
                        )}
                        {key === 'budget' && (
                          <BudgetFilter
                            value={{ min: filters.budgetMin, max: filters.budgetMax }}
                            onChange={(value) => {
                              updateFilter('budgetMin', value.min)
                              updateFilter('budgetMax', value.max)
                            }}
                          />
                        )}
                        {key === 'urgency' && (
                          <UrgencyFilter
                            value={filters.urgency}
                            onChange={(value) => updateFilter('urgency', value)}
                          />
                        )}
                        {key === 'sort' && (
                          <SortDropdown
                            value={filters.sortBy || 'newest'}
                            onChange={(value) => updateFilter('sortBy', value)}
                          />
                        )}
                      </div>

                      {index < filterSections.length - 1 && (
                        <Divider className="mt-6" />
                      )}
                    </motion.div>
                  ))}

                  {/* Tips Section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Pro Tip
                        </p>
                        <p className="text-xs text-gray-600">
                          Use multiple filters to find exactly what you're looking for. You can always reset them!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-gray-100 bg-white gap-2">
                <Button
                  variant="light"
                  size="lg"
                  onPress={onClose}
                  className="flex-1"
                >
                  {t('common.close', 'Close')}
                </Button>
                <Button
                  variant="flat"
                  size="lg"
                  color="danger"
                  startContent={<X className="w-4 h-4" />}
                  onPress={() => {
                    resetFilters()
                  }}
                  isDisabled={activeFilterCount === 0}
                  className="flex-1"
                >
                  {t('browseTasks.filters.reset', 'Reset')}
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  variant="shadow"
                  onPress={onClose}
                  className="flex-1 font-semibold"
                >
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
