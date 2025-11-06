'use client'

import { useTranslation } from 'react-i18next'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react'
import { AlertCircle } from 'lucide-react'

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
  const { t } = useTranslation()

  const handleFixClick = () => {
    onClose()
    onFixClick()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      placement="center"
      backdrop="opaque"
      classNames={{
        backdrop: 'bg-black/70',
        base: 'border-2 border-orange-400',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 bg-orange-50 border-b-2 border-orange-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('createTask.validationDialog.title', 'Please fix the following issues')}
                  </h3>
                  <p className="text-sm text-gray-700 font-normal">
                    {t('createTask.validationDialog.subtitle', 'Some fields need your attention')}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="pt-6 pb-4">
              <ul className="space-y-3">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t(`createTask.validationDialog.fieldName.${error.field}`, error.field)}
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {t(error.message, error.message)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ModalBody>
            <ModalFooter className="bg-gray-50 border-t border-gray-200">
              <Button
                color="warning"
                variant="shadow"
                onPress={handleFixClick}
                size="lg"
                className="w-full font-semibold"
              >
                {t('createTask.validationDialog.fixButton', 'Fix These Issues')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
