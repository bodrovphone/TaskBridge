'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent, Slider } from '@nextui-org/react'
import { Star, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface RatingFilterProps {
  value?: number
  onChange: (value?: number) => void
}

export function RatingFilter({ value, onChange }: RatingFilterProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value || 1)

  const handleApply = () => {
    onChange(localValue)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(undefined)
    setLocalValue(1)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return t('professionals.filters.minRating', 'Min Rating')
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
      <PopoverContent className="w-72 p-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t('professionals.filters.minimumRating', 'Minimum Rating')}
              </span>
              <span className="text-sm font-bold text-yellow-600 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {localValue.toFixed(1)}+
              </span>
            </div>

            <Slider
              size="sm"
              step={0.5}
              minValue={1}
              maxValue={5}
              value={localValue}
              onChange={(val) => setLocalValue(val as number)}
              classNames={{
                base: "w-full",
                track: "bg-gray-200",
                filler: "bg-yellow-500",
                thumb: "bg-yellow-600 border-2 border-yellow-700",
              }}
              renderThumb={(props) => (
                <div
                  {...props}
                  className="group p-1 top-1/2 bg-yellow-600 border-2 border-yellow-700 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                >
                  <span className="transition-transform bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-4 h-4 block group-data-[dragging=true]:scale-80" />
                </div>
              )}
            />

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.0</span>
              <span>2.0</span>
              <span>3.0</span>
              <span>4.0</span>
              <span>5.0</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              className="flex-1"
              onPress={handleClear}
            >
              {t('professionals.filters.clear', 'Clear')}
            </Button>
            <Button
              color="primary"
              className="flex-1"
              onPress={handleApply}
            >
              {t('professionals.filters.apply', 'Apply')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
