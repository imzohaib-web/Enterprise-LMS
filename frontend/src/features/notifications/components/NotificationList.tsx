import React from 'react';
import { NotificationItem } from '../types';
import NotificationCard from './NotificationCard';
import EmptyState from './EmptyState';

interface NotificationListProps {
  notifications: NotificationItem[];
  isLoading?: boolean;
  onSelectNotification?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  onSelectNotification,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id || notification._id}
          notification={notification}
          onSelect={onSelectNotification}
        />
      ))}
    </div>
  );
};

export default NotificationList;
