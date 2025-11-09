'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth'
import { useToast } from '@/hooks/use-toast'
// @todo FEATURE: Uncomment when reviews feature is built
// import { mockCanCreateTask, mockSubmitReview, type PendingReviewTask } from '@/features/reviews'

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
  const lang = (params?.lang as string) || 'bg'
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const isAuthenticated = !!user && !!profile
  const { toast } = useToast()

  // Auth state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  // @todo FEATURE: Review enforcement state (commented out until reviews feature is built)
  // const [isEnforcementDialogOpen, setIsEnforcementDialogOpen] = useState(false)
  // const [pendingReviewTasks, setPendingReviewTasks] = useState<PendingReviewTask[]>([])
  // const [currentReviewTaskIndex, setCurrentReviewTaskIndex] = useState(0)
  // const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  // const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  /**
   * Main handler for "Create Task" button clicks
   * Checks authentication before navigation
   */
  const handleCreateTask = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    // @todo FEATURE: Add review enforcement when reviews feature is built
    // Check for pending reviews and show enforcement dialog if needed

    // All clear - proceed to create task
    router.push(`/${lang}/create-task`)
  }

  // @todo FEATURE: Review handlers (commented out until reviews feature is built)
  // const handleStartReviewing = () => {
  //   setIsEnforcementDialogOpen(false)
  //   setCurrentReviewTaskIndex(0)
  //   setIsReviewDialogOpen(true)
  // }

  // const handleSubmitReview = async (data: {
  //   taskId: string
  //   rating: number
  //   reviewText?: string
  //   actualPricePaid?: number
  // }) => {
  //   setIsSubmittingReview(true)
  //   try {
  //     await mockSubmitReview(data)
  //     const remainingCount = pendingReviewTasks.length - 1
  //     if (currentReviewTaskIndex < pendingReviewTasks.length - 1) {
  //       toast({ title: t('reviews.successWithRemaining', { remaining: remainingCount }), variant: 'default' })
  //       setCurrentReviewTaskIndex((prev) => prev + 1)
  //     } else {
  //       toast({ title: t('reviews.success'), variant: 'default' })
  //       setIsReviewDialogOpen(false)
  //       setPendingReviewTasks([])
  //       setCurrentReviewTaskIndex(0)
  //       router.push(`/${lang}/create-task`)
  //     }
  //   } catch (error) {
  //     toast({ title: t('reviews.error'), variant: 'destructive' })
  //   } finally {
  //     setIsSubmittingReview(false)
  //   }
  // }

  return {
    handleCreateTask,
    showAuthPrompt,
    setShowAuthPrompt
    // @todo FEATURE: Return review-related state when reviews feature is built
  }
}
