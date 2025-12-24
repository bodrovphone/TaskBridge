'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/features/auth'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import type { BlockType, PendingReviewTask, ReviewSubmitData } from '@/features/reviews/lib/types'

interface CanCreateResponse {
  canCreate: boolean
  blockType: BlockType
  pendingReviews: PendingReviewTask[]
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
  const t = useTranslations()
  const { user, profile, authenticatedFetch } = useAuth()
  const isAuthenticated = !!user && !!profile
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Auth state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  // Professional invitation context (stored to preserve through review enforcement flow)
  const [pendingInviteProfessionalId, setPendingInviteProfessionalId] = useState<string | null>(null)
  const [pendingInviteProfessionalName, setPendingInviteProfessionalName] = useState<string | null>(null)

  // Review enforcement state
  const [showEnforcementDialog, setShowEnforcementDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [currentReviewTaskId, setCurrentReviewTaskId] = useState<string | null>(null)
  const [blockingTasks, setBlockingTasks] = useState<PendingReviewTask[]>([])
  const [blockType, setBlockType] = useState<BlockType>(null)

  // Check if user can create task (enforcement check)
  // IMPORTANT: Disabled by default to avoid blocking LCP - only fetches when button is clicked
  const [shouldCheckEligibility, setShouldCheckEligibility] = useState(false)
  const pendingActionRef = useRef(false) // Track if we're waiting to proceed after eligibility check

  const { data: eligibility, isLoading } = useQuery<CanCreateResponse>({
    queryKey: ['can-create-task'],
    queryFn: async () => {
      const res = await authenticatedFetch('/api/tasks/can-create')
      if (!res.ok) {
        throw new Error('Failed to check eligibility')
      }
      return res.json()
    },
    enabled: isAuthenticated && shouldCheckEligibility, // Only check when explicitly triggered
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })

  // Auto-proceed when eligibility data loads after button click
  useEffect(() => {
    if (!pendingActionRef.current || isLoading || !eligibility) return

    pendingActionRef.current = false // Reset flag

    // Handle enforcement blocks
    if (eligibility.blockType === 'soft_block' || eligibility.blockType === 'hard_block') {
      setBlockType(eligibility.blockType)
      setBlockingTasks(eligibility.pendingReviews)
      setShowEnforcementDialog(true)
      return
    }

    // All clear - proceed to create task
    const professionalId = pendingInviteProfessionalId
    const professionalName = pendingInviteProfessionalName
    router.push(buildCreateTaskUrl(professionalId, professionalName))
  }, [eligibility, isLoading, router, pendingInviteProfessionalId, pendingInviteProfessionalName])

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: ReviewSubmitData }) => {
      const res = await authenticatedFetch(`/api/tasks/${taskId}/reviews`, {
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
        // Preserve professional invitation context if set
        setTimeout(() => {
          router.push(buildCreateTaskUrl(pendingInviteProfessionalId, pendingInviteProfessionalName))
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
   * Helper to build the create-task URL with optional professional invitation params
   */
  const buildCreateTaskUrl = (professionalId?: string | null, professionalName?: string | null) => {
    let url = `/${lang}/create-task`
    if (professionalId) {
      const params = new URLSearchParams()
      params.set('inviteProfessionalId', professionalId)
      if (professionalName) {
        params.set('inviteProfessionalName', professionalName)
      }
      url += `?${params.toString()}`
    }
    return url
  }

  /**
   * Main handler for "Create Task" button clicks
   * Checks authentication and review enforcement before navigation
   * @param optionsOrEvent - Optional parameters for professional invitation context, or event (ignored)
   */
  const handleCreateTask = async (optionsOrEvent?: { inviteProfessionalId?: string; inviteProfessionalName?: string } | React.MouseEvent | unknown) => {
    // Handle both event handler calls (onClick={handleCreateTask}) and direct calls with options
    // If it looks like an event (has 'target' property), treat it as no options
    const options = optionsOrEvent && typeof optionsOrEvent === 'object' && 'inviteProfessionalId' in optionsOrEvent
      ? optionsOrEvent as { inviteProfessionalId?: string; inviteProfessionalName?: string }
      : undefined

    // Store professional context if provided (will be preserved through review enforcement flow)
    if (options?.inviteProfessionalId) {
      setPendingInviteProfessionalId(options.inviteProfessionalId)
      setPendingInviteProfessionalName(options.inviteProfessionalName || null)
    }

    // Check authentication first
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    // Check eligibility (review enforcement)
    // If eligibility is already loaded (from previous check), use it directly
    if (eligibility) {
      // Show enforcement dialog for both soft and hard blocks
      if (eligibility.blockType === 'soft_block' || eligibility.blockType === 'hard_block') {
        setBlockType(eligibility.blockType)
        setBlockingTasks(eligibility.pendingReviews)
        setShowEnforcementDialog(true)
        return
      }

      // All clear - proceed to create task
      const professionalId = options?.inviteProfessionalId || pendingInviteProfessionalId
      const professionalName = options?.inviteProfessionalName || pendingInviteProfessionalName
      router.push(buildCreateTaskUrl(professionalId, professionalName))
      return
    }

    // Trigger lazy fetch if not already done (to avoid blocking LCP)
    if (!shouldCheckEligibility) {
      setShouldCheckEligibility(true)
      pendingActionRef.current = true // Effect will auto-proceed when data loads
      return
    }

    // If already triggered but still loading, just wait (effect will handle it)
    if (isLoading) {
      pendingActionRef.current = true
      return
    }
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
