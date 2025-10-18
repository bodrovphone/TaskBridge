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
    message: 'Иван Д. кандидатства за вашата задача "Разходка с кучето"',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    actionUrl: '/bg/tasks/1?application=app-1',
    relatedTaskId: '1',
    relatedApplicationId: 'app-1',
    metadata: {
      professionalName: 'Иван Д.',
      taskTitle: 'Разходка с кучето',
    },
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'application_accepted',
    title: 'Кандидатурата е приета',
    message: 'Вашата кандидатура за "Почистване на апартамент" беше приета от Елена Д.',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    actionUrl: '/bg/tasks/3',
    relatedTaskId: '3',
    relatedApplicationId: 'app-4',
    metadata: {
      customerName: 'Елена Д.',
      taskTitle: 'Почистване на апартамент',
    },
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'review_received',
    title: 'Получена 5-звездна оценка',
    message: 'Елена Д. ви остави 5-звездна оценка за "Почистване на апартамент"',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    actionUrl: '/bg/profile',
    relatedTaskId: '3',
    metadata: {
      customerName: 'Елена Д.',
      taskTitle: 'Почистване на апартамент',
      rating: 5,
    },
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'task_completed',
    title: 'Задачата е завършена',
    message: 'Вашата задача "Пренос на мебели" беше маркирана като завършена',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: '/bg/tasks/2',
    relatedTaskId: '2',
    metadata: {
      taskTitle: 'Пренос на мебели',
    },
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: 'application_rejected',
    title: 'Кандидатурата не е избрана',
    message: 'Вашата кандидатура за "Уроци по китара" не беше избрана',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    actionUrl: '/bg/tasks/4',
    relatedTaskId: '4',
    metadata: {
      taskTitle: 'Уроци по китара',
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
      version: 1, // Increment this to force localStorage refresh
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
