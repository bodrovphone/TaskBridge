export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'task_completed'
  | 'task_cancelled'
  | 'message_received'
  | 'review_received'
  | 'payment_received';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  relatedTaskId?: string;
  relatedApplicationId?: string;
  metadata?: {
    professionalName?: string;
    customerName?: string;
    taskTitle?: string;
    price?: number;
    rating?: number;
  };
}

export type NotificationFilter = 'all' | 'applications' | 'tasks' | 'messages';
