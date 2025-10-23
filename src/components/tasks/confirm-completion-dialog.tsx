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
  Divider,
  Input
} from '@nextui-org/react'
import { CheckCircle, XCircle, User, Briefcase, AlertCircle, DollarSign, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StarRating } from '@/components/common/star-rating'

export interface ConfirmationData {
  actualPricePaid?: number
  rating?: number
  reviewText?: string
}

interface ConfirmCompletionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data?: ConfirmationData) => void
  onReject: (reason: string, description?: string) => void
  onReportProfessional?: () => void // Optional - opens report dialog
  professionalName: string
  taskTitle: string
  isLoading?: boolean
}

export function ConfirmCompletionDialog({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  onReportProfessional,
  professionalName,
  taskTitle,
  isLoading = false
}: ConfirmCompletionDialogProps) {
  const { t } = useTranslation()
  const [isSatisfied, setIsSatisfied] = useState<'yes' | 'no' | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [rejectionDescription, setRejectionDescription] = useState('')

  // Review fields (optional)
  const [actualPricePaid, setActualPricePaid] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState('')

  const rejectionReasons = [
    { value: 'not_completed', label: t('taskCompletion.reject.notCompleted') },
    { value: 'poor_quality', label: t('taskCompletion.reject.poorQuality') },
    { value: 'different_scope', label: t('taskCompletion.reject.differentScope') },
    { value: 'other', label: t('taskCompletion.reject.other') }
  ]

  const handleConfirm = () => {
    const confirmationData: ConfirmationData = {
      actualPricePaid: actualPricePaid ? parseFloat(actualPricePaid) : undefined,
      rating: rating > 0 ? rating : undefined,
      reviewText: reviewText.trim() || undefined
    }
    onConfirm(confirmationData)
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
    setActualPricePaid('')
    setRating(0)
    setReviewText('')
    onClose()
  }

  const reviewCharCount = reviewText.length
  const maxReviewChars = 500

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white mx-2 md:mx-auto w-full',
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

          {/* Satisfaction Question */}
          <div className="space-y-4 mt-4">
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
              <Radio
                value="yes"
                classNames={{
                  base: 'inline-flex m-0 bg-content1 hover:bg-success-50 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent data-[selected=true]:border-success',
                  control: 'bg-white border-2 border-default-200 data-[selected=true]:border-success data-[selected=true]:bg-success',
                  wrapper: 'group-data-[selected=true]:border-success',
                  labelWrapper: 'ml-0'
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="font-medium">{t('taskCompletion.confirmDialog.yes')}</span>
                </div>
              </Radio>
              <Radio
                value="no"
                classNames={{
                  base: 'inline-flex m-0 bg-content1 hover:bg-danger-50 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent data-[selected=true]:border-danger',
                  control: 'bg-white border-2 border-default-200 data-[selected=true]:border-danger data-[selected=true]:bg-danger',
                  wrapper: 'group-data-[selected=true]:border-danger',
                  labelWrapper: 'ml-0'
                }}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-danger" />
                  <span className="font-medium">{t('taskCompletion.confirmDialog.no')}</span>
                </div>
              </Radio>
            </RadioGroup>
          </div>

          {/* If satisfied - Show review fields */}
          {isSatisfied === 'yes' && (
            <div className="space-y-4 animate-in slide-in-from-top duration-300">
              <Divider />

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  {t('taskCompletion.confirmDialog.reviewSection')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('taskCompletion.confirmDialog.reviewSectionHelp')}
                </p>

                {/* Actual Price Paid */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('taskCompletion.confirmDialog.actualPricePaid')}
                    <span className="text-gray-500 font-normal ml-1">({t('common.optional')})</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualPricePaid}
                    onValueChange={setActualPricePaid}
                    placeholder={t('taskCompletion.confirmDialog.actualPricePlaceholder')}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">BGN</span>
                      </div>
                    }
                    description={t('taskCompletion.confirmDialog.actualPriceHelp')}
                    classNames={{
                      input: 'text-right'
                    }}
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('taskCompletion.confirmDialog.ratingLabel')}
                    <span className="text-gray-500 font-normal ml-1">({t('common.optional')})</span>
                  </label>
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    interactive={true}
                    size="lg"
                  />
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      {t('taskCompletion.confirmDialog.reviewLabel')}
                      <span className="text-gray-500 font-normal ml-1">({t('common.optional')})</span>
                    </label>
                    <span className={`text-xs ${reviewCharCount > maxReviewChars ? 'text-danger' : 'text-gray-500'}`}>
                      {reviewCharCount}/{maxReviewChars}
                    </span>
                  </div>
                  <Textarea
                    value={reviewText}
                    onValueChange={setReviewText}
                    placeholder={t('taskCompletion.confirmDialog.reviewPlaceholder', { name: professionalName })}
                    minRows={3}
                    maxRows={5}
                    maxLength={maxReviewChars}
                    description={t('taskCompletion.confirmDialog.reviewHelp')}
                  />
                </div>
              </div>

              <Card className="bg-success-50 border-success-200 border">
                <CardBody className="p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-success-700">
                      {t('taskCompletion.confirmDialog.reviewReminder')}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
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

              {/* Report Professional Button - Only shown if handler provided */}
              {onReportProfessional && (
                <div className="pt-2">
                  <Divider className="mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {t('taskCompletion.reject.seriousIssue')}
                    </p>
                    <Button
                      color="danger"
                      variant="flat"
                      startContent={<ShieldAlert className="w-4 h-4" />}
                      onPress={onReportProfessional}
                      className="w-full"
                      size="sm"
                    >
                      {t('report.button')}
                    </Button>
                    <p className="text-xs text-gray-600">
                      {t('taskCompletion.reject.reportHint')}
                    </p>
                  </div>
                </div>
              )}
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
