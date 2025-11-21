/**
 * Notification Read State Management with localStorage
 *
 * Stores read notification IDs in localStorage to filter them out
 * from the notification center. This is a temporary solution until
 * we implement proper read state tracking in the database.
 */

const READ_NOTIFICATIONS_KEY = 'trudify_read_notifications';

/**
 * Get all read notification IDs from localStorage
 */
export function getReadNotificationIds(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (!stored) {
      return new Set();
    }

    const ids = JSON.parse(stored) as string[];
    return new Set(ids);
  } catch (error) {
    console.error('Failed to parse read notifications from localStorage:', error);
    return new Set();
  }
}

/**
 * Mark a notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const readIds = getReadNotificationIds();
    readIds.add(notificationId);

    localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(Array.from(readIds))
    );
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Mark multiple notifications as read
 */
export function markNotificationsAsRead(notificationIds: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const readIds = getReadNotificationIds();
    notificationIds.forEach(id => readIds.add(id));

    localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(Array.from(readIds))
    );
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
}

/**
 * Check if a notification is marked as read
 */
export function isNotificationRead(notificationId: string): boolean {
  const readIds = getReadNotificationIds();
  return readIds.has(notificationId);
}

/**
 * Clear all read notification IDs (useful when cleaning up notifications)
 */
export function clearReadNotifications(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(READ_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Failed to clear read notifications:', error);
  }
}

/**
 * Filter out read notifications from a list
 */
export function filterUnreadNotifications<T extends { id: string }>(
  notifications: T[]
): T[] {
  const readIds = getReadNotificationIds();
  return notifications.filter(n => !readIds.has(n.id));
}
