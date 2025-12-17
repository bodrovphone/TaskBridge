'use client'

import { useTranslations } from 'next-intl'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react'
import { Briefcase, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface CompletedJobsFilterProps {
  value?: number
  onChange: (value?: number) => void
}

const JOBS_OPTIONS = [
  { value: 1, label: '1+' },
  { value: 5, label: '5+' },
  { value: 10, label: '10+' },
  { value: 20, label: '20+' },
]

export function CompletedJobsFilter({ value, onChange }: CompletedJobsFilterProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (jobs: number) => {
    if (value === jobs) {
      onChange(undefined) // Deselect if clicking same value
    } else {
      onChange(jobs)
    }
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return t('professionals.filters.minJobs')
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
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          {JOBS_OPTIONS.map((option) => {
            const isSelected = value === option.value

            return (
              <Button
                key={option.value}
                variant="light"
                className={`w-full justify-start h-auto py-3 ${
                  isSelected
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onPress={() => handleSelect(option.value)}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-green-600'}`} />
                  <span className="font-medium text-lg">{option.label}</span>
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
