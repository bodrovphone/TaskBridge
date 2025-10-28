'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent, Input } from '@nextui-org/react'
import { MapPin, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { BULGARIAN_CITIES } from '@/app/[lang]/create-task/lib/validation'

interface CityFilterProps {
  value?: string
  onChange: (value?: string) => void
}

export function CityFilter({ value, onChange }: CityFilterProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCities = BULGARIAN_CITIES.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (city: string) => {
    if (value === city) {
      onChange(undefined) // Deselect if clicking same city
    } else {
      onChange(city)
    }
  }

  const getDisplayText = () => {
    if (!value) return t('browseTasks.filters.city', 'City')
    return value
  }

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant={value ? 'flat' : 'bordered'}
          color={value ? 'primary' : 'default'}
          startContent={<MapPin className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className="justify-between"
        >
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="space-y-2">
          {/* Search */}
          <Input
            placeholder={t('browseTasks.filters.searchCity', 'Search city...')}
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            size="sm"
            classNames={{
              base: 'mb-2',
            }}
          />

          {/* Cities List */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredCities.map((city) => {
              const isSelected = value === city

              return (
                <Button
                  key={city}
                  variant={isSelected ? 'flat' : 'light'}
                  color={isSelected ? 'primary' : 'default'}
                  className="w-full justify-start"
                  onPress={() => handleSelect(city)}
                >
                  {city}
                </Button>
              )
            })}

            {filteredCities.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-4">
                {t('browseTasks.filters.noCitiesFound', 'No cities found')}
              </div>
            )}
          </div>

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
