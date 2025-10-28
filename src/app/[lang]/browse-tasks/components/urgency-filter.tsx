'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react'
import { Clock, ChevronDown, Zap, Calendar, Sparkles } from 'lucide-react'

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
    color: 'danger' as const,
  },
  {
    value: 'within_week' as const,
    labelKey: 'browseTasks.filters.thisWeek',
    label: 'This Week',
    icon: Calendar,
    color: 'warning' as const,
  },
  {
    value: 'flexible' as const,
    labelKey: 'browseTasks.filters.flexible',
    label: 'Flexible',
    icon: Sparkles,
    color: 'default' as const,
  },
]

export function UrgencyFilter({ value, onChange }: UrgencyFilterProps) {
  const { t } = useTranslation()

  const selectedOption = URGENCY_OPTIONS.find(opt => opt.value === value)

  const handleSelect = (newValue: 'same_day' | 'within_week' | 'flexible') => {
    if (value === newValue) {
      onChange(undefined) // Deselect if clicking same option
    } else {
      onChange(newValue)
    }
  }

  const getDisplayText = () => {
    if (!value) return t('browseTasks.filters.urgency', 'Urgency')
    return t(selectedOption?.labelKey || '', selectedOption?.label || '')
  }

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant={value ? 'flat' : 'bordered'}
          color={value ? (selectedOption?.color || 'primary') : 'default'}
          startContent={<Clock className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className="justify-between"
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
                variant={isSelected ? 'flat' : 'light'}
                color={isSelected ? option.color : 'default'}
                className="w-full justify-start"
                startContent={<Icon className="w-4 h-4" />}
                onPress={() => handleSelect(option.value)}
              >
                {t(option.labelKey, option.label)}
              </Button>
            )
          })}

          {value && (
            <>
              <div className="border-t border-divider my-2" />
              <Button
                variant="light"
                color="default"
                className="w-full justify-start text-danger"
                onPress={() => onChange(undefined)}
              >
                {t('browseTasks.filters.clear', 'Clear')}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
