import React from 'react';
import { useNotifications, useMarkAllRead, useUnreadCount } from '../hooks/useNotifications';
import NotificationList from './NotificationList';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useNotifications({ limit: 20 });
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllReadMutation = useMarkAllRead();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col justify-between">
          {/* Drawer Header */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {unreadCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Actions Bar */}
            {unreadCount > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Drawer Content */}
            <div className="max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-1">
              <NotificationList
                notifications={data?.notifications || []}
                isLoading={isLoading}
                onSelectNotification={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
