import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';

export const Discussions: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Discussions | Enterprise LMS"
        description="Course discussion forums and community interactions"
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Discussion Forums
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Engage with instructors and peers, ask questions, and collaborate on course topics.
            </p>
          </div>
        </div>

        <ComponentCard title="Active Course Threads" desc="Recent discussion topics">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Discussion threads and course community forums will load here.
          </p>
        </ComponentCard>
      </div>
    </>
  );
};

export default Discussions;
