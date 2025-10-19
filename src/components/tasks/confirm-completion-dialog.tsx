'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
  Textarea,
  Card,
  CardBody,
  Divider
} from '@nextui-org/react'
import { CheckCircle, XCircle, User, Briefcase, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ConfirmCompletionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onReject: (reason: string, description?: string) => void
  professionalName: string
  taskTitle: string
  isLoading?: boolean
}

export function ConfirmCompletionDialog({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  professionalName,
  taskTitle,
  isLoading = false
}: ConfirmCompletionDialogProps) {
  const { t } = useTranslation()
  const [isSatisfied, setIsSatisfied] = useState<'yes' | 'no' | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [rejectionDescription, setRejectionDescription] = useState('')

  const rejectionReasons = [
    { value: 'not_completed', label: t('taskCompletion.reject.notCompleted') },
    { value: 'poor_quality', label: t('taskCompletion.reject.poorQuality') },
    { value: 'different_scope', label: t('taskCompletion.reject.differentScope') },
    { value: 'other', label: t('taskCompletion.reject.other') }
  ]

  const handleConfirm = () => {
    onConfirm()
  }

  const handleReject = () => {
    if (!rejectionReason) return
    onReject(rejectionReason, rejectionDescription || undefined)
  }

  const handleClose = () => {
    // Reset form
    setIsSatisfied(null)
    setRejectionReason('')
    setRejectionDescription('')
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
          <span>{t('taskCompletion.confirmDialog.title')}</span>
        </ModalHeader>

        <ModalBody className="py-6">
          {/* Task Summary */}
          <Card className="shadow-sm bg-gray-50">
            <CardBody className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.confirmDialog.professional')}</p>
                  <p className="font-semibold text-gray-900">{professionalName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t('taskCompletion.confirmDialog.task')}</p>
                  <p className="font-semibold text-gray-900">{taskTitle}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Divider className="my-4" />

          {/* Satisfaction Question */}
          <div className="space-y-4">
            <p className="font-medium text-gray-900">
              {t('taskCompletion.confirmDialog.question')}
            </p>

            <RadioGroup
              value={isSatisfied}
              onValueChange={(value) => setIsSatisfied(value as 'yes' | 'no')}
              classNames={{
                wrapper: 'gap-3'
              }}
            >
              <Radio value="yes" className="w-full">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>{t('taskCompletion.confirmDialog.yes')}</span>
                </div>
              </Radio>
              <Radio value="no" className="w-full">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-danger" />
                  <span>{t('taskCompletion.confirmDialog.no')}</span>
                </div>
              </Radio>
            </RadioGroup>
          </div>

          {/* If satisfied - Show success message */}
          {isSatisfied === 'yes' && (
            <Card className="bg-success-50 border-success-200 border">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-success-900 mb-1">
                      {t('taskCompletion.confirmDialog.greatMessage')}
                    </p>
                    <p className="text-sm text-success-700">
                      {t('taskCompletion.confirmDialog.reviewReminder')}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* If not satisfied - Show rejection form */}
          {isSatisfied === 'no' && (
            <div className="space-y-4 p-4 bg-warning-50 rounded-lg border border-warning-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-warning-900">
                  {t('taskCompletion.reject.title')}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-700">{t('taskCompletion.reject.reason')}</p>
                <RadioGroup
                  value={rejectionReason}
                  onValueChange={setRejectionReason}
                  classNames={{
                    wrapper: 'gap-2'
                  }}
                >
                  {rejectionReasons.map((reason) => (
                    <Radio key={reason.value} value={reason.value} className="text-sm">
                      {reason.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t('taskCompletion.reject.explain')} ({t('common.optional')})
                </p>
                <Textarea
                  placeholder={t('taskCompletion.reject.explainPlaceholder')}
                  value={rejectionDescription}
                  onValueChange={setRejectionDescription}
                  minRows={3}
                  maxRows={5}
                />
              </div>

              <Card className="bg-blue-50 border-blue-200 border">
                <CardBody className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900">
                      {t('taskCompletion.reject.disclaimer')}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={handleClose}
            isDisabled={isLoading}
          >
            {t('common.cancel')}
          </Button>

          {isSatisfied === 'yes' && (
            <Button
              color="success"
              startContent={<CheckCircle className="w-4 h-4" />}
              onPress={handleConfirm}
              isLoading={isLoading}
            >
              {t('taskCompletion.confirmCompletion')}
            </Button>
          )}

          {isSatisfied === 'no' && (
            <Button
              color="warning"
              startContent={<XCircle className="w-4 h-4" />}
              onPress={handleReject}
              isDisabled={!rejectionReason}
              isLoading={isLoading}
            >
              {t('taskCompletion.rejectCompletion')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
