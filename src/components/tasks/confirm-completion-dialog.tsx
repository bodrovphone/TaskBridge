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
import { CheckCircle, XCircle, User, Briefcase, AlertCircle, DollarSign } from 'lucide-react'
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

  // Review fields state
  const [actualPrice, setActualPrice] = useState<string>('')
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState('')

  const rejectionReasons = [
    { value: 'not_completed', label: t('taskCompletion.reject.notCompleted') },
    { value: 'poor_quality', label: t('taskCompletion.reject.poorQuality') },
    { value: 'different_scope', label: t('taskCompletion.reject.differentScope') },
    { value: 'other', label: t('taskCompletion.reject.other') }
  ]

  const handleConfirm = () => {
    // Prepare confirmation data
    const confirmationData: ConfirmationData = {}

    if (actualPrice && !isNaN(parseFloat(actualPrice))) {
      confirmationData.actualPricePaid = parseFloat(actualPrice)
    }

    if (rating > 0) {
      confirmationData.rating = rating
    }

    if (reviewText.trim()) {
      confirmationData.reviewText = reviewText.trim()
    }

    // Pass data to parent (or undefined if no data was filled)
    const hasData = Object.keys(confirmationData).length > 0
    onConfirm(hasData ? confirmationData : undefined)
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
    setActualPrice('')
    setRating(0)
    setReviewText('')
    onClose()
  }

  // Calculate character count for review
  const reviewCharCount = reviewText.length
  const hasReviewData = actualPrice || rating > 0 || reviewText.trim()

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

          {/* If satisfied - Show review fields */}
          {isSatisfied === 'yes' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <Divider />

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  {t('taskCompletion.confirmDialog.reviewSection')}
                </h3>

                <div className="space-y-4">
                  {/* Actual Price Paid */}
                  <div>
                    <Input
                      label={t('taskCompletion.confirmDialog.actualPricePaid')}
                      placeholder={t('taskCompletion.confirmDialog.actualPricePlaceholder')}
                      description={t('taskCompletion.confirmDialog.actualPriceHelp')}
                      value={actualPrice}
                      onValueChange={setActualPrice}
                      type="number"
                      min="0"
                      step="0.01"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-gray-500 text-sm">BGN</span>
                        </div>
                      }
                      classNames={{
                        input: 'pl-12'
                      }}
                    />
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('taskCompletion.confirmDialog.ratingLabel')}
                    </label>
                    <StarRating
                      value={rating}
                      onChange={setRating}
                      interactive={true}
                      size="lg"
                      className="py-1"
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {t('taskCompletion.confirmDialog.reviewLabel')}
                      </label>
                      <span
                        className={`text-xs ${
                          reviewCharCount > 500 ? 'text-danger font-semibold' : 'text-gray-500'
                        }`}
                      >
                        {reviewCharCount}/500
                      </span>
                    </div>
                    <Textarea
                      placeholder={t('taskCompletion.confirmDialog.reviewPlaceholder', { name: professionalName })}
                      description={t('taskCompletion.confirmDialog.reviewHelp')}
                      value={reviewText}
                      onValueChange={setReviewText}
                      minRows={3}
                      maxRows={6}
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
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
              {hasReviewData
                ? t('taskCompletion.confirmDialog.confirmWithReview')
                : t('taskCompletion.confirmDialog.skipAndConfirm')
              }
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
