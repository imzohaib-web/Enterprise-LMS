import React from 'react';

export const CoursePlayerSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="space-y-2">
            <div className="w-48 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-32 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="w-36 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>

      {/* Main Content & Sidebar Skeleton */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-full h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
          {/* Bottom Bar Skeleton */}
          <div className="h-14 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between px-6">
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="w-36 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="space-y-3 pt-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerSkeleton;
