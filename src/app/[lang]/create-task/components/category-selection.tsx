'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, Chip, Input } from '@nextui-org/react'
import { UseFormReturn } from 'react-hook-form'
import { CreateTaskFormData } from '../lib/validation'
import { useState, useMemo, useCallback } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAIN_CATEGORIES, SUBCATEGORIES, getSubcategoriesByMainCategory, getMainCategoryForSubcategory, getMainCategoriesWithSubcategories } from '@/features/categories'
import MainCategoryCard from '@/components/ui/main-category-card'

interface CategorySelectionProps {
 form: UseFormReturn<CreateTaskFormData>
}

export function CategorySelection({ form }: CategorySelectionProps) {
 const { t } = useTranslation()
 const { setValue, watch, formState: { errors } } = form
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null)

 const selectedCategory = watch('category')

 // Get main categories with subcategories - EXACT same pattern as categories page
 const mainCategories = useMemo(() => {
  return getMainCategoriesWithSubcategories(t).map(cat => ({
   title: cat.title,
   description: cat.description,
   icon: cat.icon,
   color: cat.color,
   totalCount: cat.totalCount || 0,
   subcategories: cat.subcategories.map(sub => ({
    label: sub.label,
    value: sub.slug,
   })),
  }));
 }, [t])

 // Get subcategories for selected main category
 const subcategories = selectedMainCategory
  ? getSubcategoriesByMainCategory(selectedMainCategory)
  : []

 // Get all subcategories for search
 const allSubcategories = useMemo(() => {
  return MAIN_CATEGORIES.flatMap(mainCat =>
   getSubcategoriesByMainCategory(mainCat.id)
  )
 }, [])

 // Filter main categories and subcategories based on search
 const filteredMainCategories = useMemo(() => {
  if (!searchQuery.trim()) return MAIN_CATEGORIES

  // If searching, find matching main categories OR main categories that have matching subcategories
  const matchingMainCategories = MAIN_CATEGORIES.filter(cat =>
   t(`${cat.translationKey}.title`).toLowerCase().includes(searchQuery.toLowerCase()) ||
   cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Also include main categories that have matching subcategories
  const categoriesWithMatchingSubs = MAIN_CATEGORIES.filter(mainCat => {
   const subs = getSubcategoriesByMainCategory(mainCat.id)
   return subs.some(sub =>
    t(sub.translationKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.slug.toLowerCase().includes(searchQuery.toLowerCase())
   )
  })

  // Combine and deduplicate
  const combined = [...matchingMainCategories, ...categoriesWithMatchingSubs]
  return Array.from(new Set(combined.map(c => c.id))).map(id =>
   MAIN_CATEGORIES.find(c => c.id === id)!
  )
 }, [searchQuery, t])

 // Filter subcategories based on search
 const filteredSubcategories = useMemo(() => {
  if (!searchQuery.trim()) return subcategories

  return subcategories.filter(cat =>
   t(cat.translationKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
   cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )
 }, [searchQuery, subcategories, t])

 // Show search results across all categories
 const searchResults = useMemo(() => {
  if (!searchQuery.trim()) return []

  return allSubcategories.filter(cat =>
   t(cat.translationKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
   cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 12) // Limit to 12 results
 }, [searchQuery, allSubcategories, t])

 const handleMainCategorySelect = useCallback((categoryId: string) => {
  setSelectedMainCategory(categoryId)
  setSearchQuery('') // Clear search when selecting main category
 }, [])

 const handleSubcategorySelect = useCallback((slug: string) => {
  setValue('category', slug, { shouldValidate: true })
  setSearchQuery('') // Clear search after selection
 }, [setValue])

 const handleReset = useCallback(() => {
  setSelectedMainCategory(null)
  setValue('category', '', { shouldValidate: true })
  setSearchQuery('')
 }, [setValue])

 // Get the main category for the selected subcategory (for display)
 const selectedMainCategoryData = selectedCategory
  ? getMainCategoryForSubcategory(selectedCategory)
  : null

 return (
  <div className="space-y-6">
   {/* Section Header */}
   <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
     {t('createTask.category.title', 'What type of service do you need?')}
    </h2>
    <p className="text-gray-600">
     {selectedCategory
      ? t('createTask.category.categorySelected', 'Selected category. Click the X to change.')
      : selectedMainCategory
       ? t('createTask.category.selectSubcategory', 'Select a specific service')
       : t('createTask.category.subtitle', 'Select the category that best describes your task')
     }
    </p>
   </div>

   {/* Search Input - Disabled when category is selected to avoid CLS */}
   <Card className="bg-white/98 shadow-lg border-0">
    <CardBody className="p-4">
     <div className="relative group">
      <Input
       size="lg"
       placeholder={t('professionals.searchPlaceholder', 'Search categories... (e.g. repair, cleaning, lessons)')}
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       isDisabled={!!selectedCategory}
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
        searchQuery && !selectedCategory && (
         <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSearchQuery('')}
          className="text-gray-400 hover:text-gray-600"
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
     </div>
    </CardBody>
   </Card>

   {/* Breadcrumb / Back Navigation */}
   {selectedMainCategory && !selectedCategory && (
    <motion.div
     initial={{ opacity: 0, y: -10 }}
     animate={{ opacity: 1, y: 0 }}
     className="flex items-center gap-2"
    >
     <button
      onClick={handleReset}
      className="text-sm text-primary hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
     >
      <X size={16} />
      {t('createTask.category.backToMain', 'Back to main categories')}
     </button>
     <ChevronRight size={16} className="text-gray-400" />
     {(() => {
      const mainCat = MAIN_CATEGORIES.find(c => c.id === selectedMainCategory)
      const Icon = mainCat?.icon
      return (
       <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-primary" />}
        {t(`${mainCat?.translationKey}.title` || '')}
       </span>
      )
     })()}
    </motion.div>
   )}

   {/* Category Display - Hide when category is selected */}
   {!selectedCategory && (
    <AnimatePresence mode="wait">
     {!selectedMainCategory ? (
      /* Main Categories Grid OR Search Results */
      <motion.div
       key="main-categories"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -20 }}
       transition={{ duration: 0.3 }}
      >
       {searchQuery && searchResults.length > 0 ? (
        /* Show subcategory search results as chips */
        <>
         <div className="mb-4">
          <p className="text-sm text-gray-600">
           {searchResults.length} {t('professionals.categoryResults', 'categories found')}
          </p>
         </div>
         <div className="flex flex-wrap gap-3">
          {searchResults.map((category, index) => {
           const isSelected = selectedCategory === category.slug

           return (
            <motion.div
             key={category.slug}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: index * 0.03, duration: 0.2 }}
            >
             <Chip
              size="lg"
              variant={isSelected ? "solid" : "bordered"}
              color={isSelected ? "primary" : "default"}
              className={`cursor-pointer transition-all px-4 py-6 ${
               isSelected
                ? 'shadow-lg'
                : 'hover:border-primary/50 hover:shadow-md'
              }`}
              onClick={() => handleSubcategorySelect(category.slug)}
             >
              <span className="font-semibold text-base">{t(category.translationKey)}</span>
             </Chip>
            </motion.div>
           )
          })}
         </div>
        </>
       ) : !searchQuery && mainCategories.length > 0 ? (
        /* Show main categories - 2 columns on desktop, 1 on mobile */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {mainCategories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
           >
            <MainCategoryCard
             title={category.title}
             description={category.description}
             icon={category.icon}
             color={category.color}
             subcategories={category.subcategories}
             totalCount={category.totalCount}
             onSubcategoryClick={handleSubcategorySelect}
             showFooter={false}
            />
           </motion.div>
         ))}
        </div>
       ) : (
        <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="text-center py-12"
        >
         <div className="text-6xl mb-4">🔍</div>
         <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('professionals.noResults', 'No categories match your search')}
         </h3>
         <p className="text-gray-600">
          {t('createTask.category.tryDifferent', 'Try a different search term')}
         </p>
        </motion.div>
       )}
      </motion.div>
     ) : (
      /* Subcategories Chips */
      <motion.div
       key="subcategories"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -20 }}
       transition={{ duration: 0.3 }}
      >
       {filteredSubcategories.length > 0 ? (
        <div className="flex flex-wrap gap-3">
         {filteredSubcategories.map((category, index) => {
          const isSelected = selectedCategory === category.slug

          return (
           <motion.div
            key={category.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
           >
            <Chip
             size="lg"
             variant={isSelected ? "solid" : "bordered"}
             color={isSelected ? "primary" : "default"}
             className={`cursor-pointer transition-all px-4 py-6 ${
              isSelected
               ? 'shadow-lg'
               : 'hover:border-primary/50 hover:shadow-md'
             }`}
             onClick={() => handleSubcategorySelect(category.slug)}
            >
             <span className="font-semibold text-base">{t(category.translationKey)}</span>
            </Chip>
           </motion.div>
          )
         })}
        </div>
       ) : (
        <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="text-center py-12"
        >
         <div className="text-6xl mb-4">🔍</div>
         <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('professionals.noResults', 'No services match your search')}
         </h3>
         <p className="text-gray-600">
          {t('createTask.category.tryDifferent', 'Try a different search term')}
         </p>
        </motion.div>
       )}
      </motion.div>
     )}
    </AnimatePresence>
   )}

   {/* Selected Category Display - Simple chip with close icon */}
   {selectedCategory && (
    <motion.div
     initial={{ opacity: 0, scale: 0.9 }}
     animate={{ opacity: 1, scale: 1 }}
     transition={{ duration: 0.2 }}
     className="flex justify-start"
    >
     <Chip
      size="lg"
      variant="solid"
      color="primary"
      endContent={
       <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleReset}
        className="ml-2 rounded-full p-1 bg-white/20 hover:bg-white/30"
        type="button"
        aria-label="Remove category"
       >
        <X size={16} className="text-white" />
       </motion.button>
      }
      classNames={{
       base: "px-6 py-7 shadow-lg !bg-blue-600 hover:!bg-blue-700",
       content: "font-semibold text-lg !text-white"
      }}
     >
      {(() => {
       // Find the selected subcategory to get its translation key
       const allSubs = MAIN_CATEGORIES.flatMap(mainCat =>
        getSubcategoriesByMainCategory(mainCat.id)
       )
       const selectedSub = allSubs.find(sub => sub.slug === selectedCategory)
       return selectedSub ? t(selectedSub.translationKey) : selectedCategory
      })()}
     </Chip>
    </motion.div>
   )}

   {/* Error Message */}
   {errors.category && (
    <p className="text-danger text-sm text-center">
     {t(errors.category.message as string)}
    </p>
   )}
  </div>
 )
}
