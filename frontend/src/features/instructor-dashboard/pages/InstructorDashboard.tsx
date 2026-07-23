import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';

export const InstructorDashboard: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Instructor Dashboard | Enterprise LMS"
        description="Instructor Dashboard overview page for Enterprise LMS"
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your courses, review student assessment submissions, and track course engagement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ComponentCard title="Active Courses" desc="Courses you are instructing">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active instruction courses will be displayed here.
            </p>
          </ComponentCard>

          <ComponentCard title="Submissions to Grade" desc="Pending evaluations">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No pending student submissions requiring manual grading.
            </p>
          </ComponentCard>

          <ComponentCard title="Student Analytics" desc="Overview of class performance">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Class performance analytics and participation stats.
            </p>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default InstructorDashboard;
