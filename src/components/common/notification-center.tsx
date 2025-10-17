'use client';

import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationCard from './notification-card';
import type { NotificationFilter } from '@/types/notifications';

export default function NotificationCenter() {
  const { t } = useTranslation();
  const {
    isOpen,
    setOpen,
    activeFilter,
    setActiveFilter,
    markAllAsRead,
    getFilteredNotifications,
    getUnreadCount,
  } = useNotificationStore();

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();
  const hasUnread = unreadCount > 0;

  const handleFilterChange = (value: string) => {
    setActiveFilter(value as NotificationFilter);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-white">
        <SheetHeader className="border-b px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">
              {t('notifications.title')}
            </SheetTitle>
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Filter Tabs */}
        <Tabs
          value={activeFilter}
          onValueChange={handleFilterChange}
          className="flex flex-col h-[calc(100vh-5rem)] bg-white"
        >
          <div className="border-b px-6 py-3 bg-white">
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
          <TabsContent value={activeFilter} className="flex-1 mt-0 bg-white">
            <ScrollArea className="h-full bg-white">
              <div className="px-2 py-2 space-y-1 bg-white">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                ) : (
                  <EmptyState hasUnread={hasUnread} filter={activeFilter} />
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Empty State Component
interface EmptyStateProps {
  hasUnread: boolean;
  filter: NotificationFilter;
}

function EmptyState({ hasUnread, filter }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        {hasUnread ? (
          <CheckCheck className="h-8 w-8 text-green-600" />
        ) : (
          <Bell className="h-8 w-8 text-gray-400" />
        )}
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {hasUnread
          ? t('notifications.emptyUnread.title')
          : t('notifications.empty.title')}
      </h3>

      <p className="text-sm text-gray-600 max-w-xs">
        {hasUnread
          ? t('notifications.emptyUnread.message')
          : filter === 'all'
          ? t('notifications.empty.message')
          : t('notifications.empty.filterMessage')}
      </p>
    </div>
  );
}
