'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip, Input } from '@nextui-org/react'
import { Search, X } from 'lucide-react'
import {
  getAllSubcategoriesWithLabels,
  getMainCategoriesWithLabels,
  getCategoryLabelBySlug
} from '@/features/categories'

interface ServiceCategoriesSelectorProps {
  selectedCategories: string[] // Subcategory slugs
  onChange: (categories: string[]) => void
  maxSelections?: number
}

// Popular subcategories (most frequently used)
const POPULAR_SUBCATEGORY_SLUGS: string[] = [
  'house-cleaning',
  'plumber',
  'electrician',
  'delivery',
  'babysitting',
  'tutoring',
  'moving-service',
  'handyman-service'
]

export function ServiceCategoriesSelector({
  selectedCategories,
  onChange,
  maxSelections = 10
}: ServiceCategoriesSelectorProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  // Get all subcategories organized by main category
  const categoriesByMainCategory = useMemo(() => {
    const mainCategories = getMainCategoriesWithLabels(t)
    const allSubcategories = getAllSubcategoriesWithLabels(t)

    return mainCategories.map(mainCat => ({
      id: mainCat.id,
      title: mainCat.title,
      icon: mainCat.icon,
      color: mainCat.color,
      subcategories: allSubcategories.filter(sub => sub.mainCategoryId === mainCat.id)
    }))
  }, [t])

  // Popular subcategories
  const popularSubcategories = useMemo(() => {
    const allSubcategories = getAllSubcategoriesWithLabels(t)
    return POPULAR_SUBCATEGORY_SLUGS
      .map(slug => allSubcategories.find(sub => sub.slug === slug))
      .filter(Boolean)
  }, [t])

  const toggleCategory = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      onChange(selectedCategories.filter(c => c !== categorySlug))
    } else {
      if (selectedCategories.length < maxSelections) {
        onChange([...selectedCategories, categorySlug])
      }
    }
  }

  const removeCategory = (categorySlug: string) => {
    onChange(selectedCategories.filter(c => c !== categorySlug))
  }

  // Filter subcategories based on search
  const filteredCategoriesByMainCategory = useMemo(() => {
    if (!searchQuery.trim()) return categoriesByMainCategory

    const query = searchQuery.toLowerCase()

    return categoriesByMainCategory
      .map(mainCat => ({
        ...mainCat,
        subcategories: mainCat.subcategories.filter(sub =>
          sub.label.toLowerCase().includes(query)
        )
      }))
      .filter(mainCat => mainCat.subcategories.length > 0)
  }, [searchQuery, categoriesByMainCategory])

  // Get color classes for chips based on main category color
  const getChipClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      const colorMap: Record<string, string> = {
        blue: 'bg-blue-600 text-white',
        orange: 'bg-orange-600 text-white',
        green: 'bg-green-600 text-white',
        purple: 'bg-purple-600 text-white',
        indigo: 'bg-indigo-600 text-white',
        pink: 'bg-pink-600 text-white',
      }
      return colorMap[color] || 'bg-gray-600 text-white'
    } else {
      const colorMap: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-700 border-blue-300',
        orange: 'bg-orange-100 text-orange-700 border-orange-300',
        green: 'bg-green-100 text-green-700 border-green-300',
        purple: 'bg-purple-100 text-purple-700 border-purple-300',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
        pink: 'bg-pink-100 text-pink-700 border-pink-300',
      }
      return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  // Get main category for a subcategory
  const getMainCategoryForSubcategory = (subcategorySlug: string) => {
    for (const mainCat of categoriesByMainCategory) {
      if (mainCat.subcategories.some(sub => sub.slug === subcategorySlug)) {
        return mainCat
      }
    }
    return categoriesByMainCategory[0] // fallback
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Input
        placeholder={t('profile.serviceCategories.searchPlaceholder', 'Search categories...')}
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<Search className="w-4 h-4 text-gray-400" />}
        endContent={
          searchQuery && (
            <X
              className="w-4 h-4 text-gray-400 cursor-pointer"
              onClick={() => setSearchQuery('')}
            />
          )
        }
        classNames={{
          input: "text-sm",
          inputWrapper: "border-gray-200 hover:border-primary"
        }}
      />

      {/* Popular Categories */}
      {!searchQuery && popularSubcategories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">
            {t('profile.serviceCategories.popularCategories', 'Popular Categories')}
          </p>
          <div className="flex flex-wrap gap-2">
            {popularSubcategories.map(subcategory => {
              if (!subcategory) return null
              const mainCat = getMainCategoryForSubcategory(subcategory.slug)
              const isSelected = selectedCategories.includes(subcategory.slug)

              return (
                <Chip
                  key={subcategory.slug}
                  variant={isSelected ? 'solid' : 'flat'}
                  onClick={() => toggleCategory(subcategory.slug)}
                  className={`cursor-pointer hover:scale-105 transition-transform ${getChipClasses(mainCat.color, isSelected)}`}
                >
                  {subcategory.label}
                </Chip>
              )
            })}
          </div>
        </div>
      )}

      {/* All Categories by Main Category - Fixed Height Container */}
      <div className="space-y-4 h-96 overflow-y-auto pr-2">
        {filteredCategoriesByMainCategory.map(mainCat => {
          const Icon = mainCat.icon

          return (
            <div key={mainCat.id} className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{mainCat.title}</span>
              </p>
              <div className="flex flex-wrap gap-2 pl-6">
                {mainCat.subcategories.map(subcategory => {
                  const isSelected = selectedCategories.includes(subcategory.slug)

                  return (
                    <Chip
                      key={subcategory.slug}
                      variant={isSelected ? 'solid' : 'flat'}
                      onClick={() => toggleCategory(subcategory.slug)}
                      className={`cursor-pointer hover:scale-105 transition-transform ${getChipClasses(mainCat.color, isSelected)}`}
                    >
                      {subcategory.label}
                    </Chip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {t('profile.serviceCategories.selected', 'Selected')} ({selectedCategories.length}/{maxSelections})
            </p>
            <button
              onClick={() => onChange([])}
              className="text-xs text-gray-500 hover:text-primary underline"
            >
              {t('profile.serviceCategories.clearAll', 'Clear all')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(categorySlug => {
              const mainCat = getMainCategoryForSubcategory(categorySlug)

              return (
                <Chip
                  key={categorySlug}
                  onClose={() => removeCategory(categorySlug)}
                  variant="solid"
                  className={`shadow-sm ${getChipClasses(mainCat.color, true)}`}
                >
                  {getCategoryLabelBySlug(categorySlug, t)}
                </Chip>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
