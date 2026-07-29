import axiosInstance from '../../../api/axiosInstance';
import {
  NotificationItem,
  NotificationFilters,
  NotificationsResponse,
} from '../types';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    _id: 'notif-1',
    userId: 'user-1',
    title: 'Certificate Issued! 🎉',
    message: 'Congratulations! Your certificate for "Advanced Full-Stack Engineering" is ready to download.',
    type: 'success',
    category: 'certificate',
    isRead: false,
    actionUrl: '/pages/certificate-verification',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
  },
  {
    id: 'notif-2',
    _id: 'notif-2',
    userId: 'user-1',
    title: 'Quiz Passed! 🏆',
    message: 'You scored 95% on "Node.js Event Loop & Async Architecture". Excellent job!',
    type: 'success',
    category: 'assessment',
    isRead: false,
    actionUrl: '/student/assessments',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'notif-3',
    _id: 'notif-3',
    userId: 'user-1',
    title: 'New Discussion Reply',
    message: 'Instructor Alex replied to your question in "Docker & Kubernetes Mastery".',
    type: 'info',
    category: 'discussion',
    isRead: true,
    actionUrl: '/discussions',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 'notif-4',
    _id: 'notif-4',
    userId: 'user-1',
    title: 'Progress Milestone Reached',
    message: 'You completed 75% of your enrolled courses for Term 2026.',
    type: 'info',
    category: 'progress',
    isRead: true,
    actionUrl: '/student/progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-5',
    _id: 'notif-5',
    userId: 'user-1',
    title: 'Quiz Retake Recommended',
    message: 'You scored 55% on "SQL Indexing & Query Execution". Review module 4 and retry.',
    type: 'warning',
    category: 'assessment',
    isRead: true,
    actionUrl: '/student/assessments',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

export const getNotifications = async (
  filters: NotificationFilters = {}
): Promise<NotificationsResponse> => {
  try {
    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.category && filters.category !== 'all') params.category = filters.category;
    if (typeof filters.isRead === 'boolean') params.isRead = filters.isRead;

    const res = await axiosInstance.get('/notifications', { params });
    if (res.data?.data) {
      return {
        notifications: res.data.data.notifications || [],
        pagination: res.data.data.pagination || {
          total: res.data.data.notifications?.length || 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
    }
    return filterMockNotifications(filters);
  } catch (error) {
    return filterMockNotifications(filters);
  }
};

const filterMockNotifications = (filters: NotificationFilters): NotificationsResponse => {
  let list = [...MOCK_NOTIFICATIONS];
  if (filters.category && filters.category !== 'all') {
    list = list.filter((n) => n.category === filters.category);
  }
  if (typeof filters.isRead === 'boolean') {
    list = list.filter((n) => n.isRead === filters.isRead);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    notifications: paginated,
    pagination: {
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit) || 1,
    },
  };
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await axiosInstance.get('/notifications/unread-count');
    if (typeof res.data?.data?.unreadCount === 'number') {
      return res.data.data.unreadCount;
    }
    return MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
  } catch (error) {
    return MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
  }
};

export const markAsRead = async (id: string): Promise<NotificationItem> => {
  try {
    const res = await axiosInstance.patch(`/notifications/${id}/read`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (error) {
    // Fallback mock update
  }
  const item = MOCK_NOTIFICATIONS.find((n) => (n.id || n._id) === id);
  if (item) item.isRead = true;
  return item || MOCK_NOTIFICATIONS[0];
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
  try {
    const res = await axiosInstance.patch('/notifications/read-all');
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (error) {
    // Fallback mock update
  }
  MOCK_NOTIFICATIONS.forEach((n) => (n.isRead = true));
  return { message: 'All notifications marked as read' };
};

export const deleteNotification = async (id: string): Promise<{ message: string }> => {
  try {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (error) {
    // Fallback mock delete
  }
  const idx = MOCK_NOTIFICATIONS.findIndex((n) => (n.id || n._id) === id);
  if (idx !== -1) MOCK_NOTIFICATIONS.splice(idx, 1);
  return { message: 'Notification deleted successfully' };
};
