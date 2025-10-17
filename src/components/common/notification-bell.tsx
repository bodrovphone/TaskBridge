'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification-store';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
  const { toggleOpen, getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleOpen}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />

      {/* Unread Badge */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Pulse animation for new notifications */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        </span>
      )}
    </Button>
  );
}
