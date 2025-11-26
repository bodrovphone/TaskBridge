import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'

export const APPLICATIONS_QUERY_KEY = ['applications']

export interface MyApplication {
  id: string
  taskId: string
  taskTitle: string
  taskDescription: string
  customerName: string
  customerAvatar?: string
  proposedPrice: number
  timeline: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  submittedAt: Date
  task: {
    budget: number
    category: string
    location: {
      city: string
      neighborhood: string
    }
  }
}

interface ApplicationsApiResponse {
  applications: Array<{
    id: string
    task: {
      id: string
      title: string
      description: string
      customer?: {
        full_name: string
        avatar_url?: string
      }
      budget_max_bgn?: number
      category: string
      city?: string
      neighborhood?: string
    }
    proposed_price_bgn: number
    estimated_duration_hours?: number | null
    message: string
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
    created_at: string
  }>
}

/**
 * Helper function to convert hours to user-friendly timeline text
 */
function formatTimeline(hours: number | null | undefined, t: (key: string) => string): string {
  if (!hours) return t('application.timelineFlexible')

  if (hours <= 24) return t('application.timelineToday')
  if (hours <= 72) return t('application.timeline3days')
  if (hours <= 168) return t('application.timelineWeek')

  // For custom durations, show hours with unit
  return `${hours}${t('application.hoursShort')}`
}

/**
 * Fetch applications from API
 */
async function fetchApplications(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
  statusFilter?: string,
  t?: (key: string) => string
): Promise<MyApplication[]> {
  const statusParam = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''
  const response = await authenticatedFetch(`/api/applications${statusParam}`, {
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }

  const data: ApplicationsApiResponse = await response.json()

  // Map API data to MyApplication format
  return data.applications.map((app) => ({
    id: app.id,
    taskId: app.task.id,
    taskTitle: app.task.title,
    taskDescription: app.task.description,
    customerName: app.task.customer?.full_name || 'Unknown',
    customerAvatar: app.task.customer?.avatar_url,
    proposedPrice: app.proposed_price_bgn,
    timeline: t ? formatTimeline(app.estimated_duration_hours, t) : `${app.estimated_duration_hours || 0}h`,
    message: app.message,
    status: app.status,
    submittedAt: new Date(app.created_at),
    task: {
      budget: app.task.budget_max_bgn || 0,
      category: app.task.category,
      location: {
        city: app.task.city || '',
        neighborhood: app.task.neighborhood || ''
      }
    }
  }))
}

/**
 * Withdraw application
 */
async function withdrawApplication(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
  applicationId: string,
  reason?: string
): Promise<void> {
  const response = await authenticatedFetch(`/api/applications/${applicationId}/withdraw`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      reason: reason || undefined
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to withdraw application')
  }
}

/**
 * Custom hook for applications with TanStack Query
 */
export function useApplications(
  statusFilter: 'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn' = 'pending',
  t?: (key: string) => string
) {
  const { user, authenticatedFetch } = useAuth()
  const queryClient = useQueryClient()

  // Fetch applications query
  const applicationsQuery = useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, statusFilter],
    queryFn: () => fetchApplications(authenticatedFetch, statusFilter, t),
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes - frequently changing
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  // Withdraw application mutation
  const withdrawMutation = useMutation({
    mutationFn: ({ applicationId, reason }: { applicationId: string; reason?: string }) =>
      withdrawApplication(authenticatedFetch, applicationId, reason),
    onSuccess: () => {
      // Invalidate all applications queries to refetch
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY })
    }
  })

  return {
    applications: applicationsQuery.data || [],
    isLoading: applicationsQuery.isLoading,
    error: applicationsQuery.error,
    refetch: applicationsQuery.refetch,
    withdraw: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
  }
}
