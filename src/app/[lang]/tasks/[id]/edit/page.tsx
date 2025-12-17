'use client'

import { useTranslations } from 'next-intl'
import { Chip, Skeleton, Card, CardBody } from '@nextui-org/react'
import { useParams, useRouter } from 'next/navigation'
import { Edit, CheckCircle, Clock, Shield, Users } from 'lucide-react'
import { EditTaskForm } from './components/edit-task-form'
import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth'
import type { Task } from '@/server/tasks/task.types'

interface TaskFormData {
  id: string
  title: string
  description: string
  category: string
  subcategory?: string
  city: string
  neighborhood?: string
  requirements?: string
  budgetType: 'fixed' | 'range' | 'unclear'
  budgetMin?: number | null
  budgetMax?: number | null
  urgency: 'same_day' | 'within_week' | 'flexible'
  deadline?: Date
  images?: string[]
}

export default function EditTaskPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, authenticatedFetch } = useAuth()
  const taskId = params?.id as string
  const lang = params?.lang as string

  const [taskData, setTaskData] = useState<TaskFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTask() {
      try {
        setIsLoading(true)
        const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in to edit tasks')
            return
          }
          if (response.status === 404) {
            setError('Task not found')
            return
          }
          if (response.status === 403) {
            setError('You do not have permission to edit this task')
            return
          }
          throw new Error('Failed to load task')
        }

        const result = await response.json()
        const task: Task = result.task

        // Check if user is the task owner (frontend validation)
        if (user && task.customer_id !== user.id) {
          setError('You do not have permission to edit this task')
          return
        }

        // Map database fields to form structure
        const formData: TaskFormData = {
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          subcategory: task.subcategory || '',
          city: task.city,
          neighborhood: task.neighborhood || '',
          requirements: task.location_notes || '',
          budgetType: mapDbBudgetTypeToForm(task.budget_type),
          budgetMin: task.budget_min_bgn,
          budgetMax: task.budget_max_bgn,
          urgency: mapDeadlineToUrgency(task.deadline, task.is_urgent),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
          images: task.images || []
        }

        setTaskData(formData)
      } catch (err: any) {
        console.error('Error fetching task:', err)
        setError(err.message || 'Failed to load task')
      } finally {
        setIsLoading(false)
      }
    }

    // Wait for auth to finish loading before checking user
    if (authLoading) {
      return // Still loading auth, don't do anything yet
    }

    // Auth has loaded, now check if user is authenticated
    if (taskId) {
      if (!user) {
        // Auth loaded but no user = not authenticated
        setIsLoading(false)
        setError('Please log in to edit tasks')
        return
      }

      // User exists, fetch the task
      fetchTask()
    }
  }, [taskId, user, authLoading, authenticatedFetch])

  // Map database budget_type to form budgetType
  function mapDbBudgetTypeToForm(budgetType: string): 'fixed' | 'range' | 'unclear' {
    if (budgetType === 'fixed') return 'fixed'
    if (budgetType === 'unclear') return 'unclear'
    return 'range' // negotiable, hourly -> range
  }

  // Map deadline to urgency
  function mapDeadlineToUrgency(
    deadline: string | null,
    isUrgent: boolean
  ): 'same_day' | 'within_week' | 'flexible' {
    if (!deadline) return 'flexible'
    if (isUrgent) return 'same_day'

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) return 'within_week'
    return 'flexible'
  }

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          {/* Hero Section Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4 rounded-lg" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-8 rounded-lg" />
            <div className="flex flex-wrap justify-center gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-full" />
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-6 mb-12">
            {/* Category Card */}
            <Card className="shadow-md">
              <CardBody className="p-6 md:p-8 space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </CardBody>
            </Card>

            {/* Task Details Card */}
            <Card className="shadow-md">
              <CardBody className="p-6 md:p-8 space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardBody>
            </Card>

            {/* Location Card */}
            <Card className="shadow-md">
              <CardBody className="p-6 md:p-8 space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </CardBody>
            </Card>

            {/* Budget Card */}
            <Card className="shadow-md">
              <CardBody className="p-6 md:p-8 space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardBody>
            </Card>

            {/* Submit Button Skeleton */}
            <div className="flex justify-center pt-8">
              <Skeleton className="h-16 w-80 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !taskData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-lg font-semibold mb-4">
            {error || 'Failed to load task'}
          </p>
          <button
            onClick={() => router.push(`/${lang}/tasks/posted`)}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            {t('common.goBack')}
          </button>
        </div>
      </div>
    )
  }

  const trustIndicators = [
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: t('editTask.freeToEdit'),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: t('editTask.noPayment'),
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: t('editTask.instantSave'),
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: t('editTask.prosWillSee'),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Hero Section with Edit Banner */}
        <div className="text-center mb-12">
          {/* Editing Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6 flex items-center justify-center gap-3">
            <Edit className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {t('editTask.editingBanner', { title: taskData.title })}
              </p>
              <p className="text-xs text-amber-700">
                {t('editTask.editingSubtext')}
              </p>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('editTask.title')}
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            {t('editTask.subtitle')}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-3 max-w-full overflow-x-hidden px-4">
            {trustIndicators.map((indicator, index) => (
              <Chip
                key={index}
                startContent={indicator.icon}
                variant="flat"
                color="success"
                size="lg"
                className="shadow-sm flex-shrink-0 max-w-full"
                classNames={{
                  base: "max-w-full bg-green-100",
                  content: "truncate text-green-800"
                }}
              >
                {indicator.text}
              </Chip>
            ))}
          </div>
        </div>

        {/* Form - No outer card, each section has its own card */}
        <div className="space-y-6 mb-12">
          <EditTaskForm taskData={taskData} />
        </div>
      </div>
    </div>
  )
}
