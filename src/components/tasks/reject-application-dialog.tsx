'use client'

import { Application } from '@/types/applications'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio
} from '@nextui-org/react'
import { XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

interface RejectApplicationDialogProps {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string, reason?: string) => void
}

export default function RejectApplicationDialog({
  application,
  isOpen,
  onClose,
  onConfirm
}: RejectApplicationDialogProps) {
  const { t } = useTranslation()
  const [selectedReason, setSelectedReason] = useState<string>('')

  if (!application) return null

  const { professional } = application

  const rejectionReasons = [
    { value: 'better-fit', label: t('rejectApplication.reasons.betterFit') },
    { value: 'price-high', label: t('rejectApplication.reasons.priceHigh') },
    { value: 'timeline-issue', label: t('rejectApplication.reasons.timelineIssue') },
    { value: 'changed-mind', label: t('rejectApplication.reasons.changedMind') },
    { value: 'other', label: t('rejectApplication.reasons.other') }
  ]

  const handleConfirm = () => {
    onConfirm(application.id, selectedReason || undefined)
    // Reset reason for next time
    setSelectedReason('')
  }

  const handleClose = () => {
    // Reset reason when closing
    setSelectedReason('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      scrollBehavior="inside"
      classNames={{
        base: 'max-h-[85vh] mx-4',
        body: 'py-4',
        footer: 'border-t border-gray-100'
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold">{t('rejectApplication.title')}</h2>
              </div>
            </ModalHeader>

            <ModalBody className="gap-4">
              <p className="text-sm text-gray-600">
                {t('rejectApplication.description', { name: professional.name })}
              </p>

              {/* Optional Reason Selection */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-gray-700">
                  {t('rejectApplication.reasonTitle')}
                </h4>

                <RadioGroup
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                  classNames={{
                    wrapper: 'gap-2'
                  }}
                >
                  {rejectionReasons.map((reason) => (
                    <Radio
                      key={reason.value}
                      value={reason.value}
                      classNames={{
                        label: 'text-sm',
                        wrapper: 'group-data-[selected=true]:border-red-500',
                        control: 'bg-red-500'
                      }}
                    >
                      {reason.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>

              {/* Compact Info Notice */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  {t('rejectApplication.note', { name: professional.name })}
                </p>
              </div>
            </ModalBody>

            <ModalFooter className="pt-3">
              <Button variant="bordered" size="sm" onPress={handleClose}>
                {t('rejectApplication.cancel')}
              </Button>
              <Button
                color="danger"
                size="sm"
                onPress={handleConfirm}
              >
                {t('rejectApplication.confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
