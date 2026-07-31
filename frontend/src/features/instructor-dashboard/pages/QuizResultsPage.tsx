import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import { useQuizResultsList } from '../hooks/useInstructorDashboard';

export const QuizResultsPage: React.FC = () => {
  const { data: results, isLoading } = useQuizResultsList();
  const [search, setSearch] = useState('');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>('all');

  const filteredResults = results?.filter((r) => {
    const matchesSearch =
      r.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.courseName.toLowerCase().includes(search.toLowerCase());
    const matchesPassed =
      filterPassed === 'all' ||
      (filterPassed === 'passed' && r.passed) ||
      (filterPassed === 'failed' && !r.passed);
    return matchesSearch && matchesPassed;
  });

  return (
    <>
      <PageMeta title="Quiz Results | Instructor Dashboard" description="Review student quiz submissions and scores" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Quiz Evaluation & Submission Results
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detailed breakdown of student quiz attempts, score performance, and passing statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search student or quiz..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterPassed('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg ${
              filterPassed === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            All Submissions ({results?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterPassed('passed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg ${
              filterPassed === 'passed'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            Passed ({results?.filter((r) => r.passed).length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterPassed('failed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg ${
              filterPassed === 'failed'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            Needs Retake ({results?.filter((r) => !r.passed).length || 0})
          </button>
        </div>

        {/* Table Card */}
        <ComponentCard title="Student Quiz Submissions" desc="Recorded assessment scores">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading quiz results...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Attempt Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filteredResults && filteredResults.length > 0 ? (
                    filteredResults.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                          <img
                            src={r.studentAvatar || '/images/user/owner.jpg'}
                            alt={r.studentName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span>{r.studentName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          {r.quizTitle}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                          {r.courseName}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                          {r.score}%
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge color={r.passed ? 'success' : 'error'}>
                            {r.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-gray-400">
                          {r.attemptDate}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No quiz result records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default QuizResultsPage;
