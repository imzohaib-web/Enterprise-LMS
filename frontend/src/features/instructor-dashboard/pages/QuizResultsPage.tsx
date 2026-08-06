import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import { useQuizResultsList, useReviewQuizAttempt } from '../hooks/useInstructorDashboard';
import { QuizResultItem } from '../types';

export const QuizResultsPage: React.FC = () => {
  const { data: results, isLoading, isError } = useQuizResultsList();
  const reviewMutation = useReviewQuizAttempt();

  const [search, setSearch] = useState('');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
  const [selectedAttempt, setSelectedAttempt] = useState<QuizResultItem | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(90);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const filteredResults = results?.filter((r) => {
    const matchesSearch =
      r.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.courseName.toLowerCase().includes(search.toLowerCase());
    const matchesPassed =
      filterPassed === 'all' ||
      (filterPassed === 'passed' && r.passed) ||
      (filterPassed === 'failed' && !r.passed) ||
      (filterPassed === 'pending' && r.status === 'pending_review');
    return matchesSearch && matchesPassed;
  });

  const handleOpenReviewModal = (attempt: QuizResultItem) => {
    setSelectedAttempt(attempt);
    setReviewScore(attempt.score || 90);
    setReviewFeedback('');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttempt) return;

    reviewMutation.mutate(
      {
        attemptId: selectedAttempt.id || selectedAttempt._id || '',
        reviewData: {
          score: Number(reviewScore),
          status: 'reviewed',
          feedback: reviewFeedback,
        },
      },
      {
        onSuccess: () => {
          setSelectedAttempt(null);
        },
      }
    );
  };

  return (
    <>
      <PageMeta title="Quiz Results & Manual Review | Instructor Portal" description="Review student quiz submissions and grade open-ended questions" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Quiz Evaluation & Student Submissions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detailed breakdown of student attempts, automated scoring, manual grading reviews, and MongoDB quiz history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search student, quiz, or course..."
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
            All ({results?.length || 0})
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
            onClick={() => setFilterPassed('pending')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg ${
              filterPassed === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            Pending Review ({results?.filter((r) => r.status === 'pending_review').length || 0})
          </button>
        </div>

        {/* Table Card */}
        <ComponentCard title="Student Quiz Submissions" desc="Real-time quiz evaluation history from MongoDB">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading quiz results...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load quiz results.</div>
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
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filteredResults && filteredResults.length > 0 ? (
                    filteredResults.map((r) => (
                      <tr key={r.id || r._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                          <img
                            src={r.studentAvatar || '/images/user/owner.jpg'}
                            alt={r.studentName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                          <div>
                            <div>{r.studentName}</div>
                            <div className="text-xs text-gray-400">{r.studentEmail || ''}</div>
                          </div>
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
                          <Badge color={r.passed ? 'success' : r.status === 'pending_review' ? 'warning' : 'error'}>
                            {r.status === 'pending_review' ? 'Pending Review' : r.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(r)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                          >
                            Review & Grade
                          </button>
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

      {/* Manual Review Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Manual Review: {selectedAttempt.studentName}
            </h2>
            <p className="text-xs text-gray-500">
              Quiz: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedAttempt.quizTitle}</span>
            </p>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adjusted Total Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instructor Feedback / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide constructive feedback for the student..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAttempt(null)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50"
                >
                  {reviewMutation.isPending ? 'Saving...' : 'Submit Final Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizResultsPage;
