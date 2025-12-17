'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PendingReviewsList, ReviewDialog } from '@/features/reviews'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@nextui-org/react'
import type { ReviewSubmitData } from '@/features/reviews/lib/types'
import { useAuth } from '@/features/auth'

export function PendingReviewsContent() {
  const t = useTranslations()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { authenticatedFetch } = useAuth()

  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // Fetch pending reviews using authenticated fetch
  const { data, isLoading } = useQuery({
    queryKey: ['pendingReviews'],
    queryFn: async () => {
      const res = await authenticatedFetch('/api/reviews/pending')
      if (!res.ok) throw new Error('Failed to fetch pending reviews')
      return res.json()
    }
  })

  const tasks = data?.pendingReviews || []

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
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] })
      queryClient.invalidateQueries({ queryKey: ['can-create-task'] })
      queryClient.invalidateQueries({ queryKey: ['pendingReviewsCount'] })

      toast({
        title: t('reviews.dialog.successTitle'),
        description: t('reviews.dialog.successMessage'),
        variant: 'default'
      })

      setShowReviewDialog(false)
      setCurrentTaskId(null)
    },
    onError: (error: Error) => {
      toast({
        title: t('reviews.dialog.errorTitle'),
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleReviewTask = (taskId: string) => {
    setCurrentTaskId(taskId)
    setShowReviewDialog(true)
  }

  const handleSubmitReview = async (data: ReviewSubmitData) => {
    if (!currentTaskId) return
    await submitReviewMutation.mutateAsync({ taskId: currentTaskId, data })
  }

  const getCurrentTask = () => {
    if (!currentTaskId || !tasks) return null
    return tasks.find((t: any) => t.id === currentTaskId) || null
  }

  const currentTask = getCurrentTask()

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-white/50"></div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={() => router.back()}
          className="mb-6"
        >
          {t('back')}
        </Button>

        {/* Header */}
        <div className="mb-8 bg-white/80 rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('reviews.pending.pageTitle')}
          </h1>
          <p className="text-gray-600">
            {t('reviews.pending.pageDescription')}
          </p>
        </div>

        {/* Pending Reviews List */}
        <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-gray-100">
          <PendingReviewsList
            tasks={tasks}
            onReviewTask={handleReviewTask}
            isLoading={isLoading}
          />
        </div>

        {/* Review Dialog - Only render when we have a valid task */}
        {currentTask && (
          <ReviewDialog
            isOpen={showReviewDialog}
            onClose={() => {
              setShowReviewDialog(false)
              setCurrentTaskId(null)
            }}
            task={currentTask}
            onSubmit={handleSubmitReview}
            isLoading={submitReviewMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
