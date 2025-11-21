'use client';

import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { useNotificationsQuery } from '@/hooks/use-notifications-query';
import { useAuth } from '@/features/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { filterUnreadNotifications } from '@/lib/utils/notification-read-state';

export default function NotificationBell() {
 const { authenticatedFetch, user } = useAuth();
 const { toggleOpen, isOpen } = useNotificationStore();

 // Only fetch notifications if user is authenticated
 const { notifications } = useNotificationsQuery(authenticatedFetch, !!user);

 // Filter out read notifications from localStorage
 // Re-compute when the panel opens/closes to catch newly marked-as-read items
 const unreadNotifications = useMemo(() => {
  return filterUnreadNotifications(notifications);
 }, [notifications, isOpen]);

 // Total unread notification count
 const notificationCount = unreadNotifications.length;

 return (
  <Button
   variant="ghost"
   size="icon"
   className="relative"
   onClick={toggleOpen}
   aria-label="Notifications"
  >
   <Bell className="h-5 w-5" />

   {/* Notification Badge */}
   <AnimatePresence>
    {notificationCount > 0 && (
     <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
     >
      {notificationCount}
     </motion.span>
    )}
   </AnimatePresence>
  </Button>
 );
}
