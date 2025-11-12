'use client'

import { useTranslation } from 'react-i18next'
import { Chip } from '@nextui-org/react'
import { getCategoryName } from '@/lib/utils/category'

interface CategoryDisplayProps {
  category: string
  subcategory?: string
  onReset: () => void
}

export function CategoryDisplay({ category, subcategory, onReset }: CategoryDisplayProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('createTask.category.title', 'What type of service do you need?')}
        </h2>
        <p className="text-gray-600">
          {t('createTask.category.categorySelected', 'Selected category. Click the X to change.')}
        </p>
      </div>

      {/* Selected Category Chip */}
      <div className="flex items-center">
        <Chip
          size="lg"
          variant="bordered"
          color="primary"
          onClose={onReset}
          classNames={{
            base: "px-4 py-6",
            content: "text-base font-medium",
            closeButton: "text-gray-500 hover:text-gray-700"
          }}
        >
          {getCategoryName(t, category, subcategory)}
        </Chip>
      </div>
    </div>
  )
}
