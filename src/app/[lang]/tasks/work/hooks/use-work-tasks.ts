'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';

export const WORK_TASKS_QUERY_KEY = ['work-tasks'];

export interface WorkTask {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  customer: {
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };
  sharedContactInfo?: {
    method: 'phone' | 'email' | 'custom';
    phone?: string;
    email?: string;
    customContact?: string;
  };
  agreedPrice: number;
  timeline: string;
  startDate?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  task: {
    deadline?: Date;
    category: string;
    location: {
      city: string;
      neighborhood: string;
    };
    status: 'in_progress' | 'completed';
  };
}

interface WorkTasksApiResponse {
  applications: Array<{
    id: string;
    task: {
      id: string;
      title: string;
      description: string;
      customer?: {
        full_name: string;
        avatar_url?: string;
        phone?: string;
        email?: string;
      };
      category?: string;
      city?: string;
      neighborhood?: string;
      status?: string;
    };
    proposed_price_bgn?: number;
    estimated_duration_hours?: number;
    responded_at?: string;
    accepted_at?: string;
    created_at?: string;
    shared_contact_info?: any;
  }>;
}

/**
 * Transform API application to WorkTask format
 */
function transformWorkTask(app: WorkTasksApiResponse['applications'][0]): WorkTask {
  // Parse shared contact info if it exists
  let sharedContactInfo = undefined;
  if (app.shared_contact_info) {
    try {
      sharedContactInfo =
        typeof app.shared_contact_info === 'string'
          ? JSON.parse(app.shared_contact_info)
          : app.shared_contact_info;
    } catch (e) {
      console.error('Failed to parse shared_contact_info:', e);
    }
  }

  return {
    id: app.id,
    taskId: app.task.id,
    taskTitle: app.task.title,
    taskDescription: app.task.description,
    customer: {
      name: app.task.customer?.full_name || 'Unknown',
      avatar: app.task.customer?.avatar_url,
      phone: app.task.customer?.phone,
      email: app.task.customer?.email,
    },
    sharedContactInfo,
    agreedPrice: app.proposed_price_bgn || 0,
    timeline: app.estimated_duration_hours
      ? `${app.estimated_duration_hours} hours`
      : 'Not specified',
    startDate: app.responded_at ? new Date(app.responded_at) : undefined,
    acceptedAt: app.accepted_at
      ? new Date(app.accepted_at)
      : app.created_at
      ? new Date(app.created_at)
      : new Date(),
    completedAt: undefined, // Will be populated from task completion data
    task: {
      deadline: undefined, // Add if task has deadline field
      category: app.task.category || 'general',
      location: {
        city: app.task.city || '',
        neighborhood: app.task.neighborhood || '',
      },
      status: app.task.status === 'completed' ? 'completed' : 'in_progress',
    },
  };
}

/**
 * Fetch work tasks (accepted applications) from API
 */
async function fetchWorkTasks(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<WorkTask[]> {
  const response = await authenticatedFetch('/api/applications?status=accepted');

  if (!response.ok) {
    throw new Error('Failed to fetch work tasks');
  }

  const data: WorkTasksApiResponse = await response.json();

  // Transform API response to WorkTask format
  return (data.applications || []).map(transformWorkTask);
}

/**
 * Mark task as complete
 */
async function markTaskComplete(
  taskId: string,
  data: { completionNotes?: string; completionPhotos?: string[] }
): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}/mark-complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark task complete');
  }
}

/**
 * Withdraw from task
 */
async function withdrawFromTask(
  taskId: string,
  reason: string,
  description?: string
): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      reason,
      description,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to withdraw from task');
  }
}

/**
 * Custom hook for work tasks with TanStack Query
 */
export function useWorkTasks() {
  const { profile, authenticatedFetch } = useAuth();
  const queryClient = useQueryClient();

  // Fetch work tasks query
  const workTasksQuery = useQuery({
    queryKey: WORK_TASKS_QUERY_KEY,
    queryFn: () => fetchWorkTasks(authenticatedFetch),
    enabled: !!profile, // Only fetch if user profile exists
    staleTime: 2 * 60 * 1000, // 2 minutes - frequently changing
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Mark task complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: { completionNotes?: string; completionPhotos?: string[] };
    }) => markTaskComplete(taskId, data),
    onSuccess: () => {
      // Invalidate and refetch work tasks
      queryClient.invalidateQueries({ queryKey: WORK_TASKS_QUERY_KEY });
    },
  });

  // Withdraw from task mutation
  const withdrawMutation = useMutation({
    mutationFn: ({
      taskId,
      reason,
      description,
    }: {
      taskId: string;
      reason: string;
      description?: string;
    }) => withdrawFromTask(taskId, reason, description),
    onSuccess: () => {
      // Invalidate and refetch work tasks
      queryClient.invalidateQueries({ queryKey: WORK_TASKS_QUERY_KEY });
    },
  });

  return {
    tasks: workTasksQuery.data || [],
    isLoading: workTasksQuery.isLoading,
    error: workTasksQuery.error ? workTasksQuery.error.message : null,
    refetch: workTasksQuery.refetch,
    markComplete: markCompleteMutation.mutateAsync,
    withdraw: withdrawMutation.mutateAsync,
    isMarkingComplete: markCompleteMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
}
