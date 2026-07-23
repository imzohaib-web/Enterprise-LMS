import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';

export const Notifications: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Notifications | Enterprise LMS"
        description="Notifications center for course updates, announcements, and alerts"
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Notifications & Announcements
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Stay updated with system announcements, assessment results, and course deadlines.
            </p>
          </div>
        </div>

        <ComponentCard title="Recent Notifications" desc="System and course updates">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You currently have no unread notifications.
          </p>
        </ComponentCard>
      </div>
    </>
  );
};

export default Notifications;
