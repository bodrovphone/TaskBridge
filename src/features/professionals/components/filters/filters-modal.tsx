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
import { SlidersHorizontal, Grid3X3, MapPin, Star, Briefcase, ArrowUpDown, Sparkles, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CategoryFilter } from '@/app/[lang]/browse-tasks/components/category-filter'
import { CityFilter } from '@/app/[lang]/browse-tasks/components/city-filter'
import { SortDropdown } from '@/app/[lang]/browse-tasks/components/sort-dropdown'
import { RatingFilter } from './rating-filter'
import { CompletedJobsFilter } from './completed-jobs-filter'
import { useProfessionalFilters } from '../../hooks/use-professional-filters'

const filterSections = [
  { key: 'category', icon: Grid3X3, labelKey: 'professionals.filters.category', color: 'text-blue-500' },
  { key: 'city', icon: MapPin, labelKey: 'professionals.filters.city', color: 'text-emerald-500' },
  { key: 'rating', icon: Star, labelKey: 'professionals.filters.minRating', color: 'text-yellow-500' },
  { key: 'jobs', icon: Briefcase, labelKey: 'professionals.filters.minJobs', color: 'text-green-500' },
  { key: 'sort', icon: ArrowUpDown, labelKey: 'professionals.filters.sortBy', color: 'text-purple-500' },
]

export function FiltersModal() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const { filters, updateFilter, resetFilters, activeFilterCount } = useProfessionalFilters()

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
        {t('professionals.filters.filters', 'Filters')}
        {activeFilterCount > 0 && (
          <Chip
            size="sm"
            variant="solid"
            className="absolute -top-2 -right-2 min-w-6 h-6 bg-orange-600 text-white"
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
        hideCloseButton={true}
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
              <ModalHeader className="flex flex-col gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <SlidersHorizontal className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {t('professionals.filters.filters', 'Filters')}
                      </h2>
                      {activeFilterCount > 0 && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Chip size="sm" variant="flat" className="bg-orange-100 text-orange-700 border border-orange-300">
                            {activeFilterCount} {t('professionals.filters.active', 'active')}
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
                        {key === 'rating' && (
                          <RatingFilter
                            value={filters.minRating}
                            onChange={(value) => updateFilter('minRating', value)}
                          />
                        )}
                        {key === 'jobs' && (
                          <CompletedJobsFilter
                            value={filters.minJobs}
                            onChange={(value) => updateFilter('minJobs', value)}
                          />
                        )}
                        {key === 'sort' && (
                          <SortDropdown
                            value={filters.sortBy as any || 'featured'}
                            onChange={(value) => updateFilter('sortBy', value as any)}
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
                          {t('professionals.filters.proTip', 'Pro Tip')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t('professionals.filters.proTipText', 'Use multiple filters to find the perfect professional. You can always reset them!')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-gray-100 bg-white p-4">
                <div className="flex flex-col w-full gap-2">
                  {/* First row - Primary action */}
                  <Button
                    size="lg"
                    onPress={onClose}
                    className="w-full font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  >
                    {t('professionals.filters.showResults', 'Show Results')}
                  </Button>

                  {/* Second row - Secondary actions */}
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="bordered"
                      size="lg"
                      onPress={onClose}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      {t('common.close', 'Close')}
                    </Button>
                    <Button
                      size="lg"
                      startContent={<X className="w-4 h-4" />}
                      onPress={() => {
                        resetFilters()
                      }}
                      isDisabled={activeFilterCount === 0}
                      className="flex-1 bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      {t('professionals.filters.reset', 'Reset')}
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
