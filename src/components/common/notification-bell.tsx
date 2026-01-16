'use client';

import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { useNotificationsQuery } from '@/hooks/use-notifications-query';
import { useAuth } from '@/features/auth';
import { filterUnreadNotifications } from '@/lib/utils/notification-read-state';

interface NotificationBellProps {
 onAuthRequired?: () => void;
 onOpen?: () => void;
}

export default function NotificationBell({ onAuthRequired, onOpen }: NotificationBellProps) {
 const { authenticatedFetch, user, loading } = useAuth();
 const { toggleOpen, isOpen } = useNotificationStore();
 const isAuthenticated = !!user && !loading;

 // Only fetch notifications if user is authenticated AND auth is not loading
 const { notifications } = useNotificationsQuery(authenticatedFetch, isAuthenticated);

 // Filter out read notifications from localStorage
 // Re-compute when the panel opens/closes to catch newly marked-as-read items
 const unreadNotifications = useMemo(() => {
  return filterUnreadNotifications(notifications);
 }, [notifications, isOpen]);

 // Total unread notification count
 const notificationCount = unreadNotifications.length;

 const handleClick = () => {
  if (isAuthenticated) {
   // Close other panels (like hamburger menu) before opening notifications
   if (!isOpen && onOpen) {
    onOpen();
   }
   toggleOpen();
  } else if (onAuthRequired) {
   onAuthRequired();
  }
 };

 return (
  <Button
   variant="ghost"
   size="icon"
   className="relative"
   onClick={handleClick}
   aria-label="Notifications"
  >
   <Bell className="h-5 w-5" />

   {/* Notification Badge - CSS animation for better INP performance */}
   <span
    className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white transition-transform duration-200 ${
     isAuthenticated && notificationCount > 0 ? 'scale-100' : 'scale-0'
    }`}
    aria-hidden={!(isAuthenticated && notificationCount > 0)}
   >
    {notificationCount || 0}
   </span>
  </Button>
 );
}
