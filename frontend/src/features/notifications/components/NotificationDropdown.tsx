import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import NotificationList from './NotificationList';
import { useNotifications, useMarkAllRead, useUnreadCount } from '../hooks/useNotifications';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications({ limit: 5 });
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllReadMutation = useMarkAllRead();

  const notifications = data?.notifications || [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <NotificationBell onClick={handleToggle} />

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications Feed List (Max 5) */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar pr-1">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onSelectNotification={() => setIsOpen(false)}
            />
          </div>

          {/* Dropdown Footer */}
          <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3 text-center">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-xs font-bold text-gray-700 dark:text-gray-200 rounded-xl transition-colors"
            >
              View All Notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
