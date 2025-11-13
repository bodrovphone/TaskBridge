'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import type { BlockType, PendingReviewTask, ReviewSubmitData } from '@/features/reviews/lib/types'

interface CanCreateResponse {
  canCreate: boolean
  blockType: BlockType
  pendingConfirmations: PendingReviewTask[]
  pendingReviews: PendingReviewTask[]
  gracePeriodUsed: number
  unreviewedCount: number
}

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
 * const {
 *   handleCreateTask,
 *   showAuthPrompt,
 *   setShowAuthPrompt,
 *   showEnforcementDialog,
 *   setShowEnforcementDialog,
 *   showReviewDialog,
 *   setShowReviewDialog,
 *   blockType,
 *   blockingTasks,
 *   handleReviewTask,
 *   handleSubmitReview,
 *   getCurrentTask,
 *   isSubmittingReview
 * } = useCreateTask()
 *
 * // In your component JSX:
 * <Button onPress={handleCreateTask}>Create Task</Button>
 * <AuthSlideOver isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
 * <ReviewEnforcementDialog
 *   isOpen={showEnforcementDialog}
 *   onClose={() => setShowEnforcementDialog(false)}
 *   blockType={blockType}
 *   pendingTasks={blockingTasks}
 *   onReviewTask={handleReviewTask}
 * />
 * <ReviewDialog
 *   isOpen={showReviewDialog}
 *   onClose={() => setShowReviewDialog(false)}
 *   task={getCurrentTask()}
 *   onSubmit={handleSubmitReview}
 *   isLoading={isSubmittingReview}
 * />
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
  const queryClient = useQueryClient()

  // Auth state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  // Review enforcement state
  const [showEnforcementDialog, setShowEnforcementDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [currentReviewTaskId, setCurrentReviewTaskId] = useState<string | null>(null)
  const [blockingTasks, setBlockingTasks] = useState<PendingReviewTask[]>([])
  const [blockType, setBlockType] = useState<BlockType>(null)

  // Check if user can create task (enforcement check)
  const { data: eligibility, isLoading } = useQuery<CanCreateResponse>({
    queryKey: ['can-create-task'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/can-create')
      if (!res.ok) {
        throw new Error('Failed to check eligibility')
      }
      return res.json()
    },
    enabled: isAuthenticated, // Only check if user is logged in
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: ReviewSubmitData }) => {
      const res = await fetch(`/api/tasks/${taskId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: data.rating,
          comment: data.reviewText,
          isAnonymous: data.isAnonymous,
          delayPublishing: data.delayPublishing
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      return res.json()
    },
    onSuccess: () => {
      // Refresh eligibility check and pending reviews
      queryClient.invalidateQueries({ queryKey: ['can-create-task'] })
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] })
      queryClient.invalidateQueries({ queryKey: ['pendingReviewsCount'] })

      // Show success toast
      toast({
        title: t('reviews.dialog.successTitle'),
        description: t('reviews.dialog.successMessage'),
        variant: 'default'
      })

      // Close review dialog
      setShowReviewDialog(false)
      setCurrentReviewTaskId(null)

      // Remove reviewed task from blocking tasks
      setBlockingTasks(prev => prev.filter(t => t.id !== currentReviewTaskId))

      // If no more blocking tasks, close enforcement dialog and proceed
      if (blockingTasks.length <= 1) {
        setShowEnforcementDialog(false)
        // Small delay to let dialog close before navigating
        setTimeout(() => {
          router.push(`/${lang}/create-task`)
        }, 300)
      }
    },
    onError: (error: Error) => {
      toast({
        title: t('reviews.dialog.errorTitle'),
        description: error.message || t('reviews.dialog.errorMessage'),
        variant: 'destructive'
      })
    }
  })

  /**
   * Main handler for "Create Task" button clicks
   * Checks authentication and review enforcement before navigation
   */
  const handleCreateTask = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    // Check eligibility (review enforcement)
    if (!eligibility) return

    if (!eligibility.canCreate) {
      // User is blocked - determine which dialog to show
      if (eligibility.blockType === 'pending_confirmation') {
        setBlockType('pending_confirmation')
        setBlockingTasks(eligibility.pendingConfirmations)
        setShowEnforcementDialog(true)
      } else if (eligibility.blockType === 'missing_reviews') {
        setBlockType('missing_reviews')
        setBlockingTasks(eligibility.pendingReviews)
        setShowEnforcementDialog(true)
      }
      return
    }

    // All clear - proceed to create task
    router.push(`/${lang}/create-task`)
  }

  /**
   * Handler for when user clicks "Review" on a task in enforcement dialog
   */
  const handleReviewTask = (taskId: string) => {
    setCurrentReviewTaskId(taskId)
    setShowReviewDialog(true)
  }

  /**
   * Handler for review submission from ReviewDialog
   */
  const handleSubmitReview = async (data: ReviewSubmitData) => {
    if (!currentReviewTaskId) return

    await submitReviewMutation.mutateAsync({
      taskId: currentReviewTaskId,
      data
    })
  }

  /**
   * Get current task being reviewed
   */
  const getCurrentTask = (): PendingReviewTask | undefined => {
    return blockingTasks.find(t => t.id === currentReviewTaskId)
  }

  return {
    // Main handler
    handleCreateTask,

    // Auth state
    showAuthPrompt,
    setShowAuthPrompt,

    // Enforcement state
    canCreate: eligibility?.canCreate ?? true,
    isCheckingEligibility: isLoading,
    blockType,
    blockingTasks,
    gracePeriodUsed: eligibility?.gracePeriodUsed ?? 0,
    unreviewedCount: eligibility?.unreviewedCount ?? 0,

    // Dialogs
    showEnforcementDialog,
    setShowEnforcementDialog,
    showReviewDialog,
    setShowReviewDialog,

    // Review flow
    handleReviewTask,
    handleSubmitReview,
    getCurrentTask,
    isSubmittingReview: submitReviewMutation.isPending
  }
}
