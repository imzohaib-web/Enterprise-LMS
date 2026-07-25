import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';

export const StudentDashboard: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Student Dashboard | Enterprise LMS"
        description="Student Dashboard overview page for Enterprise LMS"
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome to your LMS learning hub. Track your active courses, assignments, and upcoming deadlines.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ComponentCard title="Enrolled Courses" desc="Quick access to active modules">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your active enrolled courses will appear here.
            </p>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
