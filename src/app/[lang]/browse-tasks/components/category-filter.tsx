'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent, Input } from '@nextui-org/react'
import { Grid3X3, ChevronDown, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { getMainCategoriesWithLabels, getCategoryLabelBySlug } from '@/features/categories'

interface CategoryFilterProps {
  value?: string
  onChange: (value?: string) => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get all main categories from centralized system
  const allCategories = useMemo(() => getMainCategoriesWithLabels(t), [t])

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories

    const lowerQuery = searchQuery.toLowerCase()
    return allCategories.filter(cat =>
      cat.title.toLowerCase().includes(lowerQuery) ||
      cat.description.toLowerCase().includes(lowerQuery)
    )
  }, [allCategories, searchQuery])

  const handleSelect = (categorySlug: string) => {
    if (value === categorySlug) {
      onChange(undefined) // Deselect if clicking same category
    } else {
      onChange(categorySlug)
    }
    setSearchQuery('') // Reset search on selection
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return t('browseTasks.filters.category', 'Category')
    return getCategoryLabelBySlug(value, t)
  }

  // Color mapping for category pill backgrounds
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-700',
      orange: 'bg-orange-100 text-orange-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      indigo: 'bg-indigo-100 text-indigo-700',
      pink: 'bg-pink-100 text-pink-700',
    }
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-700'
  }

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<Grid3X3 className="w-4 h-4" />}
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
      <PopoverContent className="w-96 p-3">
        <div className="space-y-2">
          {/* Search Input */}
          <Input
            placeholder={t('browseTasks.filters.searchCategory', 'Search categories...')}
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            size="sm"
            classNames={{
              base: 'mb-2',
            }}
          />

          {/* Categories List */}
          <div className="max-h-96 overflow-y-auto space-y-1">
            {filteredCategories.map((category) => {
              const Icon = category.icon
              const isSelected = value === category.slug

              return (
                <Button
                  key={category.slug}
                  variant="light"
                  className={`w-full justify-start h-auto py-3 ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  startContent={
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : getColorClasses(category.color)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  }
                  onPress={() => handleSelect(category.slug)}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{category.title}</span>
                    <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {category.description}
                    </span>
                  </div>
                </Button>
              )
            })}

            {filteredCategories.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-4">
                {t('browseTasks.filters.noCategoriesFound', 'No categories found')}
              </div>
            )}
          </div>

          {value && (
            <>
              <div className="border-t border-divider my-2" />
              <Button
                variant="light"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onPress={() => {
                  onChange(undefined)
                  setSearchQuery('')
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
