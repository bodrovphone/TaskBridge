'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import { useNotificationsQuery } from '@/hooks/use-notifications-query';
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
} from '@/components/ui/sheet';
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationCard from './notification-card';
import type { NotificationFilter } from '@/types/notifications';

export default function NotificationCenter() {
 const { t } = useTranslation();
 const [showConfirmDialog, setShowConfirmDialog] = useState(false);

 // UI state from Zustand (persisted in localStorage)
 const { isOpen, setOpen, activeFilter, setActiveFilter } = useNotificationStore();

 // Data from TanStack Query (10-minute stale time, optimized fetching)
 const { notifications, isLoading, error, deleteAll } = useNotificationsQuery();

 // Handle query errors gracefully
 const hasError = !!error;
 const displayNotifications = hasError ? [] : notifications;

 // Filter notifications based on active filter
 const filteredNotifications = useMemo(() => {
  if (activeFilter === 'all') {
   return displayNotifications;
  }

  if (activeFilter === 'applications') {
   return displayNotifications.filter((notif) =>
    ['application_received', 'application_accepted', 'application_rejected'].includes(notif.type)
   );
  }

  if (activeFilter === 'tasks') {
   return displayNotifications.filter((notif) =>
    ['task_completed', 'task_cancelled', 'task_status_changed', 'deadline_reminder'].includes(notif.type)
   );
  }

  if (activeFilter === 'messages') {
   return displayNotifications.filter((notif) =>
    ['message_received', 'review_received', 'welcome_message'].includes(notif.type)
   );
  }

  return displayNotifications;
 }, [displayNotifications, activeFilter]);

 // Calculate notification count (all notifications until deleted)
 const notificationCount = displayNotifications.length;
 const hasNotifications = notificationCount > 0;

 const handleFilterChange = (value: string) => {
  setActiveFilter(value as NotificationFilter);
 };

 const handleCleanupClick = () => {
  setShowConfirmDialog(true);
 };

 const handleConfirmCleanup = () => {
  deleteAll();
  setShowConfirmDialog(false);
 };

 return (
  <>
   <Sheet open={isOpen} onOpenChange={setOpen}>
    <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white h-full">
     <SheetHeader className="border-b pl-6 pr-12 py-4 flex-shrink-0 bg-white">
      <SheetTitle className="text-xl font-bold">
       {t('notifications.title')}
      </SheetTitle>
     </SheetHeader>

    {/* Filter Tabs */}
    <Tabs
     value={activeFilter}
     onValueChange={handleFilterChange}
     className="flex flex-col flex-1 min-h-0 bg-white"
    >
     <div className="border-b px-6 py-3 flex-shrink-0 bg-white">
      <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
       <TabsTrigger
        value="all"
        className="text-xs font-semibold hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
       >
        {t('notifications.tabAll')}
       </TabsTrigger>
       <TabsTrigger
        value="applications"
        className="text-xs font-semibold hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
       >
        {t('notifications.tabApplications')}
       </TabsTrigger>
       <TabsTrigger
        value="tasks"
        className="text-xs font-semibold hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
       >
        {t('notifications.tabTasks')}
       </TabsTrigger>
       <TabsTrigger
        value="messages"
        className="text-xs font-semibold hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
       >
        {t('notifications.tabMessages')}
       </TabsTrigger>
      </TabsList>
     </div>

     {/* Notification List */}
     <TabsContent value={activeFilter} className="flex-1 mt-0 min-h-0 bg-white">
      <ScrollArea className="h-full bg-white">
       <div className="px-2 py-2 pb-4 space-y-1 bg-white">
        {isLoading ? (
         <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
         </div>
        ) : hasError ? (
         <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
           <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
           {t('notifications.error.title', 'Failed to Load Notifications')}
          </h3>
          <p className="text-sm text-gray-600 max-w-xs">
           {t('notifications.error.message', 'Please try again later or contact support if the problem persists.')}
          </p>
         </div>
        ) : filteredNotifications.length > 0 ? (
         filteredNotifications.map((notification) => (
          <NotificationCard
           key={notification.id}
           notification={notification}
          />
         ))
        ) : (
         <EmptyState filter={activeFilter} />
        )}
       </div>
      </ScrollArea>
     </TabsContent>
    </Tabs>

    {/* Bottom Actions - Always visible */}
    <div className="border-t px-6 py-4 bg-gradient-to-b from-white to-gray-50 flex-shrink-0 safe-area-bottom space-y-3">
     {/* Clean up button */}
     {hasNotifications && (
      <Button
       variant="outline"
       size="lg"
       onClick={handleCleanupClick}
       className="w-full font-semibold text-base text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
       <Trash2 className="h-4 w-4 mr-2" />
       {t('notifications.cleanup')}
      </Button>
     )}

     {/* Close button */}
     <Button
      className="w-full font-semibold text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
      size="lg"
      onClick={() => setOpen(false)}
     >
      {t('common.close')}
     </Button>
    </div>
   </SheetContent>
  </Sheet>

  <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
   <AlertDialogContent className="bg-white">
    <AlertDialogHeader>
     <AlertDialogTitle>{t('notifications.cleanupConfirm.title')}</AlertDialogTitle>
     <AlertDialogDescription>
      {t('notifications.cleanupConfirm.message')}
     </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
     <AlertDialogCancel>{t('notifications.cleanupConfirm.cancel')}</AlertDialogCancel>
     <AlertDialogAction
      onClick={handleConfirmCleanup}
      className="bg-red-600 hover:bg-red-700"
     >
      {t('notifications.cleanupConfirm.confirm')}
     </AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 </>
 );
}

// Empty State Component
interface EmptyStateProps {
 filter: NotificationFilter;
}

function EmptyState({ filter }: EmptyStateProps) {
 const { t } = useTranslation();

 return (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
   <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
    <Bell className="h-8 w-8 text-gray-400" />
   </div>

   <h3 className="mb-2 text-lg font-semibold text-gray-900">
    {t('notifications.empty.title')}
   </h3>

   <p className="text-sm text-gray-600 max-w-xs">
    {filter === 'all'
     ? t('notifications.empty.message')
     : t('notifications.empty.filterMessage')}
   </p>
  </div>
 );
}
