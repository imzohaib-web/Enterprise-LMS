import React from 'react';
import { useUnreadCount } from '../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';

interface NotificationBellProps {
  onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <NotificationBadge count={unreadCount} />
    </button>
  );
};

export default NotificationBell;
