'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent, Input, Chip } from '@nextui-org/react'
import { MapPin, ChevronDown, Search, Clock, Home } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { getCitiesWithLabels, getCityLabelBySlug } from '@/features/cities'
import { useSearchLocationPreference } from '@/hooks/use-search-location-preference'
import { useAuth } from '@/features/auth'

interface CityFilterProps {
  value?: string
  onChange: (value?: string) => void
}

interface CityOption {
  slug: string
  label: string
}

// Popular cities for quick chips
const POPULAR_CITY_SLUGS = ['sofia', 'plovdiv', 'varna', 'burgas', 'sunny-beach', 'bansko']

export function CityFilter({ value, onChange }: CityFilterProps) {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { lastSearched, saveLocation } = useSearchLocationPreference()

  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<CityOption[]>([])

  // Get all 51 cities with translated labels
  const allCities = useMemo(() => getCitiesWithLabels(t), [t])

  // Get popular cities with labels
  const popularCities = useMemo(() => {
    return POPULAR_CITY_SLUGS.map(slug => ({
      slug,
      label: getCityLabelBySlug(slug, t)
    }))
  }, [t])

  // Get profile city option
  const profileCity = useMemo((): CityOption | null => {
    if (!profile?.city) return null
    return {
      slug: profile.city,
      label: getCityLabelBySlug(profile.city, t)
    }
  }, [profile?.city, t])

  // Get last searched city option (only if different from profile city)
  const lastSearchedCity = useMemo((): CityOption | null => {
    if (!lastSearched) return null
    if (profileCity && lastSearched.slug === profileCity.slug) return null
    return {
      slug: lastSearched.slug,
      label: lastSearched.label
    }
  }, [lastSearched, profileCity])

  // Search cities locally (instant, no API)
  const searchCities = useCallback((query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const results = allCities.filter(city =>
      city.label.toLowerCase().includes(lowerQuery) ||
      city.slug.toLowerCase().includes(lowerQuery)
    )
    setSearchResults(results.map(c => ({ slug: c.slug, label: c.label })))
  }, [allCities])

  // Handle search change (instant local search)
  const handleSearchChange = useCallback((newValue: string) => {
    setSearchQuery(newValue)
    searchCities(newValue)
  }, [searchCities])

  const handleSelect = (city: CityOption) => {
    if (value === city.slug) {
      onChange(undefined) // Deselect if clicking same city
    } else {
      onChange(city.slug)
      // Save to localStorage
      saveLocation(city.slug, city.label)
    }
    setSearchQuery('')
    setSearchResults([])
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return t('browseTasks.filters.city', 'City')
    // Try to get label from known cities
    const knownCity = allCities.find(c => c.slug === value)
    if (knownCity) return knownCity.label
    // Otherwise try to get from last searched
    if (lastSearched && lastSearched.slug === value) return lastSearched.label
    return value
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
      <PopoverContent className="w-80 p-3">
        <div className="space-y-3">
          {/* Search */}
          <Input
            placeholder={t('browseTasks.filters.searchCity', 'Search city...')}
            value={searchQuery}
            onValueChange={handleSearchChange}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            size="sm"
          />

          {/* Smart Suggestions (shown when no search query) */}
          {!searchQuery && (
            <div className="space-y-3">
              {/* Last Searched */}
              {lastSearchedCity && (
                <button
                  type="button"
                  onClick={() => handleSelect(lastSearchedCity)}
                  className={`flex items-center gap-2 w-full p-2 text-left rounded-lg transition-colors ${
                    value === lastSearchedCity.slug
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {t('cityAutocomplete.lastSearched', 'Last searched:')}
                  </span>
                  <span className="font-medium text-gray-900">{lastSearchedCity.label}</span>
                </button>
              )}

              {/* Profile City */}
              {profileCity && (
                <button
                  type="button"
                  onClick={() => handleSelect(profileCity)}
                  className={`flex items-center gap-2 w-full p-2 text-left rounded-lg transition-colors ${
                    value === profileCity.slug
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {t('cityAutocomplete.yourCity', 'Your city:')}
                  </span>
                  <span className="font-medium text-gray-900">{profileCity.label}</span>
                </button>
              )}

              {/* Popular Cities */}
              <div className="space-y-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('cityAutocomplete.popular', 'Popular')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularCities.map((city) => (
                    <Chip
                      key={city.slug}
                      variant={value === city.slug ? 'solid' : 'flat'}
                      color={value === city.slug ? 'primary' : 'default'}
                      classNames={{
                        base: 'cursor-pointer hover:bg-gray-200 transition-colors',
                      }}
                      onClick={() => handleSelect(city)}
                    >
                      {city.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((city) => {
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
                      onPress={() => handleSelect(city)}
                    >
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      {city.label}
                    </Button>
                  )
                })
              ) : (
                <div className="text-center text-sm text-gray-500 py-4">
                  {t('cityAutocomplete.noResults', 'No cities found')}
                </div>
              )}
            </div>
          )}

          {/* Clear Button */}
          {value && (
            <>
              <div className="border-t border-divider my-2" />
              <Button
                variant="light"
                color="default"
                className="w-full justify-start text-danger"
                onPress={() => {
                  onChange(undefined)
                  setSearchQuery('')
                  setSearchResults([])
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
