'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Button, Card, CardBody, Chip } from '@nextui-org/react'
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
  const [flowState, setFlowState] = useState<FlowState>(
    initialSubcategory ? 'confirmed' : 'entering_title'
  )
  const [suggestedCategory, setSuggestedCategory] = useState<{
    slug: string
    label: string
    mainCategoryId: string
  } | null>(null)
  const [confirmedSubcategory, setConfirmedSubcategory] = useState(initialSubcategory)
  const [isSearching, setIsSearching] = useState(false)
  const [manualSelectionTriggered, setManualSelectionTriggered] = useState(false)
  const [hasSelectedCategory, setHasSelectedCategory] = useState(!!initialSubcategory)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const titleForFeedbackRef = useRef<string>('')

  // Preload keywords on mount
  useEffect(() => {
    preloadCategoryKeywords()
  }, [])


  // Sync with form
  useEffect(() => {
    form.setFieldValue('title', title)
  }, [title, form])

  // Search for categories after user stops typing
  const searchForCategory = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      return
    }

    setIsSearching(true)
    titleForFeedbackRef.current = query.trim()

    try {
      const results = await searchCategoriesAsync(query, t, i18n.language)

      const topMatch = results[0]
      if (topMatch && topMatch.mainCategoryId) {
        // Found a match with high confidence
        setSuggestedCategory({
          slug: topMatch.value,
          label: topMatch.label,
          mainCategoryId: topMatch.mainCategoryId,
        })
        setFlowState('suggesting')
      } else {
        // No good match found
        setFlowState('manual_selection')
        setManualSelectionTriggered(true)
      }
    } catch (error) {
      console.error('Category search error:', error)
      setFlowState('manual_selection')
      setManualSelectionTriggered(true)
    } finally {
      setIsSearching(false)
    }
  }, [t, i18n.language])

  // Debounced search trigger
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)

    // If we're in 'suggesting' state and user hasn't selected yet, reset to allow re-search
    if (flowState === 'suggesting' && !hasSelectedCategory) {
      setFlowState('entering_title')
      setSuggestedCategory(null)
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Only run auto-suggestion if user hasn't selected a category yet
    // Once selected, user can change category manually via "Change" button
    if (!hasSelectedCategory && value.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchForCategory(value)
      }, 800)
    }
  }, [flowState, hasSelectedCategory, searchForCategory])

  // User confirms suggested category
  const handleConfirmSuggestion = useCallback(() => {
    if (suggestedCategory) {
      setConfirmedSubcategory(suggestedCategory.slug)
      setFlowState('confirmed')
      setHasSelectedCategory(true)
      onCategoryConfirmed(suggestedCategory.mainCategoryId, suggestedCategory.slug)
    }
  }, [suggestedCategory, onCategoryConfirmed])

  // User rejects suggestion, show manual picker
  const handleRejectSuggestion = useCallback(() => {
    setFlowState('manual_selection')
    setManualSelectionTriggered(true)
    setSuggestedCategory(null)
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
          placeholder={t('createTask.title.placeholder', 'e.g., Fix a leaking faucet in the bathroom')}
          classNames={{
            input: "text-lg",
            inputWrapper: "bg-white border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500"
          }}
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('createTask.title.hint', 'Be specific - this helps us match you with the right professionals')}
        </p>
      </div>

      {/* Category Suggestion */}
      <AnimatePresence mode="wait">
        {flowState === 'suggesting' && suggestedCategory && (
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
                <Chip
                  size="lg"
                  variant="flat"
                  className="bg-blue-100 text-blue-800 font-semibold mb-4"
                >
                  {suggestedCategory.label}
                </Chip>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    color="primary"
                    startContent={<Check className="w-4 h-4" />}
                    onPress={handleConfirmSuggestion}
                    className="w-full sm:w-auto"
                  >
                    {t('createTask.category.confirm', 'Yes, correct')}
                  </Button>
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
