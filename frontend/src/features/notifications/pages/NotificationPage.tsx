import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import NotificationList from '../components/NotificationList';
import { useNotifications, useMarkAllRead, useUnreadCount } from '../hooks/useNotifications';
import { NotificationCategory } from '../types';

export const NotificationPage: React.FC = () => {
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useNotifications({
    page,
    limit: 10,
    category: category === 'all' ? undefined : category,
    isRead: unreadOnly ? false : undefined,
  });

  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllReadMutation = useMarkAllRead();

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;

  // Filter client-side search term
  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories: { label: string; value: NotificationCategory | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Assessments', value: 'assessment' },
    { label: 'Certificates', value: 'certificate' },
    { label: 'Courses', value: 'course' },
    { label: 'Progress', value: 'progress' },
    { label: 'Discussions', value: 'discussion' },
    { label: 'System', value: 'system' },
  ];

  return (
    <>
      <PageMeta
        title="Notification Center | Enterprise LMS"
        description="View and manage all real-time learning notifications and system updates."
      />

      <div className="space-y-6">
        {/* Page Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Notification Center
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Stay up-to-date with course activities, assessment results, and certificate issuances.
            </p>
          </div>

          {unreadCount > 0 && (
            <div>
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                ✓ Mark All ({unreadCount}) as Read
              </button>
            </div>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                  category === cat.value
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Unread Toggle */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => setUnreadOnly((prev) => !prev)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap ${
                unreadOnly
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
              }`}
            >
              {unreadOnly ? '● Unread Only' : 'Show Unread Only'}
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <ComponentCard title="All Notifications" desc="Real-time stream of LMS updates">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
          />

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default NotificationPage;
