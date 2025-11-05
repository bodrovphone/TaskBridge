'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent, Input } from '@nextui-org/react'
import { MapPin, ChevronDown, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { getCitiesWithLabels } from '@/features/cities'

interface CityFilterProps {
  value?: string
  onChange: (value?: string) => void
}

export function CityFilter({ value, onChange }: CityFilterProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Get all cities with translated labels
  const allCities = useMemo(() => getCitiesWithLabels(t), [t])

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return allCities

    const lowerQuery = searchQuery.toLowerCase()
    return allCities.filter(city =>
      city.label.toLowerCase().includes(lowerQuery) ||
      city.slug.toLowerCase().includes(lowerQuery)
    )
  }, [allCities, searchQuery])

  const handleSelect = (citySlug: string) => {
    if (value === citySlug) {
      onChange(undefined) // Deselect if clicking same city
    } else {
      onChange(citySlug)
    }
    setSearchQuery('') // Reset search
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return t('browseTasks.filters.city', 'City')
    const city = allCities.find(c => c.slug === value)
    return city?.label || value
  }

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<MapPin className="w-4 h-4" />}
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
              const isSelected = value === city.slug

              return (
                <Button
                  key={city.slug}
                  variant="light"
                  className={`w-full justify-start ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onPress={() => handleSelect(city.slug)}
                >
                  {city.label}
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
                onPress={() => {
                  onChange(undefined)
                  setIsOpen(false)
                }}
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
