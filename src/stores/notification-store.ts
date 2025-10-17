import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationFilter } from '@/types/notifications';

interface NotificationStore {
  notifications: Notification[];
  isOpen: boolean;
  activeFilter: NotificationFilter;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  setActiveFilter: (filter: NotificationFilter) => void;

  // Computed
  getUnreadCount: () => number;
  getFilteredNotifications: () => Notification[];
}

// Mock notifications data
// @todo REFACTORING: These should come from API and use i18n translation keys instead of hardcoded text
// @todo FEATURE: Notifications are ephemeral alerts - need separate persistent messaging system
//   - Notifications: Temporary alerts that can be cleared (current implementation)
//   - Messages: Persistent inbox for task discussions, questions, and important communications
//   - Location: Consider adding Messages tab in Profile page or dedicated /messages route
//   - Integration: Link from notifications to persistent message threads
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'application_received',
    title: 'Нова кандидатура',
    message: 'Иван Д. кандидатства за вашата задача "Ремонт на водопровод"',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    actionUrl: '/bg/tasks/task-123/applications',
    relatedTaskId: 'task-123',
    relatedApplicationId: 'app-1',
    metadata: {
      professionalName: 'Иван Д.',
      taskTitle: 'Ремонт на водопровод',
    },
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'application_accepted',
    title: 'Кандидатурата е приета',
    message: 'Вашата кандидатура за "Почистване на къща" беше приета от Мария П.',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    actionUrl: '/bg/tasks/task-456',
    relatedTaskId: 'task-456',
    metadata: {
      customerName: 'Мария П.',
      taskTitle: 'Почистване на къща',
    },
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'review_received',
    title: 'Получена 5-звездна оценка',
    message: 'Мария П. ви остави 5-звездна оценка за "Почистване на къща"',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    actionUrl: '/bg/profile',
    relatedTaskId: 'task-456',
    metadata: {
      customerName: 'Мария П.',
      taskTitle: 'Почистване на къща',
      rating: 5,
    },
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'task_completed',
    title: 'Задачата е завършена',
    message: 'Вашата задача "Поддръжка на градина" беше маркирана като завършена',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: '/bg/tasks/task-789',
    relatedTaskId: 'task-789',
    metadata: {
      taskTitle: 'Поддръжка на градина',
    },
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: 'application_rejected',
    title: 'Кандидатурата не е избрана',
    message: 'Вашата кандидатура за "Услуги по преместване" не беше избрана',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    actionUrl: '/bg/tasks/task-999',
    relatedTaskId: 'task-999',
    metadata: {
      taskTitle: 'Услуги по преместване',
    },
  },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,
      isOpen: false,
      activeFilter: 'all',

      setNotifications: (notifications) => set({ notifications }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
          })),
        })),

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
            ['task_completed', 'task_cancelled'].includes(notif.type)
          );
        }

        if (activeFilter === 'messages') {
          return notifications.filter((notif) =>
            ['message_received', 'review_received'].includes(notif.type)
          );
        }

        return notifications;
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
