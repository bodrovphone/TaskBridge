'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody, Button, Chip, Tabs, Tab, Spinner } from '@nextui-org/react'
import { FileText, Plus, Filter } from 'lucide-react'
import PostedTaskCard from '@/components/ui/posted-task-card'
import EmptyPostedTasks from '@/components/tasks/empty-posted-tasks'
import { useCreateTask } from '@/hooks/use-create-task'
// @todo FEATURE: Uncomment when reviews feature is built
// import { ReviewDialog, ReviewEnforcementDialog } from '@/features/reviews'
import AuthSlideOver from '@/components/ui/auth-slide-over'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface PostedTasksPageContentProps {
  lang: string
}

type TaskStatus = 'all' | 'open' | 'in_progress' | 'pending_customer_confirmation' | 'completed' | 'cancelled'

interface PostedTask {
  id: string
  title: string
  description: string
  category: string
  budget: number
  budgetType?: 'fixed' | 'hourly' | 'negotiable' | 'unclear'
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
  deadline?: Date
  images?: string[]
  isStale?: boolean
  daysSinceCreation?: number
}

export function PostedTasksPageContent({ lang }: PostedTasksPageContentProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('all')
  const [tasks, setTasks] = useState<PostedTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create task hook with auth
  const {
    handleCreateTask,
    showAuthPrompt,
    setShowAuthPrompt
    // @todo FEATURE: Add review-related properties when reviews feature is built
  } = useCreateTask()

  // Fetch real tasks from API
  useEffect(() => {
    async function fetchTasks() {
      if (!user) {
        setIsLoading(false)
        setTasks([])
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch('/api/tasks?mode=posted', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }

        const data = await response.json()

        // Map API data to PostedTask format and mix in mock UI elements
        const mappedTasks: PostedTask[] = data.tasks.map((task: any, index: number) => {
          // Calculate days since creation for stale task detection
          const daysSinceCreation = Math.floor((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
          const isStale = daysSinceCreation >= 2 && task.status === 'open' && (task.applicationsCount === 0 || task.applicationsCount === null)

          // For completed/in_progress tasks without a selected professional, add mock professional data
          const needsMockProfessional = (task.status === 'completed' || task.status === 'in_progress' || task.status === 'pending_customer_confirmation') && !task.selected_professional_id

          return {
            id: task.id,
            title: task.title,
            description: task.description,
            category: task.category,
            budget: task.budget_max_bgn || task.budget_min_bgn || 0,
            budgetType: task.budget_type,
            status: task.status,
            applicationsCount: task.applicationsCount || 0,
            acceptedApplication: task.selected_professional_id ? {
              professionalId: task.selected_professional_id,
              professionalName: 'Professional', // @todo: Fetch professional details
              professionalAvatar: undefined
            } : needsMockProfessional ? {
              // Add mock professional for demo purposes
              professionalId: `mock-prof-${index}`,
              professionalName: index % 2 === 0 ? 'Ivan Georgiev' : 'Maria Petrova',
              professionalAvatar: undefined
            } : undefined,
            location: {
              city: task.city,
              neighborhood: task.neighborhood || ''
            },
            createdAt: new Date(task.created_at),
            completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
            // Mix in mock UI elements: 50% of completed tasks need review
            hasReview: task.status === 'completed' ? (index % 2 === 0 ? false : true) : undefined,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
            images: task.images || [], // Task images from database
            isStale,
            daysSinceCreation
          }
        })

        setTasks(mappedTasks)
        setError(null)

        // Debug: Log task statuses and counts
        console.log('📊 Posted Tasks Status Summary:', {
          total: mappedTasks.length,
          byStatus: mappedTasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        })
      } catch (err) {
        console.error('Error fetching tasks:', err)
        setError(err instanceof Error ? err.message : 'Failed to load tasks')
        setTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [user])

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
        backgroundImage: 'url(/images/cardboard.png)',
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                {t('postedTasks.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('postedTasks.subtitle')}</p>
            </div>
            <Button
              color="primary"
              size="lg"
              startContent={<Plus className="w-5 h-5" />}
              onPress={handleCreateTask}
              className="shadow-lg"
            >
              {t('postedTasks.createTask')}
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
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
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.all')}</span>
                    <Chip size="sm" variant="flat" color="default">{getTaskCountByStatus('all')}</Chip>
                  </div>
                }
              />
              <Tab
                key="open"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.open')}</span>
                    <Chip size="sm" variant="solid" color="primary">{getTaskCountByStatus('open')}</Chip>
                  </div>
                }
              />
              <Tab
                key="in_progress"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.inProgress')}</span>
                    <Chip size="sm" variant="solid" color="warning">{getTaskCountByStatus('in_progress')}</Chip>
                  </div>
                }
              />
              <Tab
                key="pending_customer_confirmation"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.awaitingConfirmation')}</span>
                    <Chip size="sm" variant="solid" color="secondary">{getTaskCountByStatus('pending_customer_confirmation')}</Chip>
                  </div>
                }
              />
              <Tab
                key="completed"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.completed')}</span>
                    <Chip size="sm" variant="solid" color="success">{getTaskCountByStatus('completed')}</Chip>
                  </div>
                }
              />
              <Tab
                key="cancelled"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.cancelled')}</span>
                    <Chip size="sm" variant="solid" color="danger">{getTaskCountByStatus('cancelled')}</Chip>
                  </div>
                }
              />
            </Tabs>
          </CardBody>
        </Card>

        {/* Tasks List */}
        {isLoading ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <Spinner size="lg" className="mb-4" />
              <p className="text-gray-600">{t('loading', 'Loading...')}</p>
            </CardBody>
          </Card>
        ) : error ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-red-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('error', 'Error loading tasks')}
              </h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button
                color="primary"
                size="lg"
                onPress={() => window.location.reload()}
              >
                {t('retry', 'Try Again')}
              </Button>
            </CardBody>
          </Card>
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
                  {t('common.noResults', 'No tasks found')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('common.noResultsFilter', 'Try selecting a different status filter')}
                </p>
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => setSelectedStatus('all')}
                >
                  {t('common.clearFilters', 'View All Tasks')}
                </Button>
              </CardBody>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <PostedTaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                category={task.category}
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

      {/* Auth Slide Over */}
      <AuthSlideOver
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        action="create-task"
      />

      {/* @todo FEATURE: Review dialogs (commented out until reviews feature is built) */}
      {/* <ReviewEnforcementDialog
        isOpen={isEnforcementDialogOpen}
        onClose={() => setIsEnforcementDialogOpen(false)}
        blockType={pendingReviewTasks.length > 0 ? 'missing_reviews' : null}
        pendingTasks={pendingReviewTasks}
        onReviewTask={handleStartReviewing}
      /> */}

      {/* Review Dialog - Sequential Flow */}
      {/* {pendingReviewTasks.length > 0 && (
        <ReviewDialog
          isOpen={isReviewDialogOpen}
          onClose={() => setIsReviewDialogOpen(false)}
          onSubmit={handleSubmitReview}
          task={pendingReviewTasks[currentReviewTaskIndex]}
          isLoading={isSubmittingReview}
          currentIndex={currentReviewTaskIndex}
          totalCount={pendingReviewTasks.length}
        />
      )} */}
    </div>
  )
}
