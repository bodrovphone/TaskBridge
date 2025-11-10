'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Chip, Tabs, Tab, Avatar, Spinner } from '@nextui-org/react'
import { Briefcase, Calendar, Phone, Mail, MapPin, User, Banknote, Send, AlertCircle } from 'lucide-react'
import { MarkCompletedDialog } from '@/components/tasks/mark-completed-dialog'
import { getCityLabelBySlug } from '@/features/cities'
import { useWorkTasks, type WorkTask } from '../hooks/use-work-tasks'

interface MyWorkContentProps {
  lang: string
}

type WorkFilter = 'in_progress' | 'pending_completion' | 'completed'

export function MyWorkContent({ lang }: MyWorkContentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState<WorkFilter>('in_progress')
  const [isMarkCompletedDialogOpen, setIsMarkCompletedDialogOpen] = useState(false)
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<WorkTask | null>(null)

  // Fetch accepted applications from API
  const { tasks: workTasks, isLoading, error } = useWorkTasks()

  const filteredTasks = workTasks.filter(task => {
    switch (selectedFilter) {
      case 'in_progress':
        return task.task.status === 'in_progress'
      case 'pending_completion':
        return task.task.status === 'pending_professional_confirmation'
      case 'completed':
        return task.task.status === 'completed'
      default:
        return true
    }
  })

  const getTaskCountByFilter = (filter: WorkFilter) => {
    return workTasks.filter(task => {
      switch (filter) {
        case 'in_progress':
          return task.task.status === 'in_progress'
        case 'pending_completion':
          return task.task.status === 'pending_professional_confirmation'
        case 'completed':
          return task.task.status === 'completed'
        default:
          return false
      }
    }).length
  }

  const getDaysStarted = (startDate?: Date) => {
    if (!startDate) return 0
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleMarkAsCompleteClick = (task: WorkTask) => {
    setSelectedTaskForCompletion(task)
    setIsMarkCompletedDialogOpen(true)
  }

  const handleMarkCompletedConfirm = async (data: any) => {
    if (!selectedTaskForCompletion) return

    try {
      const response = await fetch(`/api/tasks/${selectedTaskForCompletion.taskId}/mark-complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completionNotes: data.notes,
          completionPhotos: data.completionPhotos?.map((file: File) => file.name) // @todo: Upload photos to Supabase Storage first
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mark task complete')
      }

      // Success! Close dialog and refresh page
      setIsMarkCompletedDialogOpen(false)
      setSelectedTaskForCompletion(null)

      // Refresh to show updated status
      router.refresh()

    } catch (error: any) {
      console.error('Error marking task complete:', error)
      alert(error.message || 'Failed to mark task complete')
    }
  }

  // Convert filter key to translation key format
  const getEmptyStateKey = (filter: WorkFilter) => {
    switch (filter) {
      case 'in_progress':
        return 'inProgress'
      case 'pending_completion':
        return 'pendingCompletion'
      case 'completed':
        return 'completed'
      default:
        return 'inProgress'
    }
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
      {/* Layered overlays */}
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
                {t('myWork.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('myWork.subtitle')}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                color="default"
                size="lg"
                variant="bordered"
                startContent={<Send className="w-5 h-5" />}
                onPress={() => router.push(`/${lang}/tasks/applications`)}
                className="shadow-lg flex-1 sm:flex-none"
              >
                {t('myApplications.title')}
              </Button>
              <Button
                color="primary"
                size="lg"
                startContent={<Briefcase className="w-5 h-5" />}
                onPress={() => router.push(`/${lang}/browse-tasks`)}
                className="shadow-lg flex-1 sm:flex-none"
              >
                {t('myWork.empty.inProgress.browseButton')}
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6 shadow-xl border border-white/20 bg-white/95">
          <CardBody className="p-4">
            <Tabs
              selectedKey={selectedFilter}
              onSelectionChange={(key) => setSelectedFilter(key as WorkFilter)}
              variant="light"
              classNames={{
                tabList: "gap-2 w-full bg-gray-50/50 p-2 rounded-lg",
                cursor: "bg-white shadow-md",
                tab: "h-10 px-4",
                tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-semibold"
              }}
            >
              <Tab
                key="in_progress"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myWork.filter.inProgress')}</span>
                    <Chip size="sm" variant="flat" color="primary">{getTaskCountByFilter('in_progress')}</Chip>
                  </div>
                }
              />
              <Tab
                key="pending_completion"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myWork.filter.pendingCompletion')}</span>
                    <Chip size="sm" variant="flat" color="warning">{getTaskCountByFilter('pending_completion')}</Chip>
                  </div>
                }
              />
              <Tab
                key="completed"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myWork.filter.completed')}</span>
                    <Chip size="sm" variant="flat" color="success">{getTaskCountByFilter('completed')}</Chip>
                  </div>
                }
              />
            </Tabs>
          </CardBody>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">{t('myWork.loading', 'Loading your work...')}</p>
            </CardBody>
          </Card>
        ) : error ? (
          /* Error State */
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('myWork.error.title', 'Failed to Load')}
              </h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button
                color="primary"
                size="lg"
                onPress={() => window.location.reload()}
              >
                {t('common.retry', 'Try Again')}
              </Button>
            </CardBody>
          </Card>
        ) : filteredTasks.length === 0 ? (
          /* Empty State */
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t(`myWork.empty.${getEmptyStateKey(selectedFilter)}.title`)}
              </h3>
              <p className="text-gray-500 mb-6">{t(`myWork.empty.${getEmptyStateKey(selectedFilter)}.message`)}</p>
              {selectedFilter === 'in_progress' && (
                <Button
                  color="primary"
                  size="lg"
                  startContent={<Briefcase className="w-5 h-5" />}
                  onPress={() => router.push(`/${lang}/browse-tasks`)}
                >
                  {t('myWork.empty.inProgress.browseButton')}
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="shadow-lg border border-white/20 bg-white/95 hover:shadow-xl transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar
                        name={task.customer.name}
                        src={task.customer.avatar}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {task.taskTitle}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {task.taskDescription}
                        </p>

                        {/* Task Progress Info */}
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Banknote className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{task.agreedPrice} лв</span>
                          </div>
                          {task.startDate && selectedFilter === 'in_progress' && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Calendar className="w-4 h-4" />
                              <span>{t('myWork.startedDaysAgo', { days: getDaysStarted(task.startDate) })}</span>
                            </div>
                          )}
                          {task.task.deadline && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-orange-600" />
                              <span className="font-medium">{t('myWork.taskDeadline')}: {task.task.deadline.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Contact Information (Only for accepted work) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      {t('myWork.customerContact')}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{task.customer.name}</span>
                      </div>
                      {task.customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <a href={`tel:${task.customer.phone}`} className="hover:underline">
                            {task.customer.phone}
                          </a>
                        </div>
                      )}
                      {task.customer.email && (
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <a href={`mailto:${task.customer.email}`} className="hover:underline">
                            {task.customer.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{getCityLabelBySlug(task.task.location.city, t)}, {task.task.location.neighborhood}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 justify-between items-center">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => router.push(`/${lang}/tasks/${task.taskId}`)}
                    >
                      {t('myApplications.viewTask')}
                    </Button>
                    <div className="flex gap-2">
                      {selectedFilter === 'in_progress' && (
                        <Button
                          size="sm"
                          color="success"
                          variant="bordered"
                          onPress={() => handleMarkAsCompleteClick(task)}
                        >
                          {t('myApplications.markCompleted')}
                        </Button>
                      )}
                      {selectedFilter === 'pending_completion' && (
                        <Button
                          size="sm"
                          color="success"
                          onPress={() => console.log('Confirm completion:', task.id)}
                        >
                          {t('myWork.confirmCompletion')}
                        </Button>
                      )}
                      {selectedFilter === 'completed' && (
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => console.log('View review:', task.id)}
                        >
                          {t('myWork.viewReview')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mark Completed Dialog */}
      {selectedTaskForCompletion && (
        <MarkCompletedDialog
          isOpen={isMarkCompletedDialogOpen}
          onClose={() => {
            setIsMarkCompletedDialogOpen(false)
            setSelectedTaskForCompletion(null)
          }}
          onConfirm={handleMarkCompletedConfirm}
          taskTitle={selectedTaskForCompletion.taskTitle}
          customerName={selectedTaskForCompletion.customer.name}
          payment={`${selectedTaskForCompletion.agreedPrice} лв`}
        />
      )}
    </div>
  )
}
