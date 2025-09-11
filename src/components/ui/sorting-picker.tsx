'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Star, TrendingUp, Briefcase, SlidersHorizontal, Crown, Trophy, Target } from 'lucide-react'

interface SortingPickerProps {
  value: string
  onChange: (sortBy: string) => void
  className?: string
}

export default function SortingPicker({ value, onChange, className = "" }: SortingPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const sortOptions = [
    {
      key: 'featured',
      icon: Crown,
      title: t('professionals.sorting.featuredFirst'),
      description: t('professionals.sorting.featuredFirstDesc'),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      key: 'rating',
      icon: Star,
      title: t('professionals.sorting.highestRating'),
      description: t('professionals.sorting.highestRatingDesc'),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      key: 'jobs',
      icon: Trophy,
      title: t('professionals.sorting.mostExperience'),
      description: t('professionals.sorting.mostExperienceDesc'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    }
  ]

  const currentOption = sortOptions.find(option => option.key === value) || sortOptions[0]

  const handleSelect = (sortKey: string) => {
    onChange(sortKey)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`h-12 px-4 bg-white shadow-lg border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300 rounded-xl min-w-[180px] ${className}`}
        >
          <div className="flex items-center gap-2">
            <currentOption.icon className={`${currentOption.color}`} size={18} />
            <span className="font-medium text-gray-900">
              {currentOption.title}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              ▼
            </motion.div>
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 bg-white border-2 border-gray-200 shadow-xl rounded-xl" 
        align="center"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <SlidersHorizontal className="text-indigo-600" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('professionals.filters.sortResultsTitle')}</h3>
              <p className="text-sm text-gray-600">{t('professionals.filters.sortResultsDescription')}</p>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            {sortOptions.map((option, index) => {
              const Icon = option.icon
              const isSelected = value === option.key
              
              return (
                <motion.button
                  key={option.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(option.key)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected 
                      ? `${option.borderColor} ${option.bgColor}` 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl ${isSelected ? option.bgColor : 'bg-gray-100'}`}>
                        <Icon 
                          size={24} 
                          className={isSelected ? option.color : 'text-gray-600'} 
                        />
                      </div>
                      
                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-base">
                            {option.title}
                          </span>
                          {option.key === 'featured' && (
                            <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className={`w-8 h-8 ${option.bgColor} ${option.borderColor} border-2 rounded-full flex items-center justify-center`}
                        >
                          <span className={`${option.color} text-sm font-bold`}>✓</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Result Preview */}
          <motion.div 
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Target className="text-indigo-600" size={16} />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {t('professionals.filters.sortingBy', { option: currentOption.title.toLowerCase() })}
                </p>
                <p className="text-xs text-gray-600">
                  {value === 'featured' && t('professionals.filters.sortingDescFeatured')}
                  {value === 'rating' && t('professionals.filters.sortingDescRating')}
                  {value === 'jobs' && t('professionals.filters.sortingDescJobs')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pro Tip */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">💡</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800">{t('professionals.filters.proTip')}</p>
                <p className="text-xs text-blue-700">
                  {t('professionals.filters.proTipMessage', { sortOption: t('professionals.sorting.featuredFirst') })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}