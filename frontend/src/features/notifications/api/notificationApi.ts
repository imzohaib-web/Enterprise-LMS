import axiosInstance from '../../../api/axiosInstance';
import {
  NotificationItem,
  NotificationFilters,
  NotificationsResponse,
} from '../types';

export const getNotifications = async (
  filters: NotificationFilters = {}
): Promise<NotificationsResponse> => {
  const params: Record<string, any> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (typeof filters.isRead === 'boolean') params.isRead = filters.isRead;

  const res = await axiosInstance.get('/notifications', { params });
  const data = res.data?.data;

  return {
    notifications: data?.notifications || [],
    pagination: data?.pagination || {
      total: data?.notifications?.length || 0,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: 1,
    },
  };
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await axiosInstance.get('/notifications/unread-count');
  return typeof res.data?.data?.unreadCount === 'number' ? res.data.data.unreadCount : 0;
};

export const markAsRead = async (id: string): Promise<NotificationItem> => {
  const res = await axiosInstance.patch(`/notifications/${id}/read`);
  return res.data?.data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
  const res = await axiosInstance.patch('/notifications/read-all');
  return res.data?.data || { message: 'All notifications marked as read' };
};

export const deleteNotification = async (id: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete(`/notifications/${id}`);
  return res.data?.data || { message: 'Notification deleted successfully' };
};
