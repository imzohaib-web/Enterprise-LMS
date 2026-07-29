import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../../components/ui/badge/Badge';
import { NotificationItem } from '../types';
import { useMarkAsRead, useDeleteNotification } from '../hooks/useNotifications';

interface NotificationCardProps {
  notification: NotificationItem;
  onSelect?: () => void;
}

const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const mins = Math.floor(diffInSeconds / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'assessment':
      return 'primary';
    case 'certificate':
      return 'success';
    case 'course':
      return 'info';
    case 'progress':
      return 'warning';
    case 'discussion':
      return 'light';
    default:
      return 'light';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <span className="text-emerald-500 font-bold">✓</span>;
    case 'warning':
      return <span className="text-amber-500 font-bold">⚠️</span>;
    case 'error':
      return <span className="text-rose-500 font-bold">✕</span>;
    default:
      return <span className="text-brand-500 font-bold">ℹ</span>;
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onSelect }) => {
  const navigate = useNavigate();
  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteNotification();

  const id = notification.id || notification._id || '';

  const handleClick = () => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(id);
    }
    if (onSelect) {
      onSelect();
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
        !notification.isRead
          ? 'bg-brand-50/40 border-brand-200/60 dark:bg-brand-500/5 dark:border-brand-500/20 shadow-xs'
          : 'bg-white border-gray-150 hover:bg-gray-50/80 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-white/[0.02]'
      }`}
    >
      {/* Type Icon Container */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm dark:bg-gray-800">
        {getTypeIcon(notification.type)}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
            {notification.title}
          </h4>
          <Badge color={getCategoryColor(notification.category)}>
            {notification.category}
          </Badge>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
          <span>{formatRelativeTime(notification.createdAt)}</span>
          {!notification.isRead && (
            <span className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              Unread
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <button
            type="button"
            title="Mark as read"
            onClick={handleMarkRead}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}

        <button
          type="button"
          title="Delete notification"
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
