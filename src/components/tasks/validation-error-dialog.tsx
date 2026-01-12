'use client'

import { useTranslations } from 'next-intl'
import { AlertCircle } from 'lucide-react'
import { Button } from '@heroui/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface ValidationError {
  field: string
  message: string
}

interface ValidationErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  errors: ValidationError[]
  onFixClick: () => void
}

export function ValidationErrorDialog({ isOpen, onClose, errors, onFixClick }: ValidationErrorDialogProps) {
  const t = useTranslations()

  const handleFixClick = () => {
    onClose()
    onFixClick()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border border-orange-200 p-0 gap-0 bg-white" hideCloseButton>
        <DialogHeader className="bg-white border-b border-orange-100 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                {t('createTask.validationDialog.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {t('createTask.validationDialog.subtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 bg-white">
          <ul className="space-y-3">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-6 h-6 bg-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {t(`createTask.validationDialog.fieldName.${error.field}` as any)}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {t(error.message as any)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="bg-white border-t border-gray-100 p-4 sm:p-6">
          <Button
            color="warning"
            variant="flat"
            onPress={handleFixClick}
            size="lg"
            className="w-full font-semibold"
          >
            {t('createTask.validationDialog.fixButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
