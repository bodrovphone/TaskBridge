'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Popover, PopoverTrigger, PopoverContent, Chip } from '@nextui-org/react'
import { Wallet, ChevronDown } from 'lucide-react'

interface BudgetFilterProps {
  value?: { min?: number; max?: number }
  onChange: (value: { min?: number; max?: number }) => void
}

const BUDGET_PRESETS = [
  { label: 'Under 50 лв', min: undefined, max: 50 },
  { label: '50-150 лв', min: 50, max: 150 },
  { label: '150-300 лв', min: 150, max: 300 },
  { label: '300-500 лв', min: 300, max: 500 },
  { label: '500+ лв', min: 500, max: undefined },
]

export function BudgetFilter({ value, onChange }: BudgetFilterProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [minInput, setMinInput] = useState(value?.min?.toString() || '')
  const [maxInput, setMaxInput] = useState(value?.max?.toString() || '')

  const handleApply = () => {
    const min = minInput ? Number(minInput) : undefined
    const max = maxInput ? Number(maxInput) : undefined
    onChange({ min, max })
    setIsOpen(false)
  }

  const handlePreset = (preset: { min?: number; max?: number }) => {
    setMinInput(preset.min?.toString() || '')
    setMaxInput(preset.max?.toString() || '')
    onChange(preset)
    setIsOpen(false)
  }

  const handleClear = () => {
    setMinInput('')
    setMaxInput('')
    onChange({ min: undefined, max: undefined })
  }

  const hasValue = value?.min !== undefined || value?.max !== undefined

  const getDisplayText = () => {
    if (!hasValue) return t('browseTasks.filters.budget', 'Budget')

    if (value?.min && value?.max) {
      return `${value.min}-${value.max} лв`
    } else if (value?.min) {
      return `${value.min}+ лв`
    } else if (value?.max) {
      return `< ${value.max} лв`
    }
    return t('browseTasks.filters.budget', 'Budget')
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant={hasValue ? 'flat' : 'bordered'}
          color={hasValue ? 'primary' : 'default'}
          startContent={<Wallet className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className="justify-between"
        >
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">
              {t('browseTasks.filters.budget', 'Budget')}
            </h4>
            {hasValue && (
              <Button size="sm" variant="light" onPress={handleClear}>
                {t('browseTasks.filters.clear', 'Clear')}
              </Button>
            )}
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {BUDGET_PRESETS.map((preset, index) => (
              <Chip
                key={index}
                onClick={() => handlePreset(preset)}
                className="cursor-pointer"
                variant="flat"
                color="default"
              >
                {preset.label}
              </Chip>
            ))}
          </div>

          {/* Custom Range */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              {t('browseTasks.filters.customRange', 'Custom Range')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label={t('browseTasks.filters.min', 'Min')}
                placeholder="0"
                value={minInput}
                onValueChange={setMinInput}
                endContent={<span className="text-gray-400 text-sm">лв</span>}
                size="sm"
              />
              <Input
                type="number"
                label={t('browseTasks.filters.max', 'Max')}
                placeholder="∞"
                value={maxInput}
                onValueChange={setMaxInput}
                endContent={<span className="text-gray-400 text-sm">лв</span>}
                size="sm"
              />
            </div>
          </div>

          {/* Apply Button */}
          <Button color="primary" className="w-full" onPress={handleApply}>
            {t('browseTasks.filters.apply', 'Apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
