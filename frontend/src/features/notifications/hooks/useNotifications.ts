import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notificationApi';
import { NotificationFilters, NotificationItem } from '../types';

export const useNotifications = (filters: NotificationFilters = {}) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => getNotifications(filters),
    staleTime: 1 * 60 * 1000,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification removed');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

let socketInstance: Socket | null = null;

export const useNotificationSocket = (userId: string = 'user-1') => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socketInstance) {
      const backendUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
        : 'http://localhost:5000';

      socketInstance = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });
    }

    const socket = socketInstance;

    socket.emit('join-room', userId);

    const handleNotification = (notif: NotificationItem) => {
      const iconEmoji = notif.type === 'success' ? '🎉' : notif.type === 'warning' ? '⚠️' : '🔔';
      toast(`${iconEmoji} ${notif.title}\n${notif.message}`, { duration: 5000 });

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleUnreadCount = (data: { unreadCount: number }) => {
      queryClient.setQueryData(['notifications', 'unread-count'], data.unreadCount);
    };

    const handleDashboardRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification', handleNotification);
    socket.on('unread-count', handleUnreadCount);
    socket.on('dashboard-refresh', handleDashboardRefresh);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('unread-count', handleUnreadCount);
      socket.off('dashboard-refresh', handleDashboardRefresh);
    };
  }, [userId, queryClient]);
};
