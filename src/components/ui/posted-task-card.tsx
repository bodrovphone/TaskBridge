'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardBody, Button, Chip, Avatar } from '@nextui-org/react'
import { Banknote, MapPin, Calendar, Users, Eye, FileText, CheckCircle, AlertCircle, ShieldAlert, XCircle, RotateCcw, Star, Edit } from 'lucide-react'
import { ConfirmCompletionDialog, type ConfirmationData } from '@/components/tasks/confirm-completion-dialog'
import { ReportScamDialog } from '@/components/safety/report-scam-dialog'
import { CancelTaskDialog } from '@/components/tasks/cancel-task-dialog'
import { ReviewDialog } from '@/features/reviews'
import { mockSubmitReview } from '@/features/reviews'
import { useToast } from '@/hooks/use-toast'
import { TaskHintBanner } from '@/components/ui/task-hint-banner'
import { useTaskHints } from '@/hooks/use-task-hints'
import DefaultTaskImage from '@/components/ui/default-task-image'
import { getCategoryColor, getCategoryName, getCategoryImage } from '@/lib/utils/category'
import { getCityLabelBySlug } from '@/features/cities'

interface PostedTaskCardProps {
  id: string
  title: string
  description: string
  category: string
  subcategory?: string
  budget: number
  budgetType?: 'fixed' | 'hourly' | 'negotiable' | 'unclear'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  applicationsCount: number
  acceptedApplication?: {
    professionalId: string
    professionalName: string
    professionalAvatar?: string
  }
  location: {
    city: string
    neighborhood: string
  }
  createdAt: Date
  completedAt?: Date
  hasReview?: boolean
  lang: string
  images?: string[]
}

function PostedTaskCard({
  id,
  title,
  description,
  category,
  subcategory,
  budget,
  budgetType,
  status,
  applicationsCount,
  acceptedApplication,
  location,
  createdAt,
  completedAt,
  hasReview = false,
  lang,
  images
}: PostedTaskCardProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isConfirmingCompletion, setIsConfirmingCompletion] = useState(false)
  const [taskHasReview, setTaskHasReview] = useState(hasReview)

  // @todo INTEGRATION: Fetch from user's profile/stats
  const cancellationsThisMonth = 0 // Mock data
  const maxCancellationsPerMonth = 1 // As per PRD

  // Task hints hook
  const taskHintsData = useTaskHints({
    id,
    title,
    description,
    category,
    budget,
    location,
    createdAt,
    applicationsCount,
    status
  })

  // First application celebration
  const [showFirstApplicationBanner, setShowFirstApplicationBanner] = useState(false)

  useEffect(() => {
    // Show banner only for open tasks with exactly 1 application
    if (status === 'open' && applicationsCount === 1) {
      // Check if it was dismissed
      const dismissalKey = `firstApp_${id}`
      const dismissed = localStorage.getItem(dismissalKey)
      if (!dismissed) {
        setShowFirstApplicationBanner(true)
      }
    } else {
      setShowFirstApplicationBanner(false)
    }
  }, [id, status, applicationsCount])

  const handleDismissFirstApplication = () => {
    const dismissalKey = `firstApp_${id}`
    localStorage.setItem(dismissalKey, 'true')
    setShowFirstApplicationBanner(false)
  }

  const getStatusColor = (taskStatus: typeof status) => {
    switch (taskStatus) {
      case 'open':
        return 'primary'
      case 'in_progress':
        return 'warning'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (taskStatus: typeof status) => {
    switch (taskStatus) {
      case 'open':
        return t('postedTasks.filter.open')
      case 'in_progress':
        return t('postedTasks.filter.inProgress')
      case 'completed':
        return t('postedTasks.filter.completed')
      case 'cancelled':
        return t('postedTasks.filter.cancelled')
      default:
        return taskStatus
    }
  }

  const handleConfirmComplete = async (data?: ConfirmationData) => {
    setIsConfirmingCompletion(true)
    try {
      const response = await fetch(`/api/tasks/${id}/mark-complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // ConfirmationData doesn't have notes/photos, only review data
          // Those fields are optional in the API anyway
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark task complete')
      }

      toast({
        title: t('postedTasks.markCompleteSuccess'),
        description: t('postedTasks.markCompleteSuccessDescription'),
        variant: 'success'
      })

      setShowConfirmDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to mark task complete:', error)
      toast({
        title: t('postedTasks.markCompleteError'),
        description: error instanceof Error ? error.message : t('common.errorGeneric'),
        variant: 'destructive'
      })
    } finally {
      setIsConfirmingCompletion(false)
    }
  }

  const handleRejectComplete = async (reason: string, description?: string) => {
    setIsConfirmingCompletion(true)
    try {
      const response = await fetch(`/api/tasks/${id}/confirm-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionData: { reason, description }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject task completion')
      }

      toast({
        title: t('taskCompletion.rejectSuccess'),
        description: t('taskCompletion.rejectSuccessDescription'),
        variant: 'default'
      })

      setShowConfirmDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to reject completion:', error)
      toast({
        title: t('taskCompletion.rejectError'),
        description: error instanceof Error ? error.message : t('common.errorGeneric'),
        variant: 'destructive'
      })
    } finally {
      setIsConfirmingCompletion(false)
    }
  }

  const handleCancelTask = (reason: string, description?: string) => {
    console.log('Cancelling task:', id, { reason, description })
    // @todo INTEGRATION: Call API to cancel task (status = 'cancelled')
    // @todo INTEGRATION: Increment user's cancellationsThisMonth counter
    // @todo INTEGRATION: If exceeds limit, trigger account action/review
    setShowCancelDialog(false)
    router.refresh()
  }

  const handleReopenTask = () => {
    if (confirm(t('postedTasks.reopenTaskConfirm'))) {
      console.log('Reopening task:', id)
      // @todo: Call API to reopen task (status = 'open', clear selectedProfessionalId)
      router.refresh()
    }
  }

  const handleSubmitReview = async (data: { taskId: string; rating: number; reviewText?: string; actualPricePaid?: number }) => {
    setIsSubmittingReview(true)
    try {
      await mockSubmitReview(data)

      toast({
        title: t('reviews.success'),
        variant: 'success'
      })

      setTaskHasReview(true)
      setShowReviewDialog(false)
      // @todo INTEGRATION: Update task hasReview in backend
    } catch (error) {
      toast({
        title: t('reviews.error'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <Card
      className="shadow-lg border border-white/20 bg-white/95 hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-default overflow-hidden"
    >
      {/* Task Image */}
      <div
        className="w-full h-48 overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => router.push(`/${lang}/tasks/${id}`)}
      >
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={title}
            width={400}
            height={192}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // Show category-based default when no photos
          <DefaultTaskImage
            category={category}
            className="w-full h-full"
          />
        )}
      </div>

      <CardBody className="p-6 flex flex-col h-full">
        {/* Header with title and status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => router.push(`/${lang}/tasks/${id}`)}
          >
            {title}
          </h3>
          <Chip
            color={getStatusColor(status)}
            variant="flat"
            size="sm"
            className="flex-shrink-0"
          >
            {getStatusLabel(status)}
          </Chip>
        </div>

        {/* Category chip */}
        <div className="mb-3">
          <Chip size="sm" variant="bordered" className={`text-xs ${getCategoryColor(category)}`}>
            {getCategoryName(t, category, subcategory)}
          </Chip>
        </div>

        {/* First Application Success Banner */}
        {showFirstApplicationBanner && (
          <div className="mb-3 bg-green-50 border-2 border-green-300 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    {t('postedTasks.firstApplication.title', 'Great news! You have your first application')}
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {t('postedTasks.firstApplication.message', 'Check the application details and respond to the professional')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissFirstApplication}
                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100 transition-colors flex-shrink-0"
                aria-label={t('taskHints.dismiss', 'Dismiss')}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Task Hints Banner */}
        {taskHintsData.shouldShow && (
          <TaskHintBanner
            taskId={id}
            taskAge={taskHintsData.taskAge}
            hints={taskHintsData.hints}
            onDismiss={taskHintsData.dismiss}
          />
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
          {description}
        </p>

        {/* Task details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-700">
              {budgetType === 'unclear' ? t('taskCard.budget.unclear') : `${budget} лв`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{getCityLabelBySlug(location.city, t)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-primary">
              {t('postedTasks.applicationsCount', { count: applicationsCount })}
            </span>
          </div>
        </div>

        {/* Status-specific banners - fixed height with min-h to prevent layout shift */}
        <div className="min-h-[52px] mb-4">
          {status === 'in_progress' && acceptedApplication && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <span className="font-semibold">{t('postedTasks.acceptedProfessional')}:</span>{' '}
                {acceptedApplication.professionalName}
              </p>
            </div>
          )}
          {status === 'completed' && acceptedApplication && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                {acceptedApplication.professionalAvatar && (
                  <Avatar
                    src={acceptedApplication.professionalAvatar}
                    name={acceptedApplication.professionalName}
                    size="sm"
                    className="flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900 truncate">
                    {acceptedApplication.professionalName}
                  </p>
                  <p className="text-xs text-blue-700">
                    {t('postedTasks.completedBy', 'Completed by professional')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className={`flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-auto ${status === 'open' ? 'sm:justify-start' : ''}`}>
          {status === 'in_progress' ? (
            <>
              {/* In Progress - View Details + Mark Complete + Report */}
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => router.push(`/${lang}/tasks/${id}`)}
                className="w-full sm:flex-1 py-6"
              >
                {t('postedTasks.viewDetails')}
              </Button>
              {acceptedApplication && (
                <Button
                  size="sm"
                  color="success"
                  variant="bordered"
                  startContent={<CheckCircle className="w-4 h-4" />}
                  onPress={() => setShowConfirmDialog(true)}
                  className="w-full sm:w-auto font-semibold py-6"
                >
                  {t('postedTasks.markComplete')}
                </Button>
              )}
              {acceptedApplication && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<ShieldAlert className="w-4 h-4" />}
                  onPress={() => setShowReportDialog(true)}
                  className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 py-6"
                >
                  {t('postedTasks.reportIssue')}
                </Button>
              )}
            </>
          ) : status === 'completed' || status === 'cancelled' ? (
            <>
              {/* Completed/Cancelled - View Details + Leave Review / Reopen */}
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => router.push(`/${lang}/tasks/${id}`)}
                className="w-full sm:flex-1 py-6"
              >
                {t('postedTasks.viewDetails')}
              </Button>
              {status === 'completed' && acceptedApplication && !taskHasReview && (
                <Button
                  size="sm"
                  variant="solid"
                  color="warning"
                  startContent={<Star className="w-4 h-4" />}
                  onPress={() => setShowReviewDialog(true)}
                  className="w-full sm:w-auto font-semibold py-6"
                >
                  {t('reviews.pending.leaveReviewButton')}
                </Button>
              )}
              <Button
                size="sm"
                variant="bordered"
                color="secondary"
                startContent={<RotateCcw className="w-4 h-4" />}
                onPress={handleReopenTask}
                className="w-full sm:w-auto py-6"
              >
                {t('postedTasks.reopenTask')}
              </Button>
              {status === 'completed' && acceptedApplication && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<ShieldAlert className="w-4 h-4" />}
                  onPress={() => setShowReportDialog(true)}
                  className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 py-6"
                >
                  {t('postedTasks.reportIssue')}
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Open - View Details + Edit Task + View Applications */}
              <Button
                size="sm"
                variant="solid"
                color="primary"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => router.push(`/${lang}/tasks/${id}`)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-6"
              >
                {t('postedTasks.viewDetails')}
              </Button>
              <Button
                size="sm"
                variant="bordered"
                color="primary"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => router.push(`/${lang}/tasks/${id}/edit`)}
                className="w-full sm:w-auto py-6"
              >
                {t('postedTasks.editTask')}
              </Button>
              {applicationsCount > 0 && (
                <Button
                  size="sm"
                  variant="solid"
                  color="secondary"
                  startContent={<FileText className="w-4 h-4" />}
                  onPress={() => router.push(`/${lang}/tasks/${id}#applications`)}
                  className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white py-6"
                >
                  {t('postedTasks.viewApplications')} ({applicationsCount})
                </Button>
              )}
            </>
          )}
        </div>
      </CardBody>

      {/* Confirmation Dialog */}
      <ConfirmCompletionDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmComplete}
        onReject={handleRejectComplete}
        onReportProfessional={() => {
          setShowConfirmDialog(false)
          setShowReportDialog(true)
        }}
        professionalName={acceptedApplication?.professionalName || ''}
        taskTitle={title}
        isLoading={isConfirmingCompletion}
      />

      {/* Report Scam Dialog */}
      {acceptedApplication && (
        <ReportScamDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          reportedUserId={acceptedApplication.professionalId}
          reportedUserName={acceptedApplication.professionalName}
          relatedTaskId={id}
        />
      )}

      {/* Cancel Task Dialog */}
      <CancelTaskDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelTask}
        taskTitle={title}
        professionalName={acceptedApplication?.professionalName}
        cancellationsThisMonth={cancellationsThisMonth}
        maxCancellationsPerMonth={maxCancellationsPerMonth}
      />

      {/* Review Dialog */}
      {status === 'completed' && acceptedApplication && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          onSubmit={handleSubmitReview}
          task={{
            id: id,
            title: title,
            professionalId: acceptedApplication.professionalId,
            professionalName: acceptedApplication.professionalName,
            professionalAvatar: acceptedApplication.professionalAvatar,
            completedAt: completedAt || new Date(),
            daysAgo: completedAt
              ? Math.floor((Date.now() - completedAt.getTime()) / (24 * 60 * 60 * 1000))
              : 0
          }}
          isLoading={isSubmittingReview}
        />
      )}
    </Card>
  )
}

PostedTaskCard.displayName = 'PostedTaskCard'

export default PostedTaskCard
