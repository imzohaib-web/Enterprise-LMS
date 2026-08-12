import React from 'react';

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded-md" />
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
    </div>
    <div className="h-7 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
    <div className="h-2.5 w-36 bg-gray-100 dark:bg-gray-800/60 rounded-md" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm animate-pulse space-y-4">
    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded-md" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-36 bg-gray-200 dark:bg-gray-800 rounded-md" />
              <div className="h-2.5 w-24 bg-gray-100 dark:bg-gray-800/60 rounded-md" />
            </div>
          </div>
          <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
          <div className="h-3.5 w-16 bg-gray-200 dark:bg-gray-800 rounded-md" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded-md" />
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
    </div>
    <div className="h-56 w-full bg-gray-100 dark:bg-gray-800/50 rounded-xl flex items-end justify-between p-4 gap-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          style={{ height: `${30 + (idx * 12) % 60}%` }}
          className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-t-md"
        />
      ))}
    </div>
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <TableSkeleton rows={6} />
  </div>
);

export default PageSkeleton;
