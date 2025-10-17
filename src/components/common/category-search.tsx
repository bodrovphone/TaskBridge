'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, Input } from '@nextui-org/react'
import { useState, useMemo, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { MAIN_CATEGORIES, getSubcategoriesByMainCategory } from '@/features/categories'
import type { Subcategory } from '@/features/categories/lib/types'

interface CategorySearchProps {
  onCategorySelect?: (slug: string) => void
  placeholder?: string
  className?: string
}

/**
 * Reusable smart category search component
 *
 * Features:
 * - Real-time search across all categories and subcategories
 * - Animated search results
 * - Cross-category search (searches all subcategories)
 * - Keyboard accessible
 *
 * @example
 * <CategorySearch onCategorySelect={(slug) => router.push(`/professionals/${slug}`)} />
 */
export function CategorySearch({ onCategorySelect, placeholder, className }: CategorySearchProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Get all subcategories for search
  const allSubcategories = useMemo(() => {
    return MAIN_CATEGORIES.flatMap(mainCat =>
      getSubcategoriesByMainCategory(mainCat.id)
    )
  }, [])

  // Show search results across all categories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()

    return allSubcategories.filter(cat => {
      const translatedName = t(cat.translationKey).toLowerCase()
      const slug = cat.slug.toLowerCase()

      return translatedName.includes(query) || slug.includes(query)
    }).slice(0, 12) // Limit to 12 results
  }, [searchQuery, allSubcategories, t])

  // Get main category for a subcategory
  const getMainCategoryForSubcategory = useCallback((subcategory: Subcategory) => {
    return MAIN_CATEGORIES.find(mainCat => mainCat.id === subcategory.mainCategoryId)
  }, [])

  const handleSelect = (slug: string) => {
    setSearchQuery('')
    setIsSearching(false)
    onCategorySelect?.(slug)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
  }

  return (
    <div className={`${className} relative`}>
      <Card className="bg-white/98 backdrop-blur-xl shadow-lg border-0">
        <CardBody className="p-4">
          <Input
            size="lg"
            placeholder={placeholder || t('professionals.searchPlaceholder', 'Search categories... (e.g. repair, cleaning, lessons)')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsSearching(!!e.target.value.trim())
            }}
            onFocus={() => searchQuery && setIsSearching(true)}
            startContent={
              <motion.div
                animate={{
                  rotate: searchQuery ? 360 : 0,
                  scale: searchQuery ? 1.1 : 1
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                <Search className="text-primary group-focus-within:text-primary" size={20} />
              </motion.div>
            }
            endContent={
              searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </motion.button>
              )
            }
            classNames={{
              base: "max-w-full",
              mainWrapper: "h-full",
              input: "text-base font-medium placeholder:text-gray-400",
              inputWrapper: "h-14 px-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 group-focus-within:border-primary group-hover:border-primary/50 shadow-md group-focus-within:shadow-lg transition-all duration-300 ease-out group-focus-within:bg-white"
            }}
          />
        </CardBody>
      </Card>

      {/* Search Results Dropdown - Positioned outside Card */}
      {isSearching && searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          <div className="p-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-600 font-medium px-2">
              {searchResults.length} {t('professionals.categoryResults', 'categories found')}
            </p>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {searchResults.map((category, index) => {
              const mainCategory = getMainCategoryForSubcategory(category)

              return (
                <motion.button
                  key={category.slug}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleSelect(category.slug)}
                  className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-0.5">
                      {t(category.translationKey)}
                    </p>
                    {mainCategory && (
                      <p className="text-xs text-gray-500">
                        {t(`${mainCategory.translationKey}.title`)}
                      </p>
                    )}
                  </div>
                  <Search size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {isSearching && searchQuery && searchResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 text-center"
        >
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {t('professionals.noResults', 'No categories match your search')}
          </p>
          <p className="text-xs text-gray-600">
            {t('createTask.category.tryDifferent', 'Try a different search term')}
          </p>
        </motion.div>
      )}
    </div>
  )
}
