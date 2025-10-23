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
  RadioGroup,
  Radio,
} from '@nextui-org/react'
import { XCircle, AlertTriangle, Info } from 'lucide-react'

interface CancelTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, description?: string) => void
  taskTitle: string
  professionalName?: string
  cancellationsThisMonth: number
  maxCancellationsPerMonth: number
}

export function CancelTaskDialog({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  professionalName,
  cancellationsThisMonth,
  maxCancellationsPerMonth,
}: CancelTaskDialogProps) {
  const { t } = useTranslation()
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [description, setDescription] = useState('')

  const remainingCancellations = maxCancellationsPerMonth - cancellationsThisMonth
  const isLastCancellation = remainingCancellations === 1
  const hasExceededLimit = remainingCancellations <= 0

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
        backdrop: 'bg-black/80',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-gray-600" />
            <span>{t('cancelTask.title')}</span>
          </div>
          <p className="text-sm font-normal text-gray-600">
            {taskTitle}
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Rate Limiting Info Banner */}
          <div
            className={`p-4 rounded-lg border ${
              hasExceededLimit
                ? 'bg-red-50 border-red-200'
                : isLastCancellation
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
                      {t('cancelTask.limitExceeded.title')}
                    </p>
                    <p className="text-xs text-red-700">
                      {t('cancelTask.limitExceeded.message')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {t('cancelTask.rateLimit.title', {
                        remaining: remainingCancellations,
                        max: maxCancellationsPerMonth,
                      })}
                    </p>
                    <p className="text-xs text-gray-700">
                      {isLastCancellation
                        ? t('cancelTask.rateLimit.lastWarning')
                        : t('cancelTask.rateLimit.message')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Professional Info */}
          {professionalName && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{t('cancelTask.professional')}:</span>{' '}
                {professionalName}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t('cancelTask.professionalNotification')}
              </p>
            </div>
          )}

          {/* Cancellation Reasons */}
          {!hasExceededLimit && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {t('cancelTask.reasonLabel')}
                </p>
                <RadioGroup
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                  classNames={{
                    wrapper: 'gap-2'
                  }}
                >
                  <Radio
                    value="professional_no_show"
                    classNames={{
                      base: 'max-w-full',
                      control: 'bg-white border-2 border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary'
                    }}
                  >
                    {t('cancelTask.reasons.noShow')}
                  </Radio>
                  <Radio
                    value="professional_abandoned"
                    classNames={{
                      base: 'max-w-full',
                      control: 'bg-white border-2 border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary'
                    }}
                  >
                    {t('cancelTask.reasons.abandoned')}
                  </Radio>
                  <Radio
                    value="professional_unresponsive"
                    classNames={{
                      base: 'max-w-full',
                      control: 'bg-white border-2 border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary'
                    }}
                  >
                    {t('cancelTask.reasons.unresponsive')}
                  </Radio>
                  <Radio
                    value="changed_requirements"
                    classNames={{
                      base: 'max-w-full',
                      control: 'bg-white border-2 border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary'
                    }}
                  >
                    {t('cancelTask.reasons.changedRequirements')}
                  </Radio>
                  <Radio
                    value="found_alternative"
                    classNames={{
                      base: 'max-w-full',
                      control: 'bg-white border-2 border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary'
                    }}
                  >
                    {t('cancelTask.reasons.foundAlternative')}
                  </Radio>
                  <Radio
                    value="other"
                    classNames={{
                      base: 'max-w-full',
                      control: 'bg-white border-2 border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary'
                    }}
                  >
                    {t('cancelTask.reasons.other')}
                  </Radio>
                </RadioGroup>
              </div>

              {/* Additional Details */}
              <div>
                <Textarea
                  label={t('cancelTask.descriptionLabel')}
                  placeholder={t('cancelTask.descriptionPlaceholder')}
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
                  {t('cancelTask.descriptionHint')}
                </p>
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {t('common.cancel')}
          </Button>
          {!hasExceededLimit && (
            <Button
              color="danger"
              onPress={handleConfirm}
              isDisabled={!selectedReason}
              startContent={<XCircle className="w-4 h-4" />}
            >
              {t('cancelTask.confirmButton')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
