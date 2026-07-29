import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';

export const InstructorSettings: React.FC = () => {
  return (
    <>
      <PageMeta title="Instructor Settings | Enterprise LMS" description="Manage instructor account and course preferences" />

      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure course notification preferences, automated grading rules, and profile visibility.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentCard title="Notification Preferences" desc="Email and system alerts">
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
                <span>Notify me when a student submits a quiz for grading</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
                <span>Weekly summary report of student course enrollments</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
                <span>Discussion forum response alerts</span>
              </label>
            </div>
          </ComponentCard>

          <ComponentCard title="Course Grading Policy" desc="Automated scoring options">
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <label className="block space-y-1">
                <span className="font-semibold">Passing Threshold Percentage</span>
                <input
                  type="number"
                  defaultValue={70}
                  className="w-full px-3 py-2 border rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-semibold">Default Max Quiz Attempts</span>
                <input
                  type="number"
                  defaultValue={3}
                  className="w-full px-3 py-2 border rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </label>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default InstructorSettings;
