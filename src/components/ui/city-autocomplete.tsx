'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Chip } from '@nextui-org/react'
import { MapPin, Search, Clock, Home, X } from 'lucide-react'
import { useSearchLocationPreference } from '@/hooks/use-search-location-preference'
import { useAuth } from '@/features/auth'
import { getCitiesWithLabels, getCityLabelBySlug } from '@/features/cities'

export interface CityOption {
  slug: string
  label: string
}

interface CityAutocompleteProps {
  value?: string
  onChange: (city: CityOption | null) => void
  placeholder?: string
  showProfileCity?: boolean
  showLastSearched?: boolean
  showPopularCities?: boolean
  className?: string
  isInvalid?: boolean
  errorMessage?: string
}

// Popular cities to show as quick chips
const POPULAR_CITY_SLUGS = ['sofia', 'plovdiv', 'varna', 'burgas', 'sunny-beach', 'bansko']

export function CityAutocomplete({
  value,
  onChange,
  placeholder,
  showProfileCity = true,
  showLastSearched = true,
  showPopularCities = true,
  className = '',
  isInvalid,
  errorMessage,
}: CityAutocompleteProps) {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { lastSearched, saveLocation } = useSearchLocationPreference()

  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<CityOption[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    if (!showProfileCity || !profile?.city) return null
    return {
      slug: profile.city,
      label: getCityLabelBySlug(profile.city, t)
    }
  }, [showProfileCity, profile?.city, t])

  // Get last searched city option (only if different from profile city)
  const lastSearchedCity = useMemo((): CityOption | null => {
    if (!showLastSearched || !lastSearched) return null
    // Don't show if same as profile city
    if (profileCity && lastSearched.slug === profileCity.slug) return null
    return {
      slug: lastSearched.slug,
      label: lastSearched.label
    }
  }, [showLastSearched, lastSearched, profileCity])

  // Get display value
  const displayValue = useMemo(() => {
    if (!value) return inputValue
    // Get label from our city list
    const knownCity = allCities.find(c => c.slug === value)
    if (knownCity) return knownCity.label
    return value
  }, [value, inputValue, allCities])

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

  // Handle input change (instant local search, no debounce needed)
  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue)
    setFocusedIndex(-1)
    searchCities(newValue)
  }, [searchCities])

  // Handle city selection
  const handleSelect = useCallback((city: CityOption) => {
    onChange(city)
    setInputValue('')
    setIsOpen(false)
    setSearchResults([])
    // Save to localStorage
    saveLocation(city.slug, city.label)
  }, [onChange, saveLocation])

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
    setInputValue('')
    setSearchResults([])
  }, [onChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allOptions = [
      ...(lastSearchedCity ? [lastSearchedCity] : []),
      ...(profileCity ? [profileCity] : []),
      ...searchResults
    ]

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, allOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && allOptions[focusedIndex]) {
          handleSelect(allOptions[focusedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }, [focusedIndex, lastSearchedCity, profileCity, searchResults, handleSelect])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Should show dropdown
  const shouldShowDropdown = isOpen && (
    inputValue.length > 0 ||
    lastSearchedCity ||
    profileCity ||
    showPopularCities
  )

  // Check if we have suggestions to show when focused (before typing)
  const hasSuggestions = lastSearchedCity || profileCity || showPopularCities

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder || t('cityAutocomplete.placeholder', 'Search for a city...')}
        value={value ? displayValue : inputValue}
        onValueChange={(newValue) => {
          // If user is typing over a selected value, clear selection
          if (value) {
            onChange(null)
          }
          handleInputChange(newValue)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        isInvalid={isInvalid}
        errorMessage={errorMessage}
        startContent={<MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        endContent={
          <div className="flex items-center gap-1">
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-gray-400" />
            )}
          </div>
        }
        classNames={{
          input: 'text-base',
          inputWrapper: 'h-12',
        }}
      />

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto"
        >
          {/* Suggestions Section (shown when no search query) */}
          {!inputValue && hasSuggestions && (
            <div className="p-3 space-y-3">
              {/* Last Searched */}
              {lastSearchedCity && (
                <button
                  type="button"
                  onClick={() => handleSelect(lastSearchedCity)}
                  className="flex items-center gap-2 w-full p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
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
                  className="flex items-center gap-2 w-full p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {t('cityAutocomplete.yourCity', 'Your city:')}
                  </span>
                  <span className="font-medium text-gray-900">{profileCity.label}</span>
                </button>
              )}

              {/* Popular Cities */}
              {showPopularCities && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {t('cityAutocomplete.popular', 'Popular')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map((city) => (
                      <Chip
                        key={city.slug}
                        variant="flat"
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
              )}
            </div>
          )}

          {/* Search Results */}
          {inputValue && (
            <div className="py-1">
              {searchResults.length > 0 ? (
                searchResults.map((city, index) => {
                  const absoluteIndex = (lastSearchedCity ? 1 : 0) + (profileCity ? 1 : 0) + index
                  const isFocused = focusedIndex === absoluteIndex

                  return (
                    <button
                      key={city.slug}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`flex items-center gap-2 w-full px-4 py-3 text-left transition-colors ${
                        isFocused ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{city.label}</span>
                    </button>
                  )
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {t('cityAutocomplete.noResults', 'No cities found')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
