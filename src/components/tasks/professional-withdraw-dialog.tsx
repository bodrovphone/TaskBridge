'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from '@heroui/react'
import { LogOut, AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface ProfessionalWithdrawDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  taskTitle: string
  customerName: string
  withdrawalsThisMonth: number
  maxWithdrawalsPerMonth: number
  acceptedDate: Date
}

export function ProfessionalWithdrawDialog({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  customerName,
  withdrawalsThisMonth,
  maxWithdrawalsPerMonth,
  acceptedDate,
}: ProfessionalWithdrawDialogProps) {
  const t = useTranslations()
  const [reason, setReason] = useState('')

  // Calculate timing impact
  const timingInfo = useMemo(() => {
    const hoursSinceAcceptance = (Date.now() - acceptedDate.getTime()) / (1000 * 60 * 60)

    if (hoursSinceAcceptance < 2) {
      return {
        impact: 'low' as const,
        countsTowardLimit: false,
        message: 'professionalWithdraw.earlyWithdrawal.message',
        title: 'professionalWithdraw.earlyWithdrawal.title',
        color: 'blue'
      }
    } else if (hoursSinceAcceptance < 24) {
      return {
        impact: 'medium' as const,
        countsTowardLimit: true,
        message: 'professionalWithdraw.rateLimit.message',
        title: 'professionalWithdraw.rateLimit.title',
        color: 'yellow'
      }
    } else {
      return {
        impact: 'high' as const,
        countsTowardLimit: true,
        message: 'professionalWithdraw.lateWithdrawal.message',
        title: 'professionalWithdraw.lateWithdrawal.title',
        color: 'red'
      }
    }
  }, [acceptedDate])

  const remainingWithdrawals = maxWithdrawalsPerMonth - withdrawalsThisMonth
  const hasExceededLimit = remainingWithdrawals <= 0 && timingInfo.countsTowardLimit

  const handleConfirm = () => {
    onConfirm(reason || undefined)
    setReason('')
  }

  const handleClose = () => {
    setReason('')
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
        backdrop: 'bg-black/80 z-[100]',
        wrapper: 'z-[100]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-gray-600" />
            <span>{t('professionalWithdraw.title')}</span>
          </div>
          <p className="text-sm font-normal text-gray-600">
            {t('professionalWithdraw.subtitle', { taskTitle })}
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Customer Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{t('professionalWithdraw.customer')}:</span>{' '}
              {customerName}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t('professionalWithdraw.customerNotification')}
            </p>
          </div>

          {/* Timing-based Banner */}
          {timingInfo.impact === 'low' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    {t(timingInfo.title)}
                  </p>
                  <p className="text-xs text-blue-800">
                    {t(timingInfo.message)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {timingInfo.impact === 'medium' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    {t(timingInfo.title, { remaining: remainingWithdrawals })}
                  </p>
                  <p className="text-xs text-yellow-800">
                    {t('professionalWithdraw.rateLimit.warning')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {timingInfo.impact === 'high' && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    {t(timingInfo.title)}
                  </p>
                  <p className="text-xs text-red-800">
                    {t(timingInfo.message)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Limit Exceeded Warning */}
          {hasExceededLimit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    {t('professionalWithdraw.limitExceeded.title')}
                  </p>
                  <p className="text-xs text-red-700">
                    {t('professionalWithdraw.limitExceeded.message')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason (Optional) */}
          {!hasExceededLimit && (
            <>
              <div>
                <Textarea
                  label={t('professionalWithdraw.reasonLabel')}
                  placeholder={t('professionalWithdraw.descriptionPlaceholder')}
                  value={reason}
                  onValueChange={setReason}
                  minRows={3}
                  maxRows={5}
                  classNames={{
                    label: 'text-sm font-medium text-gray-900',
                    input: 'text-sm',
                  }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  {t('professionalWithdraw.descriptionHint')}
                </p>
              </div>

              {/* Reputation Warning */}
              {timingInfo.countsTowardLimit && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-800">
                    {t('professionalWithdraw.reputationWarning')}
                  </p>
                </div>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {t('common.cancel')}
          </Button>
          {!hasExceededLimit && (
            <Button
              color="warning"
              onPress={handleConfirm}
              startContent={<LogOut className="w-4 h-4" />}
            >
              {t('professionalWithdraw.confirmButton')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
