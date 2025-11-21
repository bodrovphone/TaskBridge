import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types/notifications';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

interface NotificationsResponse {
  notifications: Array<{
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    state: string;
    created_at: string;
    action_url?: string;
    metadata?: Record<string, any>;
  }>;
}

/**
 * Fetch notifications from API
 * Fetches 8 most recent notifications for performance
 */
async function fetchNotifications(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<Notification[]> {
  const response = await authenticatedFetch('/api/notifications?limit=8');

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  const data: NotificationsResponse = await response.json();

  // Map API response to Notification type
  return data.notifications.map((n) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type as Notification['type'],
    title: n.title,
    message: n.message,
    createdAt: new Date(n.created_at),
    actionUrl: n.action_url,
    relatedTaskId: n.metadata?.taskId,
    relatedApplicationId: n.metadata?.applicationId,
    metadata: n.metadata || {},
  }));
}

/**
 * Delete all notifications
 */
async function deleteAllNotifications(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<void> {
  const response = await authenticatedFetch('/api/notifications/dismiss-all', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete all notifications');
  }
}

/**
 * Custom hook for notifications with TanStack Query
 * Fetches notifications with 10-minute stale time to reduce API calls
 * @param authenticatedFetch - Function to make authenticated API requests
 * @param enabled - Whether to enable the query (should be true only when user is authenticated)
 */
export function useNotificationsQuery(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
  enabled: boolean = true
) {
  const queryClient = useQueryClient();

  // Fetch notifications query with 10-minute stale time
  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => fetchNotifications(authenticatedFetch),
    enabled, // Only run query when enabled (i.e., user is authenticated)
    staleTime: 10 * 60 * 1000, // 10 minutes - data considered fresh for this duration
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
  });

  // Delete all notifications mutation
  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllNotifications(authenticatedFetch),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY);

      // Optimistically clear all notifications
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, []);

      return { previousNotifications };
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
    onError: (_error, _variables, context) => {
      // Revert on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previousNotifications);
      }
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    deleteAll: deleteAllMutation.mutate,
  };
}
