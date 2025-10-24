'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { mockCanCreateTask, mockSubmitReview, type PendingReviewTask } from '@/features/reviews'

/**
 * Custom hook for handling "Create Task" action with review enforcement
 *
 * This hook encapsulates the logic for:
 * - Authentication checking
 * - Review enforcement (blocking if pending reviews exist)
 * - Sequential review flow
 * - Navigation to create-task page
 *
 * Usage:
 * ```tsx
 * const { handleCreateTask, reviewDialogs } = useCreateTask()
 *
 * // In your component JSX:
 * <Button onPress={handleCreateTask}>Create Task</Button>
 * {reviewDialogs}
 * ```
 */
export function useCreateTask() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Review enforcement state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [isEnforcementDialogOpen, setIsEnforcementDialogOpen] = useState(false)
  const [pendingReviewTasks, setPendingReviewTasks] = useState<PendingReviewTask[]>([])
  const [currentReviewTaskIndex, setCurrentReviewTaskIndex] = useState(0)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  /**
   * Main handler for "Create Task" button clicks
   * Checks authentication and pending reviews before navigation
   */
  const handleCreateTask = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    // Check for pending reviews (mock function - will be replaced with API in Phase 2)
    const { canCreate, pendingTasks } = mockCanCreateTask()

    if (!canCreate && pendingTasks.length > 0) {
      // User has pending reviews - show enforcement dialog
      setPendingReviewTasks(pendingTasks)
      setCurrentReviewTaskIndex(0)
      setIsEnforcementDialogOpen(true)
    } else {
      // All clear - proceed to create task
      router.push(`/${lang}/create-task`)
    }
  }

  /**
   * Handler for when user clicks "Leave Reviews" in enforcement dialog
   * Opens the first review dialog
   */
  const handleStartReviewing = () => {
    setIsEnforcementDialogOpen(false)
    setCurrentReviewTaskIndex(0)
    setIsReviewDialogOpen(true)
  }

  /**
   * Handler for submitting a single review
   * Manages sequential flow through multiple pending reviews
   */
  const handleSubmitReview = async (data: {
    taskId: string
    rating: number
    reviewText?: string
    actualPricePaid?: number
  }) => {
    setIsSubmittingReview(true)
    try {
      await mockSubmitReview(data)

      const remainingCount = pendingReviewTasks.length - 1

      if (currentReviewTaskIndex < pendingReviewTasks.length - 1) {
        // More reviews to go
        toast({
          title: t('reviews.successWithRemaining', { remaining: remainingCount }),
          variant: 'default'
        })
        setCurrentReviewTaskIndex((prev) => prev + 1)
      } else {
        // All reviews done!
        toast({
          title: t('reviews.success'),
          variant: 'default'
        })
        setIsReviewDialogOpen(false)
        setPendingReviewTasks([])
        setCurrentReviewTaskIndex(0)

        // Now proceed to create task
        router.push(`/${lang}/create-task`)
      }
    } catch (error) {
      toast({
        title: t('reviews.error'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return {
    handleCreateTask,
    showAuthPrompt,
    setShowAuthPrompt,
    isEnforcementDialogOpen,
    setIsEnforcementDialogOpen,
    pendingReviewTasks,
    currentReviewTaskIndex,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    isSubmittingReview,
    handleStartReviewing,
    handleSubmitReview
  }
}
