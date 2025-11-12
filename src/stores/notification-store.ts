import { create } from 'zustand';

/**
 * Notification Store - UI State Only
 *
 * This store only manages UI state (panel open/close).
 * Notification data is managed by TanStack Query in useNotificationsQuery hook.
 */
interface NotificationStore {
  // UI State
  isOpen: boolean;

  // Actions
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  // Initial state
  isOpen: false,

  // Toggle notification panel
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  // Set panel open/close state
  setOpen: (isOpen) => set({ isOpen }),
}));
