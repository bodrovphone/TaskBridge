'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Textarea,
  Card,
  CardBody,
  Divider
} from '@nextui-org/react'
import { CheckCircle, Upload, X, User, DollarSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface MarkCompletedDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: CompletionData) => void
  taskTitle: string
  customerName: string
  payment: string
  isLoading?: boolean
}

interface CompletionData {
  requirementsCompleted: boolean
  customerSatisfied: boolean
  completionPhotos: File[]
  notes?: string
}

export function MarkCompletedDialog({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  customerName,
  payment,
  isLoading = false
}: MarkCompletedDialogProps) {
  const { t } = useTranslation()
  const [requirementsCompleted, setRequirementsCompleted] = useState(false)
  const [customerSatisfied, setCustomerSatisfied] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [notes, setNotes] = useState('')

  const canSubmit = requirementsCompleted && customerSatisfied

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files].slice(0, 5)) // Max 5 photos
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    if (!canSubmit) return

    onConfirm({
      requirementsCompleted,
      customerSatisfied,
      completionPhotos: photos,
      notes: notes || undefined
    })
  }

  const handleClose = () => {
    // Reset form
    setRequirementsCompleted(false)
    setCustomerSatisfied(false)
    setPhotos([])
    setNotes('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white',
        header: 'border-b border-gray-200',
        footer: 'border-t border-gray-200'
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          <span>{t('taskCompletion.markDialog.title')}</span>
        </ModalHeader>

        <ModalBody className="py-6">
          {/* Task Summary */}
          <Card className="shadow-sm bg-gray-50">
            <CardBody className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.markDialog.task')}</p>
                  <p className="font-semibold text-gray-900">{taskTitle}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.markDialog.customer')}</p>
                  <p className="font-semibold text-gray-900">{customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.markDialog.payment')}</p>
                  <p className="font-semibold text-gray-900">{payment}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Divider className="my-4" />

          {/* Completion Checklist */}
          <div className="space-y-4">
            <p className="font-medium text-gray-900">
              {t('taskCompletion.markDialog.question')}
            </p>

            <div className="space-y-3">
              <Checkbox
                isSelected={requirementsCompleted}
                onValueChange={setRequirementsCompleted}
                classNames={{
                  wrapper: 'after:bg-success after:text-white'
                }}
              >
                <span className="text-sm">{t('taskCompletion.markDialog.checkRequirements')}</span>
              </Checkbox>

              <Checkbox
                isSelected={customerSatisfied}
                onValueChange={setCustomerSatisfied}
                classNames={{
                  wrapper: 'after:bg-success after:text-white'
                }}
              >
                <span className="text-sm">{t('taskCompletion.markDialog.checkSatisfied')}</span>
              </Checkbox>
            </div>
          </div>

          <Divider className="my-4" />

          {/* Optional: Completion Photos */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              {t('taskCompletion.markDialog.photos')}
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="completion-photos"
              disabled={photos.length >= 5}
            />

            <label htmlFor="completion-photos">
              <Button
                as="span"
                variant="bordered"
                startContent={<Upload className="w-4 h-4" />}
                className="cursor-pointer"
                isDisabled={photos.length >= 5}
              >
                {t('taskCompletion.markDialog.addPhotos')} ({photos.length}/5)
              </Button>
            </label>

            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Completion photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional: Notes */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              {t('taskCompletion.markDialog.notes')} ({t('common.optional')})
            </p>
            <Textarea
              placeholder={t('taskCompletion.markDialog.notesPlaceholder')}
              value={notes}
              onValueChange={setNotes}
              minRows={3}
              maxRows={5}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={handleClose}
            isDisabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            color="success"
            startContent={<CheckCircle className="w-4 h-4" />}
            onPress={handleConfirm}
            isDisabled={!canSubmit}
            isLoading={isLoading}
          >
            {t('taskCompletion.markCompleted')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
