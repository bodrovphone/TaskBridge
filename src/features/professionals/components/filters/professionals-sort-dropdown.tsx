'use client'

import { useTranslations } from 'next-intl'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { ArrowUpDown, ChevronDown, Crown, Star, Trophy } from 'lucide-react'
import { useState } from 'react'

type ProfessionalSortOption = 'featured' | 'rating' | 'jobs'

interface ProfessionalsSortDropdownProps {
  value: ProfessionalSortOption
  onChange: (value: ProfessionalSortOption) => void
}

const SORT_OPTIONS = [
  {
    value: 'featured' as const,
    labelKey: 'professionals.sorting.featuredFirst',
    icon: Crown,
    color: 'text-yellow-600'
  },
  {
    value: 'rating' as const,
    labelKey: 'professionals.sorting.highestRating',
    icon: Star,
    color: 'text-green-600'
  },
  {
    value: 'jobs' as const,
    labelKey: 'professionals.sorting.mostExperience',
    icon: Trophy,
    color: 'text-blue-600'
  },
]

export function ProfessionalsSortDropdown({ value, onChange }: ProfessionalsSortDropdownProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (sortValue: ProfessionalSortOption) => {
    onChange(sortValue)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    const option = SORT_OPTIONS.find(opt => opt.value === value)
    return option ? t(option.labelKey) : t('professionals.filters.sortBy')
  }

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<ArrowUpDown className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className="justify-between min-w-40 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="space-y-1">
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = value === option.value

            return (
              <Button
                key={option.value}
                variant="light"
                className={`w-full justify-start h-auto py-3 ${
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onPress={() => handleSelect(option.value)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : option.color}`} />
                  <span className="font-medium">{t(option.labelKey)}</span>
                </div>
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
