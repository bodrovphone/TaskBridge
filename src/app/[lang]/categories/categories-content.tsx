'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import MainCategoryCard from "@/components/ui/main-category-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { getMainCategoriesWithSubcategories } from '@/features/categories'
import { CategorySearch } from '@/components/common/category-search'
import { useCreateTask } from '@/hooks/use-create-task'
import AuthSlideOver from '@/components/ui/auth-slide-over'

export default function CategoriesContent() {
 const t = useTranslations()
 const router = useRouter()

 // Create task hook with auth
 const {
  handleCreateTask,
  showAuthPrompt,
  setShowAuthPrompt
 } = useCreateTask()

 // Get main categories with subcategories from centralized feature
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

 // Get locale from URL params
 const params = useParams()
 const locale = (params?.lang as string) || 'bg'

 // Handle category selection from search
 const handleCategorySelect = (slug: string) => {
  router.push(`/${locale}/professionals?category=${slug}`)
 }

 return (
  <div
   className="min-h-screen relative"
   style={{
    backgroundImage: 'url(/images/cardboard.png)',
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto'
   }}
  >
   {/* Subtle overlay */}
   <div className="absolute inset-0 bg-white/40 "></div>

   {/* Content */}
   <section className="py-16 relative">
    <div className="absolute inset-0 bg-white/50 "></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     {/* Header */}
     <div className="text-center space-y-4 mb-12">
      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
       {t('categories.pageTitle')}
      </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
       {t('categories.pageSubtitle')}
      </p>
     </div>

     {/* Smart Search Bar */}
     <div className="max-w-3xl mx-auto mb-12">
      <CategorySearch
       onCategorySelect={handleCategorySelect}
       placeholder={t('categories.searchPlaceholder')}
      />
     </div>

     {/* Main Categories Grid */}
     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {mainCategories.map((category) => (
       <MainCategoryCard
        key={category.title}
        title={category.title}
        description={category.description}
        icon={category.icon}
        color={category.color}
        subcategories={category.subcategories}
        totalCount={category.totalCount}
       />
      ))}
     </div>

     {/* CTA Section */}
     <div className="text-center mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
       {t('categories.ctaTitle')}
      </h2>
      <p className="text-lg text-gray-600 mb-6">
       {t('categories.ctaSubtitle')}
      </p>
      <Button
       size="lg"
       className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold"
       onClick={handleCreateTask}
      >
       {t('nav.createTask')} <ArrowRight className="ml-2" size={16} />
      </Button>
     </div>
    </div>
   </section>

   {/* Auth Slide Over */}
   <AuthSlideOver
    isOpen={showAuthPrompt}
    onClose={() => setShowAuthPrompt(false)}
    action="create-task"
   />
  </div>
 )
}
