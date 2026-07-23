import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';

export const StudentProgress: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Student Progress | Enterprise LMS"
        description="Track your course completion and learning milestone progress"
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Student Progress
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track your course completion status, module achievements, and skill statistics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentCard title="Overall Completion Rate" desc="Course progress metrics">
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>Modules Completed</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Skill Badges & Achievements" desc="Earned learning milestones">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your earned achievements and milestone badges will be showcased here.
            </p>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default StudentProgress;
