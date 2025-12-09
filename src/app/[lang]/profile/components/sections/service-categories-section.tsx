'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { FileText, Edit, X, Save } from 'lucide-react'
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
}

export function ServiceCategoriesSection({
  serviceCategories,
  onSave,
  sectionId,
  isHighlighted = false
}: ServiceCategoriesSectionProps) {
  const { t } = useTranslation()
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
            {serviceCategories.length > 0 && (
              <Button
                size="sm"
                startContent={<Edit className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                onPress={openModal}
                className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 flex-shrink-0 text-xs md:text-sm"
              >
                {t('common.edit', 'Edit')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="space-y-4 px-4 md:px-6 py-6">
          {serviceCategories.length > 0 ? (
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
          ) : (
            // Empty state - Call to Action
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
                {t('common.cancel', 'Cancel')}
              </RadixButton>
              <RadixButton
                onClick={saveModal}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('profile.serviceCategories.saveCategories', 'Save Categories')}
              </RadixButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
