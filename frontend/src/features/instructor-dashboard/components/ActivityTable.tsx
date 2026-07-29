import React, { useState } from 'react';
import { useInstructorActivities } from '../hooks/useInstructorDashboard';
import Badge from '../../../components/ui/badge/Badge';

export const ActivityTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'quizzes' | 'enrollments'>('all');
  const { data: activities, isLoading: isActLoading } = useInstructorActivities();

  const filteredActivities = activities?.filter((act) => {
    if (activeTab === 'quizzes') return act.type === 'quiz_attempt';
    if (activeTab === 'enrollments') return act.type === 'enrollment';
    return true;
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Latest Instructor Activity
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time feed of recent student quiz attempts and course enrollments
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'quizzes'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Recent Quiz Attempts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enrollments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'enrollments'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Recent Enrollments
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Activity Type</th>
              <th className="py-3 px-4">Target Title</th>
              <th className="py-3 px-4">Score / Status</th>
              <th className="py-3 px-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {isActLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Loading latest activities...
                </td>
              </tr>
            ) : filteredActivities && filteredActivities.length > 0 ? (
              filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                    <img
                      src={act.studentAvatar || '/images/user/owner.jpg'}
                      alt={act.studentName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{act.studentName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                    {act.type === 'quiz_attempt' ? (
                      <span className="inline-flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400">
                        Quiz Attempt
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        New Enrollment
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-800 dark:text-gray-200 font-medium">
                    {act.targetTitle}
                  </td>
                  <td className="py-3.5 px-4">
                    {act.type === 'quiz_attempt' ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {act.scoreOrProgress}
                        </span>
                        <Badge color={act.status === 'passed' ? 'success' : 'error'}>
                          {act.status === 'passed' ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    ) : (
                      <Badge color="light">
                        Enrolled
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-gray-400">
                    {act.timestamp}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No recent activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
