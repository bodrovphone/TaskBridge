'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { SlidersHorizontal, Grid3X3, MapPin, Star, Briefcase, ArrowUpDown, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CategoryFilter } from '@/app/[lang]/browse-tasks/components/category-filter'
import { CityFilter } from '@/app/[lang]/browse-tasks/components/city-filter'
import { RatingFilter } from './rating-filter'
import { CompletedJobsFilter } from './completed-jobs-filter'
import { ProfessionalsSortDropdown } from './professionals-sort-dropdown'
import { useProfessionalFilters, type ProfessionalFilters } from '../../hooks/use-professional-filters'

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
  const { filters, updateFilters, resetFilters, activeFilterCount } = useProfessionalFilters()

  // Local state for filters - only applied when user clicks "Show Results"
  const [localFilters, setLocalFilters] = useState<ProfessionalFilters>(filters)

  // Sync local filters when modal opens or external filters change
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
  }, [isOpen, filters])

  // Update local filter without triggering API call
  const updateLocalFilter = (key: keyof ProfessionalFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

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
    }, 150) // Slightly longer delay for modal close animation
  }, [])

  // Apply filters and close modal
  const handleApplyFilters = () => {
    updateFilters(localFilters)
    onClose()
    scrollToResults()
  }

  // Reset local filters
  const handleResetFilters = () => {
    const defaultFilters: ProfessionalFilters = { sortBy: 'featured', page: 1 }
    setLocalFilters(defaultFilters)
  }

  // Count active local filters (for UI display in modal)
  const localActiveFilterCount = Object.entries(localFilters).filter(
    ([key, value]) =>
      key !== 'sortBy' &&
      key !== 'page' &&
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== false
  ).length

  return (
    <>
      {/* Trigger Button */}
      <Button
        onPress={onOpen}
        variant="bordered"
        size="lg"
        startContent={<SlidersHorizontal className="w-5 h-5" />}
        className="md:hidden"
      >
        <div className="flex items-center gap-2">
          <span>{t('professionals.filters.filtersButton', 'Filters')}</span>
          {activeFilterCount > 0 && (
            <Chip
              size="sm"
              variant="solid"
              className="bg-orange-600 text-white text-xs h-5 min-w-5 px-1"
            >
              {activeFilterCount}
            </Chip>
          )}
        </div>
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
                      {localActiveFilterCount > 0 && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Chip size="sm" variant="flat" className="bg-orange-100 text-orange-700 border border-orange-300">
                            {localActiveFilterCount} {t('professionals.filters.active', 'active')}
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
                            value={localFilters.category}
                            onChange={(value) => updateLocalFilter('category', value)}
                          />
                        )}
                        {key === 'city' && (
                          <CityFilter
                            value={localFilters.city}
                            onChange={(value) => updateLocalFilter('city', value)}
                          />
                        )}
                        {key === 'rating' && (
                          <RatingFilter
                            value={localFilters.minRating}
                            onChange={(value) => updateLocalFilter('minRating', value)}
                          />
                        )}
                        {key === 'jobs' && (
                          <CompletedJobsFilter
                            value={localFilters.minJobs}
                            onChange={(value) => updateLocalFilter('minJobs', value)}
                          />
                        )}
                        {key === 'sort' && (
                          <ProfessionalsSortDropdown
                            value={(localFilters.sortBy as 'featured' | 'rating' | 'jobs') || 'featured'}
                            onChange={(value) => updateLocalFilter('sortBy', value)}
                          />
                        )}
                      </div>

                      {index < filterSections.length - 1 && (
                        <Divider className="mt-6" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-gray-100 bg-white p-4">
                <div className="flex flex-col w-full gap-2">
                  {/* First row - Primary action */}
                  <Button
                    size="lg"
                    onPress={handleApplyFilters}
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
                      onPress={handleResetFilters}
                      isDisabled={localActiveFilterCount === 0}
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
