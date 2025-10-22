'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip, Input } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { getCategoryLabelBySlug } from '@/features/categories'

interface ServiceCategoriesSelectorProps {
 selectedCategories: string[] // Category slugs
 onChange: (categories: string[]) => void
 maxSelections?: number
}

// Grouped categories matching PRD structure with color theming
const CATEGORY_GROUPS = {
 'home_repair': {
  labelKey: 'categoryGroups.homeRepair',
  icon: '🏠',
  color: 'bg-blue-500' as const,
  chipColor: 'primary' as const,
  chipClass: 'bg-blue-100 text-blue-700 border-blue-300',
  categories: ['plumbing', 'electrical', 'hvac', 'carpentry', 'painting', 'flooring', 'roofing', 'home_renovation', 'appliance_repair', 'handyman']
 },
 'cleaning': {
  labelKey: 'categoryGroups.cleaning',
  icon: '🧹',
  color: 'bg-green-500' as const,
  chipColor: 'success' as const,
  chipClass: 'bg-green-100 text-green-700 border-green-300',
  categories: ['house_cleaning', 'deep_cleaning', 'carpet_cleaning', 'window_cleaning', 'garden_maintenance', 'landscaping']
 },
 'delivery_transport': {
  labelKey: 'categoryGroups.deliveryTransport',
  icon: '🚚',
  color: 'bg-orange-500' as const,
  chipColor: 'warning' as const,
  chipClass: 'bg-orange-100 text-orange-700 border-orange-300',
  categories: ['delivery', 'moving', 'taxi_driver', 'courier']
 },
 'personal_care': {
  labelKey: 'categoryGroups.personalCare',
  icon: '🐕',
  color: 'bg-pink-500' as const,
  chipColor: 'secondary' as const,
  chipClass: 'bg-pink-100 text-pink-700 border-pink-300',
  categories: ['babysitting', 'elderly_care', 'pet_sitting']
 },
 'professional': {
  labelKey: 'categoryGroups.professional',
  icon: '💼',
  color: 'bg-purple-500' as const,
  chipColor: 'secondary' as const,
  chipClass: 'bg-purple-100 text-purple-700 border-purple-300',
  categories: ['tutoring', 'translation', 'accounting', 'legal_services', 'consulting', 'personal_trainer', 'massage_therapy']
 },
 'creative': {
  labelKey: 'categoryGroups.creative',
  icon: '🎨',
  color: 'bg-indigo-500' as const,
  chipColor: 'primary' as const,
  chipClass: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  categories: ['graphic_design', 'web_development', 'photography', 'videography', 'writing', 'music_lessons']
 },
 'events': {
  labelKey: 'categoryGroups.events',
  icon: '🎉',
  color: 'bg-rose-500' as const,
  chipColor: 'danger' as const,
  chipClass: 'bg-rose-100 text-rose-700 border-rose-300',
  categories: ['event_planning', 'catering', 'dj_services']
 },
 'beauty': {
  labelKey: 'categoryGroups.beauty',
  icon: '💅',
  color: 'bg-fuchsia-500' as const,
  chipColor: 'secondary' as const,
  chipClass: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
  categories: ['hairdressing', 'makeup_artist', 'nail_services']
 },
 'other': {
  labelKey: 'categoryGroups.other',
  icon: '📦',
  color: 'bg-gray-500' as const,
  chipColor: 'default' as const,
  chipClass: 'bg-gray-100 text-gray-700 border-gray-300',
  categories: ['other']
 }
} as const

// Popular categories (most frequently used)
const POPULAR_CATEGORIES: string[] = [
 'house_cleaning',
 'plumbing',
 'electrical',
 'delivery',
 'babysitting',
 'tutoring',
 'moving',
 'handyman'
]

// Helper function to get category group info
const getCategoryGroupInfo = (category: string) => {
 for (const [groupKey, group] of Object.entries(CATEGORY_GROUPS)) {
  if ((group.categories as readonly string[]).includes(category)) {
   return group
  }
 }
 return CATEGORY_GROUPS.other
}

export function ServiceCategoriesSelector({
 selectedCategories,
 onChange,
 maxSelections = 10
}: ServiceCategoriesSelectorProps) {
 const { t } = useTranslation()
 const [searchQuery, setSearchQuery] = useState('')

 const toggleCategory = (category: string) => {
  if (selectedCategories.includes(category)) {
   onChange(selectedCategories.filter(c => c !== category))
  } else {
   if (selectedCategories.length < maxSelections) {
    onChange([...selectedCategories, category])
   }
  }
 }

 const removeCategory = (category: string) => {
  onChange(selectedCategories.filter(c => c !== category))
 }

 // Filter categories based on search
 const filteredGroups = useMemo(() => {
  if (!searchQuery.trim()) return CATEGORY_GROUPS

  const query = searchQuery.toLowerCase()
  const filtered: Record<string, any> = {}

  Object.entries(CATEGORY_GROUPS).forEach(([groupKey, group]) => {
   const matchingCategories = group.categories.filter(cat => {
    const label = getCategoryLabelBySlug(cat, t).toLowerCase()
    return label.includes(query)
   })

   if (matchingCategories.length > 0) {
    filtered[groupKey] = {
     ...group,
     categories: matchingCategories
    }
   }
  })

  return filtered
 }, [searchQuery, t])

 return (
  <div className="space-y-4">
   {/* Search Input */}
   <Input
    placeholder="Search categories..."
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
   {!searchQuery && (
    <div>
     <p className="text-sm font-medium text-gray-600 mb-2">Popular Categories</p>
     <div className="flex flex-wrap gap-2">
      {POPULAR_CATEGORIES.map(category => {
       const groupInfo = getCategoryGroupInfo(category)
       const isSelected = selectedCategories.includes(category)
       return (
        <Chip
         key={category}
         variant={isSelected ? 'solid' : 'flat'}
         color={isSelected ? groupInfo.chipColor : 'default'}
         onClick={() => toggleCategory(category)}
         className={`cursor-pointer hover:scale-105 transition-transform ${!isSelected ? groupInfo.chipClass : ''}`}
        >
         {getCategoryLabelBySlug(category, t)}
        </Chip>
       )
      })}
     </div>
    </div>
   )}

   {/* All Categories by Group - Fixed Height Container */}
   <div className="space-y-4 h-96 overflow-y-auto pr-2">
    {Object.entries(filteredGroups).map(([groupKey, group]) => (
     <div key={groupKey} className="space-y-2">
      <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
       <span>{group.icon}</span>
       <span>{t(group.labelKey)}</span>
      </p>
      <div className="flex flex-wrap gap-2 pl-6">
       {group.categories.map((category: string) => {
        const isSelected = selectedCategories.includes(category)
        return (
         <Chip
          key={category}
          variant={isSelected ? 'solid' : 'flat'}
          color={isSelected ? group.chipColor : 'default'}
          onClick={() => toggleCategory(category)}
          className={`cursor-pointer hover:scale-105 transition-transform ${!isSelected ? group.chipClass : ''}`}
         >
          {getCategoryLabelBySlug(category, t)}
         </Chip>
        )
       })}
      </div>
     </div>
    ))}
   </div>

   {/* Selected Categories */}
   {selectedCategories.length > 0 && (
    <div className="pt-4 border-t border-gray-200">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-700">
       Selected ({selectedCategories.length}/{maxSelections})
      </p>
      <button
       onClick={() => onChange([])}
       className="text-xs text-gray-500 hover:text-primary underline"
      >
       Clear all
      </button>
     </div>
     <div className="flex flex-wrap gap-2">
      {selectedCategories.map(category => {
       const groupInfo = getCategoryGroupInfo(category)
       return (
        <Chip
         key={category}
         onClose={() => removeCategory(category)}
         variant="solid"
         color={groupInfo.chipColor}
         className="shadow-sm"
        >
         {getCategoryLabelBySlug(category, t)}
        </Chip>
       )
      })}
     </div>
    </div>
   )}
  </div>
 )
}
