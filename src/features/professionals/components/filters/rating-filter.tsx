'use client'

import { useTranslations } from 'next-intl'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { Star, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface RatingFilterProps {
  value?: number
  onChange: (value?: number) => void
}

const RATING_OPTIONS = [
  { value: 3, stars: 3 },
  { value: 4, stars: 4 },
  { value: 5, stars: 5 },
]

export function RatingFilter({ value, onChange }: RatingFilterProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (rating: number) => {
    if (value === rating) {
      onChange(undefined) // Deselect if clicking same rating
    } else {
      onChange(rating)
    }
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return t('professionals.filters.minRating')
    return `${value}+ ⭐`
  }

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<Star className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className={`justify-between min-w-40 ${
            value
              ? 'bg-yellow-100 border-yellow-500 text-yellow-700 hover:bg-yellow-200'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          {RATING_OPTIONS.map((option) => {
            const isSelected = value === option.value

            return (
              <Button
                key={option.value}
                variant="light"
                className={`w-full justify-center h-auto py-3 ${
                  isSelected
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onPress={() => handleSelect(option.value)}
              >
                {/* Star icons only, no text */}
                <div className="flex gap-0.5">
                  {Array.from({ length: option.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        isSelected
                          ? 'fill-white text-white'
                          : 'fill-yellow-500 text-yellow-500'
                      }`}
                    />
                  ))}
                </div>
              </Button>
            )
          })}

          {value && (
            <>
              <div className="border-t border-divider my-1" />
              <Button
                variant="light"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onPress={() => {
                  onChange(undefined)
                  setIsOpen(false)
                }}
              >
                {t('professionals.filters.clear')}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
