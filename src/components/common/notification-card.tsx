'use client';

import { LocaleLink } from '@/components/common/locale-link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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
 Mail,
 Send,
 UserPlus,
 Check,
} from 'lucide-react';
import { PhoneContactActions } from '@/components/ui/phone-contact-actions';
import type { Notification } from '@/types/notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { markNotificationAsRead } from '@/lib/utils/notification-read-state';

interface NotificationCardProps {
 notification: Notification;
 onMarkAsRead?: (notificationId: string) => void;
}

const notificationIcons = {
 application_received: FileText,
 application_accepted: CheckCircle,
 application_rejected: XCircle,
 professional_withdrew: LogOut,
 removed_by_customer: Ban,
 task_completed: CheckCheck,
 task_cancelled: Ban,
 task_invitation: UserPlus,
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
 task_invitation: 'text-indigo-600 bg-indigo-100',
 message_received: 'text-purple-600 bg-purple-100',
 review_received: 'text-yellow-600 bg-yellow-100',
 payment_received: 'text-green-600 bg-green-100',
 welcome_message: 'text-purple-600 bg-purple-100',
};

// Helper to detect if a string looks like a phone number
const isPhoneNumber = (text: string): boolean => {
 // Clean the text and check if it looks like a phone number
 const cleaned = text.replace(/[\s\-\(\)\.]/g, '');
 // Match patterns: starts with + or 0, 8-15 digits total
 return /^[\+]?[0-9]{8,15}$/.test(cleaned);
};

// Helper to detect if a string is a Telegram username
const isTelegramUsername = (text: string): boolean => {
 // Telegram usernames start with @ and are 5-32 characters (letters, numbers, underscores)
 return /^@[a-zA-Z0-9_]{4,31}$/.test(text.trim());
};

// Get Telegram username without @ for URL
const getTelegramUsername = (text: string): string => {
 return text.trim().replace(/^@/, '');
};

export default function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
 const t = useTranslations();
 const params = useParams();
 const currentLocale = (params?.lang as string) || 'bg';
 const { setOpen } = useNotificationStore();

 // Fallback to FileText icon if type not found
 const Icon = notificationIcons[notification.type] || FileText;
 const colorClass = notificationColors[notification.type] || 'text-gray-600 bg-gray-100';

 // Get locale for date-fns
 const getLocale = () => {
  switch (currentLocale) {
   case 'bg':
    return bgLocale;
   case 'ru':
    return ruLocale;
   default:
    return enUS;
  }
 };

 // Safely format date, fallback to "just now" if invalid
 let timeAgo = t('notifications.justNow');
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

 const handleMarkAsRead = () => {
  markNotificationAsRead(notification.id);
  if (onMarkAsRead) {
   onMarkAsRead(notification.id);
  }
 };

 return (
  <div className="relative grid grid-cols-[40px_1fr] gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50 w-full">

   {/* Icon */}
   <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorClass)}>
    <Icon className="h-5 w-5" />
   </div>

   {/* Content - constrained by grid */}
   <div className="min-w-0 space-y-1">
    <div className="flex items-start justify-between gap-2 min-w-0">
     <h4 className="font-semibold text-sm text-gray-900 break-words min-w-0 flex-1">{notification.title}</h4>
     <span className="text-xs text-gray-500 whitespace-nowrap shrink-0 ml-2">{timeAgo}</span>
    </div>

    <p className="text-sm text-gray-600 leading-relaxed break-words overflow-wrap-anywhere">{notification.message}</p>

    {/* Customer Message for Application Accepted */}
    {notification.type === 'application_accepted' && notification.metadata?.customerMessage && (
     <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg w-full">
      <h5 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
       <MessageCircle className="w-3.5 h-3.5" />
       {t('notifications.customerMessage')}
      </h5>
      <p className="text-sm text-blue-800 italic break-words overflow-wrap-anywhere">
       "{notification.metadata.customerMessage}"
      </p>
     </div>
    )}

    {/* Contact Information for Application Accepted */}
    {notification.type === 'application_accepted' && notification.metadata?.contactInfo && (
     <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg w-full">
      <h5 className="text-xs font-semibold text-green-900 mb-2">{t('notifications.customerContact')}</h5>
      <div className="flex items-start gap-2 text-sm text-green-800 w-full min-w-0">
       {notification.metadata.contactInfo.method === 'phone' && notification.metadata.contactInfo.phone && (
        <PhoneContactActions
         phoneNumber={notification.metadata.contactInfo.phone}
         iconSize={16}
        />
       )}
       {notification.metadata.contactInfo.method === 'email' && notification.metadata.contactInfo.email && (
        <>
         <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
         <a href={`mailto:${notification.metadata.contactInfo.email}`} className="hover:underline break-all overflow-wrap-anywhere min-w-0">
          {notification.metadata.contactInfo.email}
         </a>
        </>
       )}
       {notification.metadata.contactInfo.method === 'custom' && notification.metadata.contactInfo.customContact && (
        <>
         {isPhoneNumber(notification.metadata.contactInfo.customContact) ? (
          <PhoneContactActions
           phoneNumber={notification.metadata.contactInfo.customContact}
           iconSize={16}
          />
         ) : isTelegramUsername(notification.metadata.contactInfo.customContact) ? (
          <a
           href={`https://t.me/${getTelegramUsername(notification.metadata.contactInfo.customContact)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="flex items-center gap-2 hover:underline"
          >
           <img
            src="/icons/telegram-logo.svg"
            alt="Telegram"
            className="w-4 h-4 flex-shrink-0"
           />
           <span className="break-words overflow-wrap-anywhere min-w-0">{notification.metadata.contactInfo.customContact}</span>
          </a>
         ) : (
          <>
           <Send className="w-4 h-4 mt-0.5 flex-shrink-0" />
           <span className="break-words overflow-wrap-anywhere min-w-0">{notification.metadata.contactInfo.customContact}</span>
          </>
         )}
        </>
       )}
      </div>
     </div>
    )}

    {/* Action Buttons */}
    <div className="pt-3 flex flex-col gap-2 w-full">
     {notification.actionUrl && (
      <Button asChild variant="outline" className="h-11 text-sm w-full justify-center">
       <LocaleLink href={notification.actionUrl} onClick={handleActionClick}>
        {notification.type === 'welcome_message'
         ? t('notifications.getStarted')
         : notification.type === 'application_accepted'
         ? t('notifications.viewMyWork')
         : notification.type.includes('application')
         ? t('notifications.viewApplication')
         : t('notifications.viewTask')}
       </LocaleLink>
      </Button>
     )}

     {/* Mark as Read Button */}
     <Button
      variant="ghost"
      onClick={handleMarkAsRead}
      className="h-11 text-sm text-gray-600 hover:text-gray-900 w-full justify-center"
     >
      <Check className="h-4 w-4 mr-1.5 flex-shrink-0" />
      {t('notifications.markAsRead')}
     </Button>
    </div>
   </div>
  </div>
 );
}
