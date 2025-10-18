'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, bg as bgLocale, ru as ruLocale } from 'date-fns/locale';
import {
 FileText,
 CheckCircle,
 XCircle,
 CheckCheck,
 Ban,
 MessageCircle,
 Star,
 Wallet,
} from 'lucide-react';
import type { Notification } from '@/types/notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
 notification: Notification;
}

const notificationIcons = {
 application_received: FileText,
 application_accepted: CheckCircle,
 application_rejected: XCircle,
 task_completed: CheckCheck,
 task_cancelled: Ban,
 message_received: MessageCircle,
 review_received: Star,
 payment_received: Wallet,
};

const notificationColors = {
 application_received: 'text-blue-600 bg-blue-100',
 application_accepted: 'text-green-600 bg-green-100',
 application_rejected: 'text-red-600 bg-red-100',
 task_completed: 'text-green-600 bg-green-100',
 task_cancelled: 'text-orange-600 bg-orange-100',
 message_received: 'text-purple-600 bg-purple-100',
 review_received: 'text-yellow-600 bg-yellow-100',
 payment_received: 'text-green-600 bg-green-100',
};

export default function NotificationCard({ notification }: NotificationCardProps) {
 const { t, i18n } = useTranslation();
 const { markAsRead, setOpen } = useNotificationStore();

 const Icon = notificationIcons[notification.type];
 const colorClass = notificationColors[notification.type];

 // Get locale for date-fns
 const getLocale = () => {
  switch (i18n.language) {
   case 'bg':
    return bgLocale;
   case 'ru':
    return ruLocale;
   default:
    return enUS;
  }
 };

 const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
  addSuffix: true,
  locale: getLocale(),
 });

 const handleClick = () => {
  if (!notification.isRead) {
   markAsRead(notification.id);
  }
 };

 const handleActionClick = () => {
  markAsRead(notification.id);
  setOpen(false);
 };

 return (
  <div
   className={cn(
    'relative flex gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50',
    !notification.isRead && 'bg-blue-50/50'
   )}
   onClick={handleClick}
  >
   {/* Unread Indicator */}
   {!notification.isRead && (
    <div className="absolute left-2 top-6 h-2 w-2 rounded-full bg-blue-500" />
   )}

   {/* Icon */}
   <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorClass)}>
    <Icon className="h-5 w-5" />
   </div>

   {/* Content */}
   <div className="flex-1 space-y-1">
    <div className="flex items-start justify-between gap-2">
     <h4 className="font-semibold text-sm text-gray-900">{notification.title}</h4>
     <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
    </div>

    <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>

    {/* Action Buttons */}
    {notification.actionUrl && (
     <div className="pt-2">
      <Link href={notification.actionUrl} onClick={handleActionClick}>
       <Button variant="outline" size="sm" className="h-8 text-xs">
        {notification.type.includes('application')
         ? t('notifications.viewApplication')
         : t('notifications.viewTask')}
       </Button>
      </Link>
     </div>
    )}
   </div>
  </div>
 );
}
