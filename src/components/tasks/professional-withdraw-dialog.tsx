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
  RadioGroup,
  Radio,
} from '@nextui-org/react'
import { LogOut, AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface ProfessionalWithdrawDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, description?: string) => void
  taskTitle: string
  customerName: string
  withdrawalsThisMonth: number
  maxWithdrawalsPerMonth: number
  taskBudget: number
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
  taskBudget,
  acceptedDate,
}: ProfessionalWithdrawDialogProps) {
  const t = useTranslations()
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [description, setDescription] = useState('')

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
    if (!selectedReason) return
    onConfirm(selectedReason, description || undefined)
    setSelectedReason('')
    setDescription('')
  }

  const handleClose = () => {
    setSelectedReason('')
    setDescription('')
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

          {/* Withdrawal Reasons */}
          {!hasExceededLimit && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {t('professionalWithdraw.reasonLabel')}
                </p>
                <RadioGroup
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                  classNames={{
                    wrapper: 'gap-3'
                  }}
                >
                  <Radio
                    value="health_emergency"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.health_emergency')}
                  </Radio>
                  <Radio
                    value="capacity_issue"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.capacity_issue')}
                  </Radio>
                  <Radio
                    value="scope_mismatch"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.scope_mismatch')}
                  </Radio>
                  <Radio
                    value="customer_unresponsive"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.customer_unresponsive')}
                  </Radio>
                  <Radio
                    value="location_issue"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.location_issue')}
                  </Radio>
                  <Radio
                    value="budget_dispute"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.budget_dispute')}
                  </Radio>
                  <Radio
                    value="equipment_issue"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.equipment_issue')}
                  </Radio>
                  <Radio
                    value="other"
                    classNames={{
                      base: 'max-w-full m-0 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer border-2 border-transparent data-[selected=true]:border-primary data-[selected=true]:bg-blue-50 transition-all',
                      wrapper: 'group-data-[selected=true]:border-primary',
                      labelWrapper: 'ml-2',
                      label: 'text-sm text-gray-700'
                    }}
                  >
                    {t('professionalWithdraw.reasons.other')}
                  </Radio>
                </RadioGroup>
              </div>

              {/* Additional Details */}
              <div>
                <Textarea
                  label={t('professionalWithdraw.descriptionLabel')}
                  placeholder={t('professionalWithdraw.descriptionPlaceholder')}
                  value={description}
                  onValueChange={setDescription}
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
              isDisabled={!selectedReason}
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
