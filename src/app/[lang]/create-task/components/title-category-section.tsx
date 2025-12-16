'use client'

import { useState, useEffect, useCallback, useRef, useDeferredValue } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Button, Card, CardBody } from '@nextui-org/react'
import { Check, X, ChevronDown, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  searchCategoriesAsync,
  preloadCategoryKeywords,
  getSubcategoryBySlug,
  getCategoryLabelBySlug,
} from '@/features/categories'
import { CategorySelection } from './category-selection'

interface TitleCategorySectionProps {
  form: any
  onCategoryConfirmed: (category: string, subcategory: string) => void
  initialTitle?: string
  initialCategory?: string
  initialSubcategory?: string
}

type FlowState =
  | 'entering_title'      // User is typing title
  | 'suggesting'          // We found a match, showing suggestion
  | 'manual_selection'    // No match or user rejected, show picker
  | 'confirmed'           // Category confirmed

export function TitleCategorySection({
  form,
  onCategoryConfirmed,
  initialTitle = '',
  initialCategory = '',
  initialSubcategory = '',
}: TitleCategorySectionProps) {
  const { t, i18n } = useTranslation()
  const [title, setTitle] = useState(initialTitle)
  const deferredTitle = useDeferredValue(title) // Deferred value for expensive search
  const [flowState, setFlowState] = useState<FlowState>(
    initialSubcategory ? 'confirmed' : 'entering_title'
  )
  const [suggestedCategories, setSuggestedCategories] = useState<Array<{
    slug: string
    label: string
    mainCategoryId: string
  }>>([])
  const [confirmedSubcategory, setConfirmedSubcategory] = useState(initialSubcategory)
  const [isSearching, setIsSearching] = useState(false)
  const [manualSelectionTriggered, setManualSelectionTriggered] = useState(false)
  const [hasSelectedCategory, setHasSelectedCategory] = useState(!!initialSubcategory)

  const titleForFeedbackRef = useRef<string>('')
  const [titleTouched, setTitleTouched] = useState(false)
  const lastSearchedRef = useRef<string>('') // Track last searched value to avoid duplicates

  // Title validation
  const isTitleTooShort = title.length > 0 && title.length < 10
  const showTitleError = titleTouched && isTitleTooShort

  // Preload keywords on mount
  useEffect(() => {
    preloadCategoryKeywords()
  }, [])


  // Sync with form
  useEffect(() => {
    form.setFieldValue('title', title)
  }, [title, form])

  // Category search triggered by deferred title value
  // useDeferredValue ensures typing stays responsive while search is deferred
  useEffect(() => {
    const trimmedQuery = deferredTitle.trim()

    // Skip if user already selected a category
    if (hasSelectedCategory) return

    // Skip if we already searched this exact value
    if (lastSearchedRef.current === trimmedQuery) return

    // Safety checks
    if (trimmedQuery.length < 3 || trimmedQuery.length > 200) {
      return
    }

    // Skip search if query has no letters (gibberish like "1111111")
    const hasLetters = /[a-zA-Zа-яА-ЯёЁ]/u.test(trimmedQuery)
    if (!hasLetters) {
      return
    }

    // Mark as searched to avoid duplicate searches
    lastSearchedRef.current = trimmedQuery
    titleForFeedbackRef.current = trimmedQuery

    // Reset state if we were suggesting before
    if (flowState === 'suggesting') {
      setFlowState('entering_title')
      setSuggestedCategories([])
    }

    setIsSearching(true)

    // Run the search
    searchCategoriesAsync(deferredTitle, t, i18n.language)
      .then((results) => {
        // Get top 3 matches that have mainCategoryId
        const topMatches = results
          .filter(r => r.mainCategoryId)
          .slice(0, 3)
          .map(r => ({
            slug: r.value,
            label: r.label,
            mainCategoryId: r.mainCategoryId!,
          }))

        if (topMatches.length > 0) {
          setSuggestedCategories(topMatches)
          setFlowState('suggesting')
        } else {
          setFlowState('manual_selection')
          setManualSelectionTriggered(true)
        }
      })
      .catch((error) => {
        console.error('Category search error:', error)
        setFlowState('manual_selection')
        setManualSelectionTriggered(true)
      })
      .finally(() => {
        setIsSearching(false)
      })
  }, [deferredTitle, hasSelectedCategory, flowState, t, i18n.language])

  // Handle title input changes - just update state, search is handled by useEffect above
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)

    // If we're in 'suggesting' state and user is typing more, reset to allow re-search
    if (flowState === 'suggesting' && !hasSelectedCategory) {
      setFlowState('entering_title')
      setSuggestedCategories([])
    }
  }, [flowState, hasSelectedCategory])

  // User confirms suggested category
  const handleConfirmSuggestion = useCallback((index: number) => {
    const category = suggestedCategories[index]
    if (category) {
      setConfirmedSubcategory(category.slug)
      setFlowState('confirmed')
      setHasSelectedCategory(true)
      onCategoryConfirmed(category.mainCategoryId, category.slug)
    }
  }, [suggestedCategories, onCategoryConfirmed])

  // User rejects suggestion, show manual picker
  const handleRejectSuggestion = useCallback(() => {
    setFlowState('manual_selection')
    setManualSelectionTriggered(true)
    setSuggestedCategories([])
  }, [])

  // User manually selects category from picker
  const handleManualCategorySelect = useCallback((category: string, subcategory: string) => {
    setConfirmedSubcategory(subcategory)
    setFlowState('confirmed')
    setHasSelectedCategory(true)
    onCategoryConfirmed(category, subcategory)

    // Send feedback if this was triggered by no match
    if (manualSelectionTriggered && titleForFeedbackRef.current) {
      // Fire-and-forget API call
      fetch('/api/category-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleForFeedbackRef.current,
          subcategory,
          language: i18n.language,
        }),
      }).catch(() => {
        // Ignore errors - non-blocking analytics
      })
    }
  }, [manualSelectionTriggered, i18n.language, onCategoryConfirmed])

  // Change confirmed category
  const handleChangeCategory = useCallback(() => {
    setFlowState('manual_selection')
    setConfirmedSubcategory('')
  }, [])

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('createTask.title.label', 'What do you need done?')} *
        </label>
        <Input
          size="lg"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={() => setTitleTouched(true)}
          placeholder={t('createTask.title.placeholder', 'e.g., Fix a leaking faucet in the bathroom')}
          isInvalid={showTitleError}
          errorMessage={showTitleError ? t('createTask.errors.titleTooShort', 'Title must be at least 10 characters') : undefined}
          classNames={{
            input: "text-lg",
            inputWrapper: showTitleError
              ? "bg-white border-2 border-orange-400 hover:border-orange-500 focus-within:border-orange-500"
              : "bg-white border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500"
          }}
        />
        {!showTitleError && (
          <p className="mt-1 text-sm text-gray-500">
            {t('createTask.title.hint', 'Be specific - this helps us match you with the right professionals')}
          </p>
        )}
        {title.length > 0 && title.length < 10 && !titleTouched && (
          <p className="mt-1 text-sm text-orange-500">
            {title.length}/10 {t('createTask.title.minChars', 'characters minimum')}
          </p>
        )}
      </div>

      {/* Category Suggestions */}
      <AnimatePresence mode="wait">
        {flowState === 'suggesting' && suggestedCategories.length > 0 && (
          <motion.div
            key="suggestion"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800 font-medium">
                    {t('createTask.category.suggestion', 'This looks like:')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestedCategories.map((category, index) => {
                    // Assign colors based on index (excluding blue which is background)
                    const chipColors = [
                      'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200',
                      'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200',
                      'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
                    ]
                    const colorClass = chipColors[index % chipColors.length]

                    return (
                      <button
                        key={category.slug}
                        type="button"
                        className={`px-4 py-2 rounded-full cursor-pointer font-semibold transition-all border-2 text-base active:scale-95 ${colorClass}`}
                        onTouchEnd={(e) => {
                          e.preventDefault()
                          handleConfirmSuggestion(index)
                        }}
                        onClick={() => handleConfirmSuggestion(index)}
                      >
                        {category.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {suggestedCategories.length === 1 && (
                    <Button
                      color="primary"
                      startContent={<Check className="w-4 h-4" />}
                      onPress={() => handleConfirmSuggestion(0)}
                      className="w-full sm:w-auto"
                    >
                      {t('createTask.category.confirm', 'Yes, correct')}
                    </Button>
                  )}
                  <Button
                    variant="flat"
                    startContent={<X className="w-4 h-4" />}
                    onPress={handleRejectSuggestion}
                    className="w-full sm:w-auto"
                  >
                    {t('createTask.category.different', 'Choose different')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {flowState === 'manual_selection' && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-2 border-amber-200 bg-amber-50 mb-4">
              <CardBody className="p-4">
                <p className="text-sm text-amber-800">
                  {t('createTask.category.helpUs', "Help us find the right specialists - please select a category:")}
                </p>
              </CardBody>
            </Card>
            <CategorySelection
              form={form}
              onCategoryChange={(subcategory) => {
                const sub = getSubcategoryBySlug(subcategory)
                if (sub) {
                  handleManualCategorySelect(sub.mainCategoryId, subcategory)
                }
              }}
            />
          </motion.div>
        )}

        {flowState === 'confirmed' && confirmedSubcategory && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-2 border-green-200 bg-green-50">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        {t('createTask.category.selected', 'Category')}
                      </p>
                      <p className="text-lg font-semibold text-green-800">
                        {getCategoryLabelBySlug(confirmedSubcategory, t)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="flat"
                    size="sm"
                    startContent={<ChevronDown className="w-4 h-4" />}
                    onPress={handleChangeCategory}
                  >
                    {t('createTask.category.change', 'Change')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {isSearching && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-2 border-gray-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <p className="text-sm text-gray-600">
                    {t('createTask.category.analyzing', 'Analyzing your request...')}
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
