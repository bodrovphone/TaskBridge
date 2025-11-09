import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NotificationFilter } from '@/types/notifications';

/**
 * Notification Store - UI State Only
 *
 * This store only manages UI state (panel open/close, active filter).
 * Notification data is managed by TanStack Query in useNotificationsQuery hook.
 */
interface NotificationStore {
  // UI State
  isOpen: boolean;
  activeFilter: NotificationFilter;

  // Actions
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  setActiveFilter: (filter: NotificationFilter) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      // Initial state
      isOpen: false,
      activeFilter: 'all',

      // Toggle notification panel
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      // Set panel open/close state
      setOpen: (isOpen) => set({ isOpen }),

      // Set active filter tab
      setActiveFilter: (filter) => set({ activeFilter: filter }),
    }),
    {
      name: 'notification-storage',
      version: 3, // Incremented to clear old data structure
      partialize: (state) => ({
        // Only persist UI preferences
        activeFilter: state.activeFilter,
        // Don't persist isOpen - panel should start closed on page load
      }),
    }
  )
);
