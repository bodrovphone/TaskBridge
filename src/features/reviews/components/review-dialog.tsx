'use client'

import { useState, useMemo, useEffect } from 'react'
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
  Divider,
  Checkbox,
  Card,
  CardBody
} from '@nextui-org/react'
import { Star, User, Calendar, AlertCircle, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StarRating } from '@/components/common/star-rating'
import type { PendingReviewTask, ReviewSubmitData } from '../lib/types'
import { getReviewPublishingDelay, getReviewDelayLabel } from '@/lib/utils/review-delay'
import { useKeyboardHeight } from '@/hooks/use-keyboard-height'

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
  const isKeyboardOpen = useKeyboardHeight()

  // Form state
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState('')
  const [actualPricePaid, setActualPricePaid] = useState(task.proposedPrice?.toString() || '')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [delayPublishing, setDelayPublishing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation
  const [showRatingError, setShowRatingError] = useState(false)

  const reviewCharCount = reviewText.length
  const maxReviewChars = 500

  // Calculate delayed publish date based on environment
  const delayedPublishDate = useMemo(() => {
    const delay = getReviewPublishingDelay()
    return new Date(Date.now() + delay).toLocaleDateString()
  }, [])

  const delayLabel = getReviewDelayLabel()

  const handleClose = () => {
    // Reset form
    setRating(0)
    setReviewText('')
    setActualPricePaid(task.proposedPrice?.toString() || '')
    setIsAnonymous(false)
    setDelayPublishing(false)
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
        rating,
        reviewText: reviewText.trim() || undefined,
        actualPricePaid: actualPricePaid ? parseFloat(actualPricePaid) : undefined,
        isAnonymous,
        delayPublishing
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('common.today')
    if (diffDays === 1) return t('common.yesterday')
    if (diffDays < 7) return t('reviews.pending.completedDaysAgo', { count: diffDays })
    return dateObj.toLocaleDateString()
  }

  return (
    <div className="relative">
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        scrollBehavior="inside"
        isDismissable={!isSubmitting}
        hideCloseButton={isSubmitting}
        size="2xl"
        placement="center"
        classNames={{
          backdrop: 'bg-black/80',
          base: `${isKeyboardOpen ? 'max-h-[60vh]' : 'max-h-[95vh]'} sm:max-h-[90vh] my-auto transition-all duration-200`,
          header: 'border-b border-gray-200 flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 sm:py-4',
          body: 'overflow-y-auto px-4 py-4 sm:px-6 sm:py-6',
          footer: 'border-t border-gray-200 flex-shrink-0 sticky bottom-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 sm:py-4',
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

            <ModalBody className="flex-1 overflow-y-auto overscroll-contain">
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
                        <span>{formatDate(task.completedAt)}</span>
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
                      <div className="flex justify-end items-center w-full">
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
                  <div className="w-48">
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

                <Divider />

                {/* Privacy Controls */}
                <Card className="border border-gray-200 bg-gray-50">
                  <CardBody className="space-y-4 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-sm text-gray-700">
                        {t('reviews.dialog.privacyOptions')}
                      </h4>
                    </div>

                    {/* Anonymous Review */}
                    <Checkbox
                      isSelected={isAnonymous}
                      onValueChange={setIsAnonymous}
                      classNames={{
                        base: 'max-w-full',
                        label: 'w-full'
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900">
                          {t('reviews.dialog.postAnonymously')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t('reviews.dialog.postAnonymouslyDescription')}
                        </p>
                      </div>
                    </Checkbox>

                    {/* Delayed Publishing */}
                    <Checkbox
                      isSelected={delayPublishing}
                      onValueChange={setDelayPublishing}
                      classNames={{
                        base: 'max-w-full',
                        label: 'w-full'
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900">
                          {t('reviews.dialog.delayPublishing', { delay: delayLabel })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t('reviews.dialog.delayPublishingDescription', { delay: delayLabel })}
                        </p>
                      </div>
                    </Checkbox>

                    {/* Info callout when delayed */}
                    {delayPublishing && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-900">
                          {t('reviews.dialog.delayedPublishingInfo', {
                            date: delayedPublishDate
                          })}
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </ModalBody>

            <ModalFooter className="flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="solid"
                onPress={handleClose}
                isDisabled={isSubmitting}
                size="lg"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-full sm:w-auto"
              >
                {t('review.dialog.cancelButton')}
              </Button>
              <Button
                variant="solid"
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={rating === 0}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                {isSubmitting ? t('review.dialog.submitting') : t('review.dialog.submitButton')}
              </Button>
            </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
