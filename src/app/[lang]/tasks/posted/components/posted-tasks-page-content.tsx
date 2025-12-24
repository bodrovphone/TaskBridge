'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Spinner, Tabs, Tab, Chip } from '@nextui-org/react'
import { FileText, Plus, Filter, Star, ArrowRight } from 'lucide-react'
import PostedTaskCard from '@/components/ui/posted-task-card'
import EmptyPostedTasks from '@/components/tasks/empty-posted-tasks'
import { useCreateTask } from '@/hooks/use-create-task'
import { usePostedTasks } from '@/hooks/use-posted-tasks'
import { usePendingReviewsCount } from '@/hooks/use-pending-reviews-count'
import { ReviewEnforcementDialog } from '@/features/reviews'
import AuthSlideOver from '@/components/ui/auth-slide-over'
import { AuthRequiredBanner } from '@/components/common/auth-required-banner'

interface PostedTasksPageContentProps {
  lang: string
}

type TaskStatus = 'all' | 'open' | 'in_progress' | 'completed' | 'cancelled'

export function PostedTasksPageContent({ lang }: PostedTasksPageContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('open')

  // Use TanStack Query hook for data fetching
  const { tasks, isLoading, error, isAuthenticated } = usePostedTasks()

  // Pending reviews count
  const { data: pendingReviewsCount = 0 } = usePendingReviewsCount()

  // Create task hook with auth and review enforcement
  const {
    handleCreateTask,
    showAuthPrompt,
    setShowAuthPrompt,
    showEnforcementDialog,
    setShowEnforcementDialog,
    blockType,
    blockingTasks,
    handleReviewTask
  } = useCreateTask()

  const filteredTasks = tasks.filter(task => {
    if (selectedStatus === 'all') return true
    return task.status === selectedStatus
  })

  const getTaskCountByStatus = (status: TaskStatus) => {
    if (status === 'all') return tasks.length
    return tasks.filter(task => task.status === status).length
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.webp)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-blue-50/50"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-56 h-56 bg-secondary-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                {t('postedTasks.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('postedTasks.subtitle')}</p>
            </div>
            <Button
              size="lg"
              startContent={<Plus className="w-5 h-5" />}
              onPress={handleCreateTask}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 w-full md:w-auto"
            >
              {t('postedTasks.createTask')}
            </Button>
          </div>
        </div>

        {/* Pending Reviews Banner */}
        {pendingReviewsCount > 0 && (
          <Card className="mb-6 shadow-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardBody className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {t('reviews.pending.banner.title', { count: pendingReviewsCount })}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('reviews.pending.banner.description')}
                    </p>
                  </div>
                </div>
                <Button
                  color="warning"
                  variant="solid"
                  size="lg"
                  endContent={<ArrowRight className="w-4 h-4" />}
                  onPress={() => router.push(`/${lang}/reviews/pending`)}
                  className="w-full sm:w-auto font-semibold"
                >
                  {t('reviews.pending.banner.button')}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Filter Tabs - only show when authenticated */}
        {isAuthenticated && (
          <Card className="mb-6 shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-4">
              <Tabs
                selectedKey={selectedStatus}
                onSelectionChange={(key) => setSelectedStatus(key as TaskStatus)}
                variant="light"
                classNames={{
                  tabList: "gap-2 w-full bg-gray-50/50 p-2 rounded-lg",
                  cursor: "bg-white shadow-md",
                  tab: "h-10 px-4",
                  tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-semibold"
                }}
              >
                <Tab
                  key="open"
                  title={
                    <div className="flex items-center gap-2">
                      <span>{t('postedTasks.filter.open')}</span>
                      <Chip size="sm" variant="flat" color="secondary">{getTaskCountByStatus('open')}</Chip>
                    </div>
                  }
                />
                <Tab
                  key="in_progress"
                  title={
                    <div className="flex items-center gap-2">
                      <span>{t('postedTasks.filter.inProgress')}</span>
                      <Chip size="sm" variant="flat" color="warning">{getTaskCountByStatus('in_progress')}</Chip>
                    </div>
                  }
                />
                <Tab
                  key="completed"
                  title={
                    <div className="flex items-center gap-2">
                      <span>{t('postedTasks.filter.completed')}</span>
                      <Chip size="sm" variant="flat" color="success">{getTaskCountByStatus('completed')}</Chip>
                    </div>
                  }
                />
                <Tab
                  key="cancelled"
                  title={
                    <div className="flex items-center gap-2">
                      <span>{t('postedTasks.filter.cancelled')}</span>
                      <Chip size="sm" variant="flat" color="danger">{getTaskCountByStatus('cancelled')}</Chip>
                    </div>
                  }
                />
                <Tab
                  key="all"
                  title={
                    <div className="flex items-center gap-2">
                      <span>{t('postedTasks.filter.all')}</span>
                      <Chip size="sm" variant="flat">{getTaskCountByStatus('all')}</Chip>
                    </div>
                  }
                />
              </Tabs>
            </CardBody>
          </Card>
        )}

        {/* Tasks List */}
        {isLoading ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <Spinner size="lg" className="mb-4" />
              <p className="text-gray-600">{t('postedTasks.loading')}</p>
            </CardBody>
          </Card>
        ) : error ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-red-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('error')}
              </h3>
              <p className="text-gray-500 mb-6">{error.message}</p>
              <Button
                color="primary"
                size="lg"
                onPress={() => window.location.reload()}
              >
                {t('retry')}
              </Button>
            </CardBody>
          </Card>
        ) : !isAuthenticated ? (
          // User not authenticated - show sign-in prompt
          <AuthRequiredBanner />
        ) : filteredTasks.length === 0 ? (
          // Check if truly empty (no tasks at all) or just filtered empty
          tasks.length === 0 ? (
            // No tasks at all - show creative empty state
            <EmptyPostedTasks />
          ) : (
            // Tasks exist but current filter shows none
            <Card className="shadow-xl border border-white/20 bg-white/95">
              <CardBody className="p-12 text-center">
                <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t('common.noResults')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('common.noResultsFilter')}
                </p>
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => setSelectedStatus('all')}
                >
                  {t('common.clearFilters')}
                </Button>
              </CardBody>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <PostedTaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                category={task.category}
                subcategory={task.subcategory}
                budget={task.budget}
                budgetType={task.budgetType}
                status={task.status}
                applicationsCount={task.applicationsCount}
                acceptedApplication={task.acceptedApplication}
                location={task.location}
                createdAt={task.createdAt}
                completedAt={task.completedAt}
                hasReview={task.hasReview}
                lang={lang}
                images={task.images}
              />
            ))}
          </div>
        )}
      </div>

      {/* Auth Slide Over - for Create Task button */}
      <AuthSlideOver
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        action="create-task"
      />

      {/* Review Enforcement Dialog */}
      <ReviewEnforcementDialog
        isOpen={showEnforcementDialog}
        onClose={() => setShowEnforcementDialog(false)}
        blockType={blockType}
        pendingTasks={blockingTasks}
        onReviewTask={handleReviewTask}
      />
    </div>
  )
}
