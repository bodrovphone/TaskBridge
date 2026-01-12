'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Divider } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { FileText, Edit, X, Save, Sparkles, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button as RadixButton } from '@/components/ui/button'
import { ServiceCategoriesSelector } from '../service-categories-selector'
import { getCategoryColor } from '@/lib/utils/category'
import { getSubcategoryBySlug } from '@/features/categories/lib/subcategories'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { cn } from '@/lib/utils'

interface ServiceCategoriesSectionProps {
  serviceCategories: string[]
  onSave: (data: string[]) => void
  /** Section ID for scroll targeting */
  sectionId?: string
  /** Whether this section should be highlighted as incomplete */
  isHighlighted?: boolean
  /** Suggested categories based on professional title (auto-matched) */
  suggestedCategories?: string[]
  /** Whether categories were just auto-applied (shows confirmation banner) */
  wasAutoApplied?: boolean
  /** Callback to dismiss the auto-applied banner */
  onAutoAppliedDismiss?: () => void
}

export function ServiceCategoriesSection({
  serviceCategories,
  onSave,
  sectionId,
  isHighlighted = false,
  suggestedCategories = [],
  wasAutoApplied = false,
  onAutoAppliedDismiss
}: ServiceCategoriesSectionProps) {
  const t = useTranslations()
  const isMobile = useIsMobile()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempCategories, setTempCategories] = useState<string[]>([])

  const openModal = () => {
    setTempCategories(serviceCategories)
    setIsModalOpen(true)
  }

  const saveModal = () => {
    onSave(tempCategories)
    setIsModalOpen(false)
  }

  const cancelModal = () => {
    setTempCategories([])
    setIsModalOpen(false)
  }

  // Accept all suggested categories with one click
  const handleAcceptSuggestions = () => {
    onSave(suggestedCategories)
  }

  // Check if we should show suggestions (has suggestions, no current categories)
  const showSuggestions = suggestedCategories.length > 0 && serviceCategories.length === 0

  return (
    <>
      <Card
        id={sectionId}
        className={`shadow-lg border bg-white/90 hover:shadow-xl transition-all duration-300 ${
          isHighlighted
            ? 'border-amber-300 ring-2 ring-amber-200 ring-offset-2'
            : 'border-gray-100/50'
        }`}
      >
        <CardHeader className={`border-b bg-gradient-to-r px-4 md:px-6 ${
          isHighlighted
            ? 'border-amber-200 from-amber-50/50 to-orange-50/30'
            : 'border-gray-100 from-gray-50/50 to-white'
        }`}>
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-100 flex-shrink-0">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {t('profile.professional.serviceCategories')}
              </h3>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 px-4 md:px-6 py-6">
          {serviceCategories.length > 0 ? (
            <div className="space-y-4">
              {/* Auto-applied confirmation banner */}
              {wasAutoApplied && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    {t('profile.professional.categoriesAutoAppliedCheck')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="warning"
                      onPress={openModal}
                      className="flex-1 sm:flex-initial"
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={onAutoAppliedDismiss}
                      className="flex-1 sm:flex-initial"
                    >
                      {t('profile.professional.looksGood')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Categories display */}
              <div className="flex flex-wrap gap-2">
                {serviceCategories.map(categorySlug => {
                  const categoryColor = getCategoryColor(categorySlug)
                  const subcategory = getSubcategoryBySlug(categorySlug)
                  const categoryName = subcategory ? t(subcategory.translationKey) : categorySlug
                  return (
                    <span
                      key={categorySlug}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border shadow-sm ${categoryColor}`}
                    >
                      {categoryName}
                    </span>
                  )
                })}
              </div>

              {/* Edit button at bottom */}
              <Divider className="my-4" />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  startContent={<Edit className="w-4 h-4 text-white" />}
                  onPress={openModal}
                  className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
                >
                  {t('common.edit')}
                </Button>
              </div>
            </div>
          ) : showSuggestions ? (
            // Suggestions banner - show when we have auto-matched categories from title
            <div className="text-center py-8 px-4 bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-xl border-2 border-emerald-200 overflow-hidden">
              <div className="space-y-4">
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  {t('profile.professional.suggestedCategories')}
                </h4>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  {t('profile.professional.suggestedCategoriesHelp')}
                </p>

                {/* Show suggested categories */}
                <div className="flex flex-wrap justify-center gap-2 py-2">
                  {suggestedCategories.map(categorySlug => {
                    const categoryColor = getCategoryColor(categorySlug)
                    const subcategory = getSubcategoryBySlug(categorySlug)
                    const categoryName = subcategory ? t(subcategory.translationKey) : categorySlug
                    return (
                      <span
                        key={categorySlug}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border shadow-sm ${categoryColor}`}
                      >
                        {categoryName}
                      </span>
                    )
                  })}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <Button
                    size="lg"
                    color="success"
                    onPress={handleAcceptSuggestions}
                    startContent={<Check className="w-5 h-5" />}
                    className="font-semibold shadow-lg"
                  >
                    {t('profile.professional.acceptSuggestions')}
                  </Button>
                  <Button
                    size="lg"
                    variant="bordered"
                    onPress={openModal}
                    className="font-semibold"
                  >
                    {t('profile.professional.chooseOther')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Empty state - Call to Action (no suggestions available)
            <div className="text-center py-10 px-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border-2 border-dashed border-blue-200 overflow-hidden">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  {t('profile.professional.addServiceCategories')}
                </h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                  {t('profile.professional.categoriesHelp')}
                </p>
                <div className="pt-2">
                  <Button
                    size="lg"
                    color="primary"
                    onPress={openModal}
                    className="font-semibold shadow-lg"
                  >
                    {t('profile.professional.selectCategories')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Service Categories Dialog - Radix UI */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && cancelModal()}>
        <DialogContent
          className={cn(
            "p-0 gap-0 bg-white dark:bg-gray-900 flex flex-col overflow-hidden",
            isMobile
              ? "h-full max-h-full w-full max-w-full rounded-none !inset-0 !translate-x-0 !translate-y-0"
              : "rounded-2xl max-h-[85vh] max-w-2xl"
          )}
          hideCloseButton
        >
          {/* Header */}
          <DialogHeader className="flex-shrink-0 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-200">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                {t('profile.professional.selectCategories')}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <ServiceCategoriesSelector
              selectedCategories={tempCategories}
              onChange={setTempCategories}
            />
          </div>

          {/* Footer - Fixed at bottom */}
          <DialogFooter className={cn(
            "flex-shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-6",
            isMobile ? "pb-safe" : ""
          )}>
            <div className="flex gap-3 w-full sm:w-auto sm:justify-end">
              <RadixButton
                variant="outline"
                onClick={cancelModal}
                className="flex-1 sm:flex-initial"
              >
                <X className="w-4 h-4 mr-2" />
                {t('common.cancel')}
              </RadixButton>
              <RadixButton
                onClick={saveModal}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('profile.serviceCategories.saveCategories')}
              </RadixButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
