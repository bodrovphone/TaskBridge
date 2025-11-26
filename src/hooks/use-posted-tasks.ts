import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'

export const POSTED_TASKS_QUERY_KEY = ['posted-tasks']

export interface PostedTask {
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
  deadline?: Date
  images?: string[]
  isStale?: boolean
  daysSinceCreation?: number
}

interface TasksApiResponse {
  tasks: Array<{
    id: string
    title: string
    description: string
    category: string
    subcategory?: string
    budget_min_bgn?: number
    budget_max_bgn?: number
    budget_type?: 'fixed' | 'hourly' | 'negotiable' | 'unclear'
    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
    applicationsCount?: number | null
    selected_professional_id?: string
    professional?: {
      full_name: string
      avatar_url?: string
    }
    city: string
    neighborhood?: string
    created_at: string
    completed_at?: string
    deadline?: string
    images?: string[]
  }>
}

/**
 * Fetch posted tasks from API
 */
async function fetchPostedTasks(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<PostedTask[]> {
  const response = await authenticatedFetch('/api/tasks?mode=posted', {
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch tasks')
  }

  const data: TasksApiResponse = await response.json()

  // Map API data to PostedTask format
  return data.tasks.map((task, index) => {
    // Calculate days since creation for stale task detection
    const daysSinceCreation = Math.floor((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const isStale = daysSinceCreation >= 2 && task.status === 'open' && (task.applicationsCount === 0 || task.applicationsCount === null)

    // For completed/in_progress tasks without a selected professional, add mock professional data
    const needsMockProfessional = (task.status === 'completed' || task.status === 'in_progress') && !task.selected_professional_id

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      subcategory: task.subcategory,
      budget: task.budget_max_bgn || task.budget_min_bgn || 0,
      budgetType: task.budget_type,
      status: task.status,
      applicationsCount: task.applicationsCount || 0,
      acceptedApplication: task.selected_professional_id ? {
        professionalId: task.selected_professional_id,
        professionalName: task.professional?.full_name || 'Professional',
        professionalAvatar: task.professional?.avatar_url || undefined
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
      images: task.images || [],
      isStale,
      daysSinceCreation
    }
  })
}

/**
 * Mark task as complete
 */
async function markTaskComplete(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
  taskId: string
): Promise<void> {
  const response = await authenticatedFetch(`/api/tasks/${taskId}/mark-complete`, {
    method: 'POST',
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to mark task as complete')
  }
}

/**
 * Remove professional from task
 */
async function removeProfessional(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
  taskId: string,
  reason: string,
  description?: string
): Promise<void> {
  const response = await authenticatedFetch(`/api/tasks/${taskId}/remove-professional`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason, description })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove professional')
  }
}

/**
 * Custom hook for posted tasks with TanStack Query
 */
export function usePostedTasks() {
  const { user, loading: authLoading, authenticatedFetch } = useAuth()
  const queryClient = useQueryClient()

  // Fetch posted tasks query
  const tasksQuery = useQuery({
    queryKey: POSTED_TASKS_QUERY_KEY,
    queryFn: () => fetchPostedTasks(authenticatedFetch),
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes - refetch sooner for task management
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  // Mark complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: (taskId: string) => markTaskComplete(authenticatedFetch, taskId),
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: POSTED_TASKS_QUERY_KEY })
    }
  })

  // Remove professional mutation
  const removeProfessionalMutation = useMutation({
    mutationFn: ({ taskId, reason, description }: { taskId: string; reason: string; description?: string }) =>
      removeProfessional(authenticatedFetch, taskId, reason, description),
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: POSTED_TASKS_QUERY_KEY })
    }
  })

  return {
    tasks: tasksQuery.data || [],
    // Show loading state while auth is loading OR query is loading
    isLoading: authLoading || tasksQuery.isLoading,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    markComplete: markCompleteMutation.mutateAsync,
    removeProfessional: removeProfessionalMutation.mutateAsync,
    isMarkingComplete: markCompleteMutation.isPending,
    isRemovingProfessional: removeProfessionalMutation.isPending,
  }
}
