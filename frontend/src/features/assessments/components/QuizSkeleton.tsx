import React from 'react';

interface QuizSkeletonProps {
  count?: number;
}

export const QuizSkeleton: React.FC<QuizSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-pulse flex flex-col justify-between h-64"
        >
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4 mb-3" />
            <div className="h-4 bg-gray-150 dark:bg-gray-850 rounded-md w-full mb-2" />
            <div className="h-4 bg-gray-150 dark:bg-gray-850 rounded-md w-2/3 mb-6" />

            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-850 rounded-xl mb-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md" />
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md" />
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md" />
            </div>
          </div>

          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
};
