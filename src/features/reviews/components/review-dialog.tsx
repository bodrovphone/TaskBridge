'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
  Avatar,
  Divider
} from '@nextui-org/react'
import { Star, User, Calendar, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StarRating } from '@/components/common/star-rating'
import type { PendingReviewTask, ReviewSubmitData } from '../lib/types'

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReviewSubmitData) => Promise<void>
  task: PendingReviewTask
  isLoading?: boolean
  currentIndex?: number
  totalCount?: number
}

export function ReviewDialog({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false,
  currentIndex,
  totalCount
}: ReviewDialogProps) {
  const { t } = useTranslation()

  // Form state
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState('')
  const [actualPricePaid, setActualPricePaid] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation
  const [showRatingError, setShowRatingError] = useState(false)

  const reviewCharCount = reviewText.length
  const minReviewChars = 50
  const maxReviewChars = 500

  const handleClose = () => {
    // Reset form
    setRating(0)
    setReviewText('')
    setActualPricePaid('')
    setShowRatingError(false)
    onClose()
  }

  const handleSubmit = async () => {
    // Validate rating (required)
    if (rating === 0) {
      setShowRatingError(true)
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: ReviewSubmitData = {
        taskId: task.id,
        rating,
        reviewText: reviewText.trim() || undefined,
        actualPricePaid: actualPricePaid ? parseFloat(actualPricePaid) : undefined
      }

      await onSubmit(submitData)
      handleClose()
    } catch (error) {
      console.error('Failed to submit review:', error)
      // Error handling will be shown by parent component via toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('common.today')
    if (diffDays === 1) return t('common.yesterday')
    if (diffDays < 7) return t('reviews.pending.completedDaysAgo', { count: diffDays })
    return date.toLocaleDateString()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      isDismissable={!isSubmitting}
      hideCloseButton={isSubmitting}
      classNames={{
        wrapper: 'z-[100]',
        backdrop: 'z-[99]',
        base: 'bg-white z-[100]',
        header: 'border-b border-gray-200',
        body: 'py-6',
        footer: 'border-t border-gray-200'
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('review.dialog.title')}
                </h3>
                {totalCount !== undefined && currentIndex !== undefined && totalCount > 1 && (
                  <div className="text-sm font-medium text-gray-600">
                    {t('reviews.progress.reviewing', { current: currentIndex + 1, total: totalCount })}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 font-normal">
                {t('review.dialog.subtitle', { professionalName: task.professionalName })}
              </p>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-6">
                {/* Task Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={task.professionalName}
                      src={task.professionalAvatar}
                      size="lg"
                      classNames={{
                        base: 'flex-shrink-0'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-900">
                          {task.professionalName}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{t('review.dialog.completedLabel')}: {formatDate(task.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Star Rating - REQUIRED */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Star className="w-4 h-4 mr-2 text-yellow-400" />
                    {t('review.dialog.ratingLabel')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <StarRating
                    value={rating}
                    onChange={(newRating) => {
                      setRating(newRating)
                      setShowRatingError(false)
                    }}
                    interactive={true}
                    size="lg"
                    className="justify-center sm:justify-start"
                  />
                  {showRatingError && (
                    <div className="flex items-center gap-2 text-sm text-danger">
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('review.dialog.ratingRequired')}</span>
                    </div>
                  )}
                </div>

                {/* Review Text - OPTIONAL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('review.dialog.reviewTextLabel')}
                    <span className="text-gray-500 font-normal ml-1">({t('common.optional')})</span>
                  </label>
                  <Textarea
                    value={reviewText}
                    onValueChange={setReviewText}
                    placeholder={t('review.dialog.reviewTextPlaceholder')}
                    minRows={4}
                    maxRows={8}
                    maxLength={maxReviewChars}
                    description={
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-gray-500">
                          {reviewCharCount > 0 && reviewCharCount < minReviewChars && (
                            <span className="text-warning">
                              {t('review.dialog.minCharacters', { min: minReviewChars })}
                            </span>
                          )}
                        </span>
                        <span className={`text-xs ${reviewCharCount > maxReviewChars * 0.9 ? 'text-warning' : 'text-gray-500'}`}>
                          {t('review.dialog.charCount', { count: reviewCharCount, max: maxReviewChars })}
                        </span>
                      </div>
                    }
                    classNames={{
                      input: 'resize-none'
                    }}
                  />
                </div>

                {/* Actual Price Paid - OPTIONAL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('review.dialog.actualPriceLabel')}
                    <span className="text-gray-500 font-normal ml-1">({t('common.optional')})</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualPricePaid}
                    onValueChange={setActualPricePaid}
                    placeholder={t('review.dialog.actualPricePlaceholder')}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">BGN</span>
                      </div>
                    }
                    classNames={{
                      input: 'text-right'
                    }}
                  />
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="solid"
                onPress={handleClose}
                isDisabled={isSubmitting}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                {t('review.dialog.cancelButton')}
              </Button>
              <Button
                variant="solid"
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={rating === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? t('review.dialog.submitting') : t('review.dialog.submitButton')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
