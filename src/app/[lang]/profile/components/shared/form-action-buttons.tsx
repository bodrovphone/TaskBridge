'use client'

import { Button } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { X, Save } from 'lucide-react'

interface FormActionButtonsProps {
  onCancel: () => void
  onSave: () => void
  isLoading?: boolean
  isDisabled?: boolean
  saveLabel?: string
  cancelLabel?: string
}

/**
 * Shared component for Save and Cancel buttons in profile forms.
 * Provides consistent styling and i18n across all profile sections.
 */
export function FormActionButtons({
  onCancel,
  onSave,
  isLoading = false,
  isDisabled = false,
  saveLabel,
  cancelLabel,
}: FormActionButtonsProps) {
  const t = useTranslations()

  return (
    <div className="flex justify-end gap-3">
      <Button
        variant="bordered"
        size="sm"
        startContent={<X className="w-4 h-4" />}
        onPress={onCancel}
        isDisabled={isLoading || isDisabled}
        className="font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700"
      >
        {cancelLabel || t('common.cancel')}
      </Button>
      <Button
        size="sm"
        startContent={!isLoading && <Save className="w-4 h-4" />}
        onPress={onSave}
        isLoading={isLoading}
        isDisabled={isDisabled}
        className="font-semibold border-2 border-emerald-600 bg-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 text-white shadow-md"
      >
        {isLoading
          ? t('common.saving')
          : saveLabel || t('common.save')}
      </Button>
    </div>
  )
}
