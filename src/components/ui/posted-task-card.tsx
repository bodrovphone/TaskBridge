'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Chip } from '@nextui-org/react'
import { Banknote, MapPin, Calendar, Users, Eye, FileText, CheckCircle, AlertCircle, ShieldAlert, XCircle, RotateCcw, Star } from 'lucide-react'
import { ConfirmCompletionDialog, type ConfirmationData } from '@/components/tasks/confirm-completion-dialog'
import { ReportScamDialog } from '@/components/safety/report-scam-dialog'
import { CancelTaskDialog } from '@/components/tasks/cancel-task-dialog'
import { ReviewDialog } from '@/features/reviews'
import { mockSubmitReview } from '@/features/reviews'
import { useToast } from '@/hooks/use-toast'

interface PostedTaskCardProps {
  id: string
  title: string
  description: string
  category: string
  budget: number
  status: 'open' | 'in_progress' | 'pending_customer_confirmation' | 'completed' | 'cancelled'
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
}

function PostedTaskCard({
  id,
  title,
  description,
  category,
  budget,
  status,
  applicationsCount,
  acceptedApplication,
  location,
  createdAt,
  completedAt,
  hasReview = false,
  lang
}: PostedTaskCardProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [taskHasReview, setTaskHasReview] = useState(hasReview)

  // @todo INTEGRATION: Fetch from user's profile/stats
  const cancellationsThisMonth = 0 // Mock data
  const maxCancellationsPerMonth = 1 // As per PRD

  const getStatusColor = (taskStatus: typeof status) => {
    switch (taskStatus) {
      case 'open':
        return 'primary'
      case 'in_progress':
        return 'warning'
      case 'pending_customer_confirmation':
        return 'secondary'
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
      case 'pending_customer_confirmation':
        return t('postedTasks.filter.awaitingConfirmation')
      case 'completed':
        return t('postedTasks.filter.completed')
      case 'cancelled':
        return t('postedTasks.filter.cancelled')
      default:
        return taskStatus
    }
  }

  const handleConfirmComplete = (data?: ConfirmationData) => {
    console.log('Task confirmed with data:', data)
    // @todo INTEGRATION: Send confirmation to backend API
    setShowConfirmDialog(false)
    // Refresh page or update task status
    router.refresh()
  }

  const handleRejectComplete = (reason: string, description?: string) => {
    console.log('Task rejected:', { reason, description })
    // @todo INTEGRATION: Send rejection to backend API
    setShowConfirmDialog(false)
    router.refresh()
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
      className="shadow-lg border border-white/20 bg-white/95 hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-default"
    >
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
          <Chip size="sm" variant="bordered" className="text-xs">
            {t(category)}
          </Chip>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
          {description}
        </p>

        {/* Task details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-700">{budget} лв</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{location.city}</span>
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
          {status === 'pending_customer_confirmation' && acceptedApplication && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900">
                    {t('postedTasks.awaitingYourConfirmation')}
                  </p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    {acceptedApplication.professionalName} {t('postedTasks.markedComplete')}
                  </p>
                </div>
              </div>
            </div>
          )}
          {status === 'in_progress' && acceptedApplication && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <span className="font-semibold">{t('postedTasks.acceptedProfessional')}:</span>{' '}
                {acceptedApplication.professionalName}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          {status === 'pending_customer_confirmation' ? (
            <>
              {/* Awaiting Confirmation - Confirm button */}
              <Button
                size="sm"
                color="success"
                startContent={<CheckCircle className="w-4 h-4" />}
                onPress={() => setShowConfirmDialog(true)}
                className="w-full sm:flex-1 font-semibold"
              >
                {t('taskCompletion.confirmCompletion')}
              </Button>
              {acceptedApplication && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  startContent={<ShieldAlert className="w-4 h-4" />}
                  onPress={() => setShowReportDialog(true)}
                  className="w-full sm:w-auto"
                >
                  {t('postedTasks.reportIssue')}
                </Button>
              )}
            </>
          ) : status === 'in_progress' ? (
            <>
              {/* In Progress - View Details + Cancel Task + Report */}
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => router.push(`/${lang}/tasks/${id}`)}
                className="w-full sm:flex-1"
              >
                {t('postedTasks.viewDetails')}
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="default"
                startContent={<XCircle className="w-4 h-4" />}
                onPress={() => setShowCancelDialog(true)}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                {t('postedTasks.cancelTask')}
              </Button>
              {acceptedApplication && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<ShieldAlert className="w-4 h-4" />}
                  onPress={() => setShowReportDialog(true)}
                  className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600"
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
                className="w-full sm:flex-1"
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
                  className="w-full sm:w-auto font-semibold"
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
                className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600"
                >
                  {t('postedTasks.reportIssue')}
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Open - View Details + View Applications */}
              <Button
                size="sm"
                variant="solid"
                color="primary"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => router.push(`/${lang}/tasks/${id}`)}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('postedTasks.viewDetails')}
              </Button>
              {applicationsCount > 0 && (
                <Button
                  size="sm"
                  variant="solid"
                  color="secondary"
                  startContent={<FileText className="w-4 h-4" />}
                  onPress={() => router.push(`/${lang}/tasks/${id}#applications`)}
                  className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white"
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
