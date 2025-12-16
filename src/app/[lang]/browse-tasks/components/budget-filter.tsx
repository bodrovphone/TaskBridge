'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Popover, PopoverTrigger, PopoverContent, Chip } from '@nextui-org/react'
import { Wallet, ChevronDown } from 'lucide-react'

interface BudgetFilterProps {
  value?: { min?: number; max?: number }
  onChange: (value: { min?: number; max?: number }) => void
}

const BUDGET_PRESETS = [
  { label: 'Under 25 €', min: undefined, max: 25 },
  { label: '25-75 €', min: 25, max: 75 },
  { label: '75-150 €', min: 75, max: 150 },
  { label: '150-250 €', min: 150, max: 250 },
  { label: '250+ €', min: 250, max: undefined },
]

export function BudgetFilter({ value, onChange }: BudgetFilterProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [minInput, setMinInput] = useState(value?.min?.toString() || '')
  const [maxInput, setMaxInput] = useState(value?.max?.toString() || '')

  // Sync local state with prop changes
  useEffect(() => {
    setMinInput(value?.min?.toString() || '')
    setMaxInput(value?.max?.toString() || '')
  }, [value?.min, value?.max])

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

    if (value?.min !== undefined && value?.max !== undefined) {
      return `${value.min}-${value.max} €`
    } else if (value?.min !== undefined) {
      return `${value.min}+ €`
    } else if (value?.max !== undefined) {
      return `< ${value.max} €`
    }
    return t('browseTasks.filters.budget', 'Budget')
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<Wallet className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className={`justify-between min-w-44 ${
            hasValue
              ? 'bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
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
              <Button size="sm" variant="light" className="text-red-600 hover:bg-red-50" onPress={handleClear}>
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
                className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                variant="flat"
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
                endContent={<span className="text-gray-400 text-sm">€</span>}
                size="sm"
              />
              <Input
                type="number"
                label={t('browseTasks.filters.max', 'Max')}
                placeholder="∞"
                value={maxInput}
                onValueChange={setMaxInput}
                endContent={<span className="text-gray-400 text-sm">€</span>}
                size="sm"
              />
            </div>
          </div>

          {/* Apply Button */}
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onPress={handleApply}>
            {t('browseTasks.filters.apply', 'Apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
