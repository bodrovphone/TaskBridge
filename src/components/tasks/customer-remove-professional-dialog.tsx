'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Avatar,
} from '@nextui-org/react'
import { UserX, AlertTriangle, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { enUS, bg as bgLocale, ru as ruLocale } from 'date-fns/locale'

interface CustomerRemoveProfessionalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (feedback?: string) => void
  taskTitle: string
  professionalName: string
  professionalAvatar?: string
  removalsThisMonth: number
  maxRemovalsPerMonth: number
  acceptedDate: Date
  isLoading?: boolean
}

export function CustomerRemoveProfessionalDialog({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  professionalName,
  professionalAvatar,
  removalsThisMonth,
  maxRemovalsPerMonth,
  acceptedDate,
  isLoading = false,
}: CustomerRemoveProfessionalDialogProps) {
  const { t, i18n } = useTranslation()
  const [feedback, setFeedback] = useState('')

  const remainingRemovals = maxRemovalsPerMonth - removalsThisMonth
  const hasExceededLimit = remainingRemovals <= 0
  const isLastRemoval = remainingRemovals === 1

  // Calculate days working
  const daysWorking = Math.floor((Date.now() - acceptedDate.getTime()) / (1000 * 60 * 60 * 24))

  // Get locale for date-fns
  const getLocale = () => {
    switch (i18n.language) {
      case 'bg':
        return bgLocale
      case 'ru':
        return ruLocale
      default:
        return enUS
    }
  }

  const handleConfirm = () => {
    if (hasExceededLimit) return
    onConfirm(feedback.trim() || undefined)
    setFeedback('')
  }

  const handleClose = () => {
    setFeedback('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-orange-600" />
            <span>{t('customerRemove.title')}</span>
          </div>
          <p className="text-sm font-normal text-gray-600">
            {t('customerRemove.subtitle', { taskTitle })}
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Rate Limiting Warning Banner */}
          <div
            className={`p-4 rounded-lg border ${
              hasExceededLimit
                ? 'bg-red-50 border-red-200'
                : isLastRemoval
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {hasExceededLimit ? (
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {hasExceededLimit ? (
                  <>
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      {t('customerRemove.limitExceeded.title')}
                    </p>
                    <p className="text-xs text-red-700">
                      {t('customerRemove.limitExceeded.message')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {t('customerRemove.limitWarning.title', {
                        remaining: remainingRemovals,
                        max: maxRemovalsPerMonth,
                      })}
                    </p>
                    <p className="text-xs text-gray-700">
                      {t('customerRemove.limitWarning.message')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Professional Info Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {professionalAvatar && (
                <Avatar
                  src={professionalAvatar}
                  name={professionalName}
                  size="lg"
                  className="flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{professionalName}</p>
                <p className="text-sm text-gray-600">
                  {t('customerRemove.acceptedOn')}:{' '}
                  {formatDistanceToNow(acceptedDate, { addSuffix: true, locale: getLocale() })}
                </p>
                <p className="text-sm text-gray-600">
                  {t('customerRemove.workingFor')}: {daysWorking}{' '}
                  {daysWorking === 1 ? t('common.day') : t('common.days')}
                </p>
              </div>
            </div>
          </div>

          {/* Impact Warning */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              {t('customerRemove.professionalNotification')}
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {t('customerRemove.taskWillReopen')}
            </p>
          </div>

          {/* Optional Feedback */}
          {!hasExceededLimit && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">
                {t('customerRemove.feedbackLabel', 'Feedback for the professional (optional)')}
              </p>
              <Textarea
                value={feedback}
                onValueChange={setFeedback}
                placeholder={t('customerRemove.feedbackPlaceholder', 'Let them know why you\'re removing them from this task...')}
                minRows={3}
                maxRows={5}
                classNames={{
                  input: 'text-sm',
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('customerRemove.feedbackHint', 'This message will be included in the notification sent to the professional.')}
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          <Button
            variant="flat"
            onPress={handleClose}
            isDisabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          {!hasExceededLimit && (
            <Button
              color="warning"
              onPress={handleConfirm}
              isDisabled={isLoading}
              isLoading={isLoading}
              startContent={!isLoading && <UserX className="w-4 h-4" />}
            >
              {t('customerRemove.confirmButton')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
