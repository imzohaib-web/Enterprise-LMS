import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl animate-pulse space-y-4 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-1/6" />
            </div>
          </div>
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3.5 bg-gray-100 dark:bg-gray-800/60 rounded w-full" />
            <div className="h-3.5 bg-gray-100 dark:bg-gray-800/60 rounded w-5/6" />
          </div>
          <div className="flex items-center space-x-4 pt-2">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
