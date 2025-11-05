'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent, Slider } from '@nextui-org/react'
import { Briefcase, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface CompletedJobsFilterProps {
  value?: number
  onChange: (value?: number) => void
}

const PRESETS = [
  { value: 10, label: '10+' },
  { value: 50, label: '50+' },
  { value: 100, label: '100+' },
  { value: 200, label: '200+' },
]

export function CompletedJobsFilter({ value, onChange }: CompletedJobsFilterProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value || 0)

  const handleApply = () => {
    if (localValue > 0) {
      onChange(localValue)
    } else {
      onChange(undefined)
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(undefined)
    setLocalValue(0)
    setIsOpen(false)
  }

  const handlePreset = (presetValue: number) => {
    setLocalValue(presetValue)
  }

  const getDisplayText = () => {
    if (!value) return t('professionals.filters.minJobs', 'Min Jobs')
    return `${value}+ jobs`
  }

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<Briefcase className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className={`justify-between min-w-40 ${
            value
              ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          {/* Quick Presets */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              {t('professionals.filters.quickSelect', 'Quick Select')}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  size="sm"
                  variant={localValue === preset.value ? 'solid' : 'bordered'}
                  color={localValue === preset.value ? 'success' : 'default'}
                  onPress={() => handlePreset(preset.value)}
                  className="font-medium"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t('professionals.filters.customValue', 'Custom Value')}
              </span>
              <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {localValue}+ {t('professionals.filters.jobs', 'jobs')}
              </span>
            </div>

            <Slider
              size="sm"
              step={10}
              minValue={0}
              maxValue={500}
              value={localValue}
              onChange={(val) => setLocalValue(val as number)}
              classNames={{
                base: "w-full",
                track: "bg-gray-200",
                filler: "bg-green-500",
                thumb: "bg-green-600 border-2 border-green-700",
              }}
              renderThumb={(props) => (
                <div
                  {...props}
                  className="group p-1 top-1/2 bg-green-600 border-2 border-green-700 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                >
                  <span className="transition-transform bg-gradient-to-br from-green-400 to-green-600 rounded-full w-4 h-4 block group-data-[dragging=true]:scale-80" />
                </div>
              )}
            />

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
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
