'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
} from '@nextui-org/react'
import { CheckCircle, User, Briefcase, Star, PartyPopper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams, useRouter } from 'next/navigation'

interface ConfirmCompletionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<boolean> // Returns true on success
  professionalName: string
  taskTitle: string
  isLoading?: boolean
}

export function ConfirmCompletionDialog({
  isOpen,
  onClose,
  onConfirm,
  professionalName,
  taskTitle,
  isLoading = false,
}: ConfirmCompletionDialogProps) {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const lang = params?.lang as string || 'bg'
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConfirm = async () => {
    const success = await onConfirm()
    if (success) {
      setShowSuccess(true)
    }
  }

  const handleClose = () => {
    setShowSuccess(false)
    onClose()
  }

  const handleGoToReviews = () => {
    setShowSuccess(false)
    onClose()
    router.push(`/${lang}/reviews/pending`)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      classNames={{
        base: 'bg-white mx-2 md:mx-auto w-full',
        header: 'border-b border-gray-200',
        footer: 'border-t border-gray-200'
      }}
    >
      <ModalContent>
        {showSuccess ? (
          <>
            <ModalHeader className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-success" />
              <span>{t('taskCompletion.success.title')}</span>
            </ModalHeader>

            <ModalBody className="py-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {t('taskCompletion.success.message')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('taskCompletion.success.reviewPrompt', 'Share your experience and help others find great professionals.')}
                  </p>
                </div>

                <Card className="bg-warning-50 border-warning-200 border">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-warning flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-warning-900">
                          {t('taskCompletion.success.leaveReviewTitle', 'Leave a review for')} {professionalName}
                        </p>
                        <p className="text-xs text-warning-700">
                          {t('taskCompletion.success.leaveReviewHint', 'Your feedback helps the community')}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </ModalBody>

            <ModalFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="bordered"
                onPress={handleClose}
                className="w-full sm:w-auto"
              >
                {t('common.close')}
              </Button>
              <Button
                color="warning"
                startContent={<Star className="w-4 h-4" />}
                onPress={handleGoToReviews}
                className="w-full sm:w-auto"
              >
                {t('taskCompletion.success.leaveReview')}
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
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

              {/* Confirmation message */}
              <p className="text-sm text-gray-600 mt-4">
                {t('taskCompletion.confirmDialog.confirmMessage')}
              </p>
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
                startContent={!isLoading && <CheckCircle className="w-4 h-4" />}
                onPress={handleConfirm}
                isLoading={isLoading}
              >
                {t('taskCompletion.confirmCompletion')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
