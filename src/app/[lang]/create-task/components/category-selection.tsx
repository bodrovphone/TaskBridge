'use client'

import { useTranslations } from 'next-intl'
import { Card, CardBody, Chip, Input } from '@heroui/react'
import { Badge as ShadcnBadge } from '@/components/ui/badge'
import { useState, useMemo, useCallback } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAIN_CATEGORIES, getSubcategoriesByMainCategory, getMainCategoriesWithSubcategories, getSubcategoryBySlug } from '@/features/categories'
import MainCategoryCard from '@/components/ui/main-category-card'

interface CategorySelectionProps {
 form: any
 // eslint-disable-next-line no-unused-vars
 onCategoryChange: (category: string) => void
}

export function CategorySelection({ form, onCategoryChange }: CategorySelectionProps) {
 const t = useTranslations()
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null)
 const [selectedCategory, setSelectedCategory] = useState('')

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
 const subcategories = useMemo(() => {
  return selectedMainCategory
   ? getSubcategoriesByMainCategory(selectedMainCategory)
   : []
 }, [selectedMainCategory])

 // Get all subcategories for search
 const allSubcategories = useMemo(() => {
  return MAIN_CATEGORIES.flatMap(mainCat =>
   getSubcategoriesByMainCategory(mainCat.id)
  )
 }, [])

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

 const handleSubcategorySelect = useCallback((slug: string) => {
  // Get subcategory to find its main category
  const subcategory = getSubcategoryBySlug(slug)

  if (subcategory) {
   // Save main category to 'category' field
   form.setFieldValue('category', subcategory.mainCategoryId)
   // Save subcategory to 'subcategory' field
   form.setFieldValue('subcategory', slug)
   setSelectedCategory(slug)
   onCategoryChange(slug)
  }

  setSearchQuery('') // Clear search after selection
 }, [form, onCategoryChange])

 const handleReset = useCallback(() => {
  setSelectedMainCategory(null)
  form.setFieldValue('category', '')
  form.setFieldValue('subcategory', '')
  setSelectedCategory('')
  onCategoryChange('')
  setSearchQuery('')
 }, [form, onCategoryChange])

 return (
  <div className="space-y-6">
   {/* Section Header */}
   <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
     {t('createTask.category.title')}
    </h2>
    <p className="text-gray-600">
     {selectedCategory
      ? t('createTask.category.categorySelected')
      : selectedMainCategory
       ? t('createTask.category.selectSubcategory')
       : t('createTask.category.subtitle')
     }
    </p>
   </div>

   {/* Search Input - Smoothly hide when category is selected */}
   <AnimatePresence>
    {!selectedCategory && (
     <motion.div
      initial={{ opacity: 1, height: 'auto' }}
      exit={{
       opacity: 0,
       height: 0,
       marginBottom: 0,
       transition: {
        height: { duration: 0.5, ease: 'easeInOut' },
        opacity: { duration: 0.4, ease: 'easeOut' }
       }
      }}
      style={{ overflow: 'hidden' }}
     >
      <Card className="bg-white/98 shadow-lg border-0">
       <CardBody className="p-4">
        <div className="relative group">
         <Input
          size="lg"
          placeholder={t('professionals.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
     </motion.div>
    )}
   </AnimatePresence>

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
      {t('createTask.category.backToMain')}
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
           {searchResults.length} {t('professionals.categoryResults')}
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
        /* Show main categories - 2 columns above 520px, 1 on mobile */
        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-8">
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
          {t('professionals.noResults')}
         </h3>
         <p className="text-gray-600">
          {t('createTask.category.tryDifferent')}
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
          {t('professionals.noResults')}
         </h3>
         <p className="text-gray-600">
          {t('createTask.category.tryDifferent')}
         </p>
        </motion.div>
       )}
      </motion.div>
     )}
    </AnimatePresence>
   )}

   {/* Selected Category Display - Styled badge with animated close button */}
   {selectedCategory && (
    <motion.div
     initial={{ opacity: 0, scale: 0.8, y: 10 }}
     animate={{ opacity: 1, scale: 1, y: 0 }}
     transition={{
      duration: 0.3,
      ease: "easeOut",
      type: "spring",
      stiffness: 100
     }}
     whileHover={{ scale: 1.05, y: -1 }}
     whileTap={{ scale: 0.95 }}
     className="flex justify-start"
    >
     <ShadcnBadge className="group flex items-center gap-2.5 bg-white text-blue-900 border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md cursor-pointer">
      <span className="text-sm leading-none">
       {(() => {
        // Find the selected subcategory to get its translation key
        const allSubs = MAIN_CATEGORIES.flatMap(mainCat =>
         getSubcategoriesByMainCategory(mainCat.id)
        )
        const selectedSub = allSubs.find(sub => sub.slug === selectedCategory)
        return selectedSub ? t(selectedSub.translationKey) : selectedCategory
       })()}
      </span>
      <motion.div
       whileHover={{ scale: 1.3, rotate: 90 }}
       whileTap={{ scale: 0.8 }}
       transition={{ duration: 0.2 }}
       className="flex items-center justify-center w-5 h-5 bg-blue-100 hover:bg-red-100 rounded-full border border-blue-200 hover:border-red-200 transition-all duration-200"
      >
       <X
        size={12}
        className="text-blue-600 hover:text-red-600 transition-colors duration-200"
        onClick={(e) => {
         e.stopPropagation();
         handleReset();
        }}
       />
      </motion.div>
     </ShadcnBadge>
    </motion.div>
   )}
  </div>
 )
}
