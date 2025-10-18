'use client'

import { useState } from 'react'
import { MyApplication } from '../lib/types'
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
import { FileX, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface WithdrawDialogProps {
  application: MyApplication | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (applicationId: string, reason?: string) => void
}

export default function WithdrawDialog({
  application,
  isOpen,
  onClose,
  onConfirm
}: WithdrawDialogProps) {
  const { t } = useTranslation()
  const [selectedReason, setSelectedReason] = useState<string>('')

  if (!application) return null

  const withdrawalReasons = [
    { value: 'unavailable', label: t('myApplications.withdrawDialog.reasonUnavailable') },
    { value: 'found-work', label: t('myApplications.withdrawDialog.reasonFoundWork') },
    { value: 'changed', label: t('myApplications.withdrawDialog.reasonChanged') },
    { value: 'price-low', label: t('myApplications.withdrawDialog.reasonPrice') },
    { value: 'other', label: t('myApplications.withdrawDialog.reasonOther') }
  ]

  const handleConfirm = () => {
    onConfirm(application.id, selectedReason || undefined)
    setSelectedReason('')
  }

  const handleClose = () => {
    setSelectedReason('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      classNames={{
        base: 'max-h-[90vh]',
        body: 'py-6'
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <FileX className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold">
                  {t('myApplications.withdrawDialog.title')}
                </h2>
              </div>
            </ModalHeader>

            <ModalBody>
              {/* Task Info */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="font-semibold text-gray-900 mb-1">
                  {application.task.title}
                </div>
                <div className="text-sm text-gray-600">
                  Customer: {application.customer.name}
                </div>
                <div className="text-sm text-gray-600">
                  Your Quote: {application.myProposal.price} {application.myProposal.currency}
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">{t('important')}:</span> This action cannot be undone. Once you withdraw your application, you won't be able to re-apply to this task.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <h4 className="font-semibold text-base mb-3">
                  {t('myApplications.withdrawDialog.reason')}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Providing a reason helps us improve the platform.
                </p>

                <RadioGroup
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                  classNames={{
                    wrapper: 'gap-3'
                  }}
                >
                  {withdrawalReasons.map((reason) => (
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
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={handleClose}>
                {t('myApplications.withdrawDialog.cancel')}
              </Button>
              <Button
                color="danger"
                onPress={handleConfirm}
                startContent={<FileX className="w-4 h-4" />}
              >
                {t('myApplications.withdrawDialog.confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
