import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationFilter } from '@/types/notifications';

interface NotificationStore {
  notifications: Notification[];
  isOpen: boolean;
  activeFilter: NotificationFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  setActiveFilter: (filter: NotificationFilter) => void;

  // Computed
  getUnreadCount: () => number;
  getFilteredNotifications: () => Notification[];
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      isOpen: false,
      activeFilter: 'all',
      isLoading: false,
      error: null,

      // Fetch notifications from API
      fetchNotifications: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/notifications?limit=50');

          if (!response.ok) {
            throw new Error('Failed to fetch notifications');
          }

          const data = await response.json();

          // Map API response to Notification type
          const notifications: Notification[] = data.notifications.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            isRead: n.state === 'dismissed',
            createdAt: new Date(n.created_at),
            actionUrl: n.action_url,
            relatedTaskId: n.metadata?.taskId,
            relatedApplicationId: n.metadata?.applicationId,
            metadata: n.metadata || {},
          }));

          set({ notifications, isLoading: false });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
        }
      },

      setNotifications: (notifications) => set({ notifications }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      // Mark single notification as read via API
      markAsRead: async (notificationId) => {
        // Optimistic update
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          ),
        }));

        try {
          const response = await fetch(`/api/notifications/${notificationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'dismiss' }),
          });

          if (!response.ok) {
            throw new Error('Failed to mark notification as read');
          }
        } catch (error) {
          console.error('Error marking notification as read:', error);
          // Revert optimistic update on error
          get().fetchNotifications();
        }
      },

      // Mark all notifications as read via API
      markAllAsRead: async () => {
        // Optimistic update
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
          })),
        }));

        try {
          const response = await fetch('/api/notifications/dismiss-all', {
            method: 'PATCH',
          });

          if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
          }
        } catch (error) {
          console.error('Error marking all as read:', error);
          // Revert optimistic update on error
          get().fetchNotifications();
        }
      },

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      setOpen: (isOpen) => set({ isOpen }),

      setActiveFilter: (filter) => set({ activeFilter: filter }),

      getUnreadCount: () => {
        const { notifications } = get();
        return notifications.filter((notif) => !notif.isRead).length;
      },

      getFilteredNotifications: () => {
        const { notifications, activeFilter } = get();

        if (activeFilter === 'all') {
          return notifications;
        }

        if (activeFilter === 'applications') {
          return notifications.filter((notif) =>
            ['application_received', 'application_accepted', 'application_rejected'].includes(
              notif.type
            )
          );
        }

        if (activeFilter === 'tasks') {
          return notifications.filter((notif) =>
            ['task_completed', 'task_cancelled', 'task_status_changed', 'deadline_reminder'].includes(notif.type)
          );
        }

        if (activeFilter === 'messages') {
          return notifications.filter((notif) =>
            ['message_received', 'review_received', 'welcome_message'].includes(notif.type)
          );
        }

        return notifications;
      },
    }),
    {
      name: 'notification-storage',
      version: 2, // Incremented to force refresh and remove old mock data
      partialize: (state) => ({
        // Don't persist notifications - always fetch fresh from API
        // Only persist UI state
        activeFilter: state.activeFilter,
      }),
    }
  )
);
