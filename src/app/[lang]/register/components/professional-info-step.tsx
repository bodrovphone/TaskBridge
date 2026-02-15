'use client'

import { useState, useEffect, useRef, useDeferredValue } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Card, CardBody, Input, Button, Chip, Spinner } from '@heroui/react'
import { Briefcase, ArrowLeft, ArrowRight, Search, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CityAutocomplete } from '@/components/ui/city-autocomplete'
import type { CityOption } from '@/components/ui/city-autocomplete'
import {
  getCategoryLabelBySlug,
  searchCategoriesAsync,
  preloadCategoryKeywords
} from '@/features/categories'

export interface ProfessionalInfoData {
  professionalTitle: string
  serviceCategories: string[]
  city: string
}

interface ProfessionalInfoStepProps {
  initialData?: ProfessionalInfoData
  onBack: () => void
  onContinue: (data: ProfessionalInfoData) => void
}

export function ProfessionalInfoStep({ initialData, onBack, onContinue }: ProfessionalInfoStepProps) {
  const t = useTranslations()
  const params = useParams()
  const currentLocale = (params?.lang as string) || 'bg'

  const [title, setTitle] = useState(initialData?.professionalTitle || '')
  const deferredTitle = useDeferredValue(title)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.serviceCategories || [])
  const [city, setCity] = useState(initialData?.city || '')

  // Suggestion state (from title)
  const [suggestedCategories, setSuggestedCategories] = useState<Array<{ slug: string; label: string }>>([])
  const [isSuggestingFromTitle, setIsSuggestingFromTitle] = useState(false)
  const lastTitleSearchRef = useRef('')
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Manual search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ slug: string; label: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showManualSearch, setShowManualSearch] = useState(false)

  const [touched, setTouched] = useState({ title: false, categories: false, city: false })

  // Preload category keywords
  useEffect(() => {
    preloadCategoryKeywords()
  }, [])

  // Auto-suggest categories from title (debounced, like create-task)
  useEffect(() => {
    const trimmedTitle = deferredTitle.trim()

    if (trimmedTitle.length < 3 || lastTitleSearchRef.current === trimmedTitle) return

    // Only suggest if user hasn't typed in the search box
    if (searchQuery.trim().length > 0) return

    const hasLetters = /[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ]/u.test(trimmedTitle)
    if (!hasLetters) return

    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current)

    titleDebounceRef.current = setTimeout(() => {
      lastTitleSearchRef.current = trimmedTitle
      setIsSuggestingFromTitle(true)

      searchCategoriesAsync(trimmedTitle, t, currentLocale)
        .then((results) => {
          const suggestions = results
            .filter(r => !selectedCategories.includes(r.value))
            .slice(0, 6)
            .map(r => ({ slug: r.value, label: r.label }))
          setSuggestedCategories(suggestions)
        })
        .catch(() => {
          setSuggestedCategories([])
        })
        .finally(() => {
          setIsSuggestingFromTitle(false)
        })
    }, 800)

    return () => {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current)
    }
  }, [deferredTitle, t, currentLocale, selectedCategories, searchQuery])

  // Manual search effect
  useEffect(() => {
    const trimmedQuery = searchQuery.trim()

    if (trimmedQuery.length < 2) {
      setSearchResults([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchCategoriesAsync(trimmedQuery, t, currentLocale)
        setSearchResults(
          results
            .filter(r => !selectedCategories.includes(r.value))
            .slice(0, 12)
            .map(r => ({ slug: r.value, label: r.label }))
        )
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 150)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, t, currentLocale, selectedCategories])

  const addCategory = (slug: string) => {
    setTouched(prev => ({ ...prev, categories: true }))
    if (!selectedCategories.includes(slug) && selectedCategories.length < 10) {
      setSelectedCategories(prev => [...prev, slug])
      // Clear the suggestion from the list
      setSuggestedCategories(prev => prev.filter(c => c.slug !== slug))
      setSearchResults(prev => prev.filter(c => c.slug !== slug))
    }
  }

  const removeCategory = (slug: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== slug))
  }

  // Validation
  const isTitleValid = title.trim().length >= 3
  const hasCategoriesSelected = selectedCategories.length > 0
  const hasCitySelected = city.length > 0
  const isFormValid = isTitleValid && hasCategoriesSelected && hasCitySelected

  const handleContinue = () => {
    setTouched({ title: true, categories: true, city: true })
    if (!isFormValid) return

    onContinue({
      professionalTitle: title.trim(),
      serviceCategories: selectedCategories,
      city,
    })
  }

  const handleCityChange = (cityOption: CityOption | null) => {
    setTouched(prev => ({ ...prev, city: true }))
    setCity(cityOption?.slug || '')
  }

  // Chip colors for suggestions (rotating)
  const suggestionChipColors = [
    'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200',
    'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200',
    'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
    'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
    'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200',
    'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200',
  ]

  // Determine whether to show suggestions or search results
  const showSuggestions = suggestedCategories.length > 0 && searchQuery.trim().length === 0
  const showSearchResults = searchResults.length > 0 && searchQuery.trim().length >= 2

  return (
    <div className="max-w-lg mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">{t('auth.register.backToIntent')}</span>
      </button>

      {/* Selected intent badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
          <Briefcase className="w-4 h-4" />
          {t('auth.register.intentProfessional')}
        </div>
      </div>

      <Card className="shadow-xl border border-slate-200">
        <CardBody className="p-6 lg:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {t('auth.register.professionalInfoTitle')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('auth.register.professionalInfoSubtitle')}
            </p>
          </div>

          <div className="space-y-5">
            {/* Professional Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('auth.register.professionalTitleLabel')}
              </label>
              <Input
                placeholder={t('auth.register.professionalTitlePlaceholder')}
                value={title}
                onValueChange={(val) => {
                  setTitle(val)
                  setTouched(prev => ({ ...prev, title: true }))
                  // Reset title search ref so new searches can happen
                  if (val.trim() !== lastTitleSearchRef.current) {
                    lastTitleSearchRef.current = ''
                  }
                }}
                startContent={<Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                isInvalid={touched.title && !isTitleValid}
                errorMessage={touched.title && !isTitleValid ? t('auth.register.professionalTitleError') : undefined}
                classNames={{
                  input: 'text-base',
                  inputWrapper: 'h-12',
                }}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('auth.register.selectCity')}
              </label>
              <CityAutocomplete
                value={city || undefined}
                onChange={handleCityChange}
                showProfileCity={false}
                showLastSearched={false}
                isInvalid={touched.city && !hasCitySelected}
                errorMessage={touched.city && !hasCitySelected ? t('auth.register.cityRequired') : undefined}
              />
            </div>

            {/* Service Categories */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('auth.register.serviceCategories')}
                {touched.categories && !hasCategoriesSelected && (
                  <span className="text-red-500 text-xs ml-2">
                    {t('auth.register.categoriesRequired')}
                  </span>
                )}
              </label>

              {/* Selected categories */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedCategories.map(slug => (
                    <Chip
                      key={slug}
                      onClose={() => removeCategory(slug)}
                      variant="solid"
                      className="bg-blue-600 text-white shadow-sm"
                    >
                      {getCategoryLabelBySlug(slug, t)}
                    </Chip>
                  ))}
                </div>
              )}

              {/* Auto-suggestions from title */}
              <AnimatePresence mode="wait">
                {isSuggestingFromTitle && (
                  <motion.div
                    key="suggesting-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 mb-3 text-sm text-slate-500"
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    <span>{t('auth.register.matchingCategories')}</span>
                  </motion.div>
                )}

                {showSuggestions && (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mb-3"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        {t('auth.register.suggestedCategories')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedCategories.map((cat, index) => (
                        <button
                          key={cat.slug}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-95 cursor-pointer ${suggestionChipColors[index % suggestionChipColors.length]}`}
                          onClick={() => addCategory(cat.slug)}
                        >
                          + {cat.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* When suggestions are showing, collapse search behind a link */}
              {showSuggestions && !showManualSearch ? (
                <button
                  type="button"
                  onClick={() => setShowManualSearch(true)}
                  className="text-xs text-slate-500 hover:text-blue-600 transition-colors underline"
                >
                  {t('auth.register.searchOrBrowse')}
                </button>
              ) : (
                <>
                  {/* Search input */}
                  <Input
                    placeholder={t('profile.serviceCategories.searchPlaceholder')}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    size="sm"
                    startContent={<Search className="w-4 h-4 text-gray-400" />}
                    endContent={
                      isSearching ? (
                        <Spinner size="sm" color="primary" />
                      ) : searchQuery ? (
                        <X
                          className="w-4 h-4 text-gray-400 cursor-pointer"
                          onClick={() => setSearchQuery('')}
                        />
                      ) : null
                    }
                    classNames={{
                      input: 'text-sm',
                      inputWrapper: 'border-gray-200 hover:border-primary',
                    }}
                  />

                  {/* Search results as flat chips */}
                  {showSearchResults && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {searchResults.map((cat, index) => (
                        <button
                          key={cat.slug}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-95 cursor-pointer ${suggestionChipColors[index % suggestionChipColors.length]}`}
                          onClick={() => addCategory(cat.slug)}
                        >
                          + {cat.label}
                        </button>
                      ))}
                    </div>
                  )}

                </>
              )}
            </div>

            {/* Continue button */}
            <Button
              size="lg"
              className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              onPress={handleContinue}
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              {t('auth.register.continueToAuth')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
