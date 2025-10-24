'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody, Button, Chip, Tabs, Tab } from '@nextui-org/react'
import { FileText, Plus } from 'lucide-react'
import PostedTaskCard from '@/components/ui/posted-task-card'
import { useCreateTask } from '@/hooks/use-create-task'
import { ReviewDialog, ReviewEnforcementDialog } from '@/features/reviews'
import AuthSlideOver from '@/components/ui/auth-slide-over'

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
}

// Mock data for development
const mockPostedTasks: PostedTask[] = [
  {
    id: '1',
    title: 'Electrical outlet installation in living room',
    description: 'Need to install 3 additional power outlets in the living room',
    category: 'categories.electrical', // Translation key
    budget: 150,
    status: 'open',
    applicationsCount: 5,
    location: {
      city: 'Sofia',
      neighborhood: 'Lozenets'
    },
    createdAt: new Date('2024-10-15'),
    deadline: new Date('2024-10-25')
  },
  {
    id: '2',
    title: 'Kitchen sink plumbing repair',
    description: 'Professional completed the work and is waiting for your confirmation',
    category: 'categories.plumbing',
    budget: 120,
    status: 'pending_customer_confirmation',
    applicationsCount: 4,
    acceptedApplication: {
      professionalId: 'prof-1',
      professionalName: 'Ivan Georgiev'
    },
    location: {
      city: 'Sofia',
      neighborhood: 'Lozenets'
    },
    createdAt: new Date('2024-10-12'),
  },
  {
    id: '2b',
    title: 'Weekly apartment cleaning',
    description: 'Looking for regular cleaning service every Tuesday',
    category: 'categories.houseCleaning', // Translation key
    budget: 80,
    status: 'in_progress',
    applicationsCount: 8,
    acceptedApplication: {
      professionalId: 'prof-2',
      professionalName: 'Maria Petrova'
    },
    location: {
      city: 'Sofia',
      neighborhood: 'Center'
    },
    createdAt: new Date('2024-10-10'),
  },
  {
    id: '3',
    title: 'Plumbing repair - leaking sink',
    description: 'Kitchen sink is leaking, needs urgent repair',
    category: 'categories.plumbing', // Translation key
    budget: 100,
    status: 'completed',
    applicationsCount: 3,
    acceptedApplication: {
      professionalId: 'prof-2',
      professionalName: 'Ivan Georgiev',
      professionalAvatar: undefined
    },
    location: {
      city: 'Sofia',
      neighborhood: 'Mladost'
    },
    createdAt: new Date('2024-10-05'),
    completedAt: new Date('2024-10-20'),
    hasReview: false, // Not reviewed yet - will show "Leave Review" button
  }
]

export function PostedTasksPageContent({ lang }: PostedTasksPageContentProps) {
  const { t } = useTranslation()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('all')

  // Review enforcement hook
  const {
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
  } = useCreateTask()

  const filteredTasks = mockPostedTasks.filter(task => {
    if (selectedStatus === 'all') return true
    return task.status === selectedStatus
  })

  const getTaskCountByStatus = (status: TaskStatus) => {
    if (status === 'all') return mockPostedTasks.length
    return mockPostedTasks.filter(task => task.status === status).length
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
                    <Chip size="sm" variant="flat">{getTaskCountByStatus('all')}</Chip>
                  </div>
                }
              />
              <Tab
                key="open"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.open')}</span>
                    <Chip size="sm" variant="flat" color="primary">{getTaskCountByStatus('open')}</Chip>
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
                key="pending_customer_confirmation"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.awaitingConfirmation')}</span>
                    <Chip size="sm" variant="flat" color="secondary">{getTaskCountByStatus('pending_customer_confirmation')}</Chip>
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
            </Tabs>
          </CardBody>
        </Card>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('postedTasks.empty.title')}
              </h3>
              <p className="text-gray-500 mb-6">{t('postedTasks.empty.message')}</p>
              <Button
                color="primary"
                size="lg"
                startContent={<Plus className="w-5 h-5" />}
                onPress={handleCreateTask}
              >
                {t('postedTasks.empty.createButton')}
              </Button>
            </CardBody>
          </Card>
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
                status={task.status}
                applicationsCount={task.applicationsCount}
                acceptedApplication={task.acceptedApplication}
                location={task.location}
                createdAt={task.createdAt}
                completedAt={task.completedAt}
                hasReview={task.hasReview}
                lang={lang}
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

      {/* Review Enforcement Dialog */}
      <ReviewEnforcementDialog
        isOpen={isEnforcementDialogOpen}
        onClose={() => setIsEnforcementDialogOpen(false)}
        blockType={pendingReviewTasks.length > 0 ? 'missing_reviews' : null}
        pendingTasks={pendingReviewTasks}
        onReviewTask={handleStartReviewing}
      />

      {/* Review Dialog - Sequential Flow */}
      {pendingReviewTasks.length > 0 && (
        <ReviewDialog
          isOpen={isReviewDialogOpen}
          onClose={() => setIsReviewDialogOpen(false)}
          onSubmit={handleSubmitReview}
          task={pendingReviewTasks[currentReviewTaskIndex]}
          isLoading={isSubmittingReview}
          currentIndex={currentReviewTaskIndex}
          totalCount={pendingReviewTasks.length}
        />
      )}
    </div>
  )
}
