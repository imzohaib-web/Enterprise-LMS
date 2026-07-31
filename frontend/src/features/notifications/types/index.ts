export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'assessment' | 'certificate' | 'course' | 'progress' | 'discussion' | 'system';

export interface NotificationItem {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  category?: NotificationCategory | 'all';
  isRead?: boolean;
}
