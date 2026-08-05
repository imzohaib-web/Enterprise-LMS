import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useInstructorNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../instructor-dashboard/hooks/useInstructorDashboard';

export const Notifications: React.FC = () => {
  const { data: notifications, isLoading, isError } = useInstructorNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <>
      <PageMeta
        title="Notification Center | Instructor Portal"
        description="System alerts and course notifications for instructors"
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-brand-500 text-white">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Live notifications for pending student assessments, new enrollments, and discussion activities.
            </p>
          </div>

          {unreadCount > 0 && (
            <div>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Mark All as Read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <ComponentCard title="Recent Instructor Alerts" desc="Synchronized from MongoDB notifications">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading notifications...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load notifications.</div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-4 px-2 flex items-start justify-between gap-4 transition-colors ${
                    !n.isRead ? 'bg-brand-50/30 dark:bg-brand-500/5 rounded-xl p-3' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{n.title}</h3>
                      <Badge color={n.type === 'assessment' ? 'warning' : n.type === 'enrollment' ? 'success' : 'info'}>
                        {n.type}
                      </Badge>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{n.message}</p>
                    <p className="text-[11px] text-gray-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>

                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              You currently have no notifications.
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default Notifications;
