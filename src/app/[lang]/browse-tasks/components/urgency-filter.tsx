'use client'

import { useTranslations } from 'next-intl'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { Clock, ChevronDown, Zap, Calendar, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface UrgencyFilterProps {
  value?: 'same_day' | 'within_week' | 'flexible'
  onChange: (value?: 'same_day' | 'within_week' | 'flexible') => void
}

const URGENCY_OPTIONS = [
  {
    value: 'same_day' as const,
    labelKey: 'browseTasks.filters.urgentSameDay',
    label: 'Urgent (Same Day)',
    icon: Zap,
    bgColor: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
  },
  {
    value: 'within_week' as const,
    labelKey: 'browseTasks.filters.thisWeek',
    label: 'This Week',
    icon: Calendar,
    bgColor: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
  {
    value: 'flexible' as const,
    labelKey: 'browseTasks.filters.flexible',
    label: 'Flexible',
    icon: Sparkles,
    bgColor: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
]

export function UrgencyFilter({ value, onChange }: UrgencyFilterProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = URGENCY_OPTIONS.find(opt => opt.value === value)

  const handleSelect = (newValue: 'same_day' | 'within_week' | 'flexible') => {
    if (value === newValue) {
      onChange(undefined) // Deselect if clicking same option
    } else {
      onChange(newValue)
    }
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return t('browseTasks.filters.urgency')
    return selectedOption ? t(selectedOption.labelKey) : t('browseTasks.filters.urgency')
  }

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<Clock className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className={`justify-between min-w-44 ${
            value
              ? 'bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          {URGENCY_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = value === option.value

            return (
              <Button
                key={option.value}
                variant="light"
                className={`w-full justify-start ${
                  isSelected
                    ? `${option.bgColor} text-white ${option.hoverColor}`
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                startContent={<Icon className="w-4 h-4" />}
                onPress={() => handleSelect(option.value)}
              >
                {t(option.labelKey)}
              </Button>
            )
          })}

          {value && (
            <>
              <div className="border-t border-divider my-2" />
              <Button
                variant="light"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onPress={() => {
                  onChange(undefined)
                  setIsOpen(false)
                }}
              >
                {t('browseTasks.filters.clear')}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
