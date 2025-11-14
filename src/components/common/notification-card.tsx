'use client';

import { LocaleLink } from '@/components/common/locale-link';
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
 PartyPopper,
 LogOut,
 Phone,
 Mail,
 Send,
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
 professional_withdrew: LogOut,
 removed_by_customer: Ban,
 task_completed: CheckCheck,
 task_cancelled: Ban,
 message_received: MessageCircle,
 review_received: Star,
 payment_received: Wallet,
 welcome_message: PartyPopper,
};

const notificationColors = {
 application_received: 'text-blue-600 bg-blue-100',
 application_accepted: 'text-green-600 bg-green-100',
 application_rejected: 'text-red-600 bg-red-100',
 professional_withdrew: 'text-orange-600 bg-orange-100',
 removed_by_customer: 'text-red-600 bg-red-100',
 task_completed: 'text-green-600 bg-green-100',
 task_cancelled: 'text-orange-600 bg-orange-100',
 message_received: 'text-purple-600 bg-purple-100',
 review_received: 'text-yellow-600 bg-yellow-100',
 payment_received: 'text-green-600 bg-green-100',
 welcome_message: 'text-purple-600 bg-purple-100',
};

export default function NotificationCard({ notification }: NotificationCardProps) {
 const { t, i18n } = useTranslation();
 const { setOpen } = useNotificationStore();

 // Fallback to FileText icon if type not found
 const Icon = notificationIcons[notification.type] || FileText;
 const colorClass = notificationColors[notification.type] || 'text-gray-600 bg-gray-100';

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

 // Safely format date, fallback to "just now" if invalid
 let timeAgo = t('notifications.justNow', 'Just now');
 try {
  const date = new Date(notification.createdAt);
  if (!isNaN(date.getTime())) {
   timeAgo = formatDistanceToNow(date, {
    addSuffix: true,
    locale: getLocale(),
   });
  }
 } catch (error) {
  console.error('Invalid notification date:', notification.createdAt, error);
 }

 const handleActionClick = () => {
  // Close notification panel when action is clicked
  setOpen(false);
 };

 return (
  <div className="relative flex gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50">

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

    {/* Contact Information for Application Accepted */}
    {notification.type === 'application_accepted' && notification.metadata?.contactInfo && (
     <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <h5 className="text-xs font-semibold text-green-900 mb-2">{t('notifications.customerContact')}</h5>
      <div className="flex items-start gap-2 text-sm text-green-800">
       {notification.metadata.contactInfo.method === 'phone' && notification.metadata.contactInfo.phone && (
        <>
         <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
         <a href={`tel:${notification.metadata.contactInfo.phone}`} className="font-mono hover:underline">
          {notification.metadata.contactInfo.phone}
         </a>
        </>
       )}
       {notification.metadata.contactInfo.method === 'email' && notification.metadata.contactInfo.email && (
        <>
         <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
         <a href={`mailto:${notification.metadata.contactInfo.email}`} className="hover:underline">
          {notification.metadata.contactInfo.email}
         </a>
        </>
       )}
       {notification.metadata.contactInfo.method === 'custom' && notification.metadata.contactInfo.customContact && (
        <>
         <Send className="w-4 h-4 mt-0.5 flex-shrink-0" />
         <span className="break-words">{notification.metadata.contactInfo.customContact}</span>
        </>
       )}
      </div>
     </div>
    )}

    {/* Action Buttons */}
    {notification.actionUrl && (
     <div className="pt-2">
      <LocaleLink href={notification.actionUrl} onClick={handleActionClick}>
       <Button variant="outline" size="sm" className="h-8 text-xs">
        {notification.type === 'welcome_message'
         ? t('notifications.getStarted')
         : notification.type === 'application_accepted'
         ? t('notifications.viewMyWork')
         : notification.type.includes('application')
         ? t('notifications.viewApplication')
         : t('notifications.viewTask')}
       </Button>
      </LocaleLink>
     </div>
    )}
   </div>
  </div>
 );
}
