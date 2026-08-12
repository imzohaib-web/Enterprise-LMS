import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import { TableSkeleton } from '../components/SkeletonLoader';
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

  // Bulk state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const toggleSelectAll = () => {
    if (!filteredResults) return;
    if (selectedIds.length === filteredResults.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredResults.map((r) => r.id || r._id || ''));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkExport = () => {
    if (!filteredResults || selectedIds.length === 0) return;
    const selectedItems = filteredResults.filter((r) => selectedIds.includes(r.id || r._id || ''));
    const headers = ['Student Name', 'Student Email', 'Quiz Title', 'Course Name', 'Score %', 'Passed', 'Status'];
    const rows = selectedItems.map((r) => [
      `"${r.studentName}"`,
      `"${r.studentEmail || ''}"`,
      `"${r.quizTitle}"`,
      `"${r.courseName}"`,
      `${r.score}%`,
      r.passed ? 'Yes' : 'No',
      `"${r.status}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-quiz-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenReviewModal = (attempt: QuizResultItem) => {
    setSelectedAttempt(attempt);
    setReviewScore(attempt.score || 0);
    setReviewFeedback(attempt.feedback || '');
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
          {/* Floating Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="mb-4 p-3 bg-brand-500 text-white rounded-xl flex items-center justify-between shadow-md">
              <div className="text-xs font-semibold">
                {selectedIds.length} submission(s) selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkExport}
                  className="px-3 py-1 bg-white text-brand-600 hover:bg-gray-100 text-xs font-bold rounded-lg transition shadow-xs"
                >
                  Export Selected ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load quiz results.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(filteredResults && filteredResults.length > 0 && selectedIds.length === filteredResults.length)}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </th>
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
                    filteredResults.map((r) => {
                      const rid = r.id || r._id || '';
                      const isSelected = selectedIds.includes(rid);
                      return (
                        <tr key={rid} className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-brand-50/40 dark:bg-brand-900/10' : ''}`}>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(rid)}
                              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                          </td>
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
                    );
                  })
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

      {/* Enhanced Manual Review & Answer Inspection Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 my-8 space-y-6 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAttempt.studentAvatar || '/images/user/owner.jpg'}
                  alt={selectedAttempt.studentName}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedAttempt.studentName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedAttempt.studentEmail || 'Student'} • {selectedAttempt.courseName}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedAttempt.quizTitle}
                </div>
                <div className="text-xs text-gray-400">
                  Attempt Date: {selectedAttempt.attemptDate}
                </div>
              </div>
            </div>

            {/* Questions & Student Submissions Section */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Submitted Questions & Answers ({selectedAttempt.answers?.length || 0})
                </h3>
                <div className="flex items-center gap-2">
                  <Badge color={selectedAttempt.passed ? 'success' : 'error'}>
                    Auto Score: {selectedAttempt.score}%
                  </Badge>
                </div>
              </div>

              {!selectedAttempt.answers || selectedAttempt.answers.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No detailed question breakdown available for this attempt.
                  </p>
                </div>
              ) : (
                selectedAttempt.answers.map((ans, idx) => (
                  <div
                    key={ans.questionId || idx}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{ans.questionText}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {ans.type || 'MCQ'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          ans.isCorrect
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {ans.isCorrect ? `+${ans.marksAwarded || ans.marks || 1} pts` : `0 / ${ans.marks || 1} pts`}
                        </span>
                      </div>
                    </div>

                    {/* MCQ Options Display */}
                    {Array.isArray(ans.options) && ans.options.length > 0 && (
                      <div className="space-y-1.5 pl-8 text-xs">
                        <div className="font-medium text-gray-500 mb-1">Available Options:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ans.options.map((opt: any, oIdx: number) => {
                            const optText = typeof opt === 'object' ? opt.text || opt.option : String(opt);
                            const isSubmitted = String(optText).trim() === String(ans.selectedOption).trim();
                            const isCorrectOpt = String(optText).trim() === String(ans.correctAnswer).trim();

                            return (
                              <div
                                key={oIdx}
                                className={`px-3 py-1.5 rounded-lg border flex items-center justify-between ${
                                  isSubmitted && isCorrectOpt
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                    : isSubmitted
                                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                                    : isCorrectOpt
                                    ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <span>{optText}</span>
                                {isSubmitted && <span className="text-[10px] font-bold uppercase ml-2 px-1.5 py-0.5 rounded bg-brand-500 text-white">Student Answer</span>}
                                {!isSubmitted && isCorrectOpt && <span className="text-[10px] font-bold uppercase ml-2 px-1.5 py-0.5 rounded bg-emerald-600 text-white">Correct</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Student Submitted Answer Box (Text / Code) */}
                    {(!ans.options || ans.options.length === 0 || ans.textAnswer || ans.codeAnswer) && (
                      <div className="pl-8 space-y-1.5 text-xs">
                        <div className="font-medium text-gray-500">Student's Submitted Answer:</div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                          {ans.submittedAnswer || ans.textAnswer || ans.codeAnswer || 'No response provided.'}
                        </div>
                      </div>
                    )}

                    {/* Correct Answer Reference */}
                    {ans.correctAnswer && (!ans.options || ans.options.length === 0) && (
                      <div className="pl-8 text-xs">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">Correct Answer Reference: </span>
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">{ans.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Manual Grading & Feedback Form */}
            <form onSubmit={handleSaveReview} className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4 shrink-0">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Instructor Manual Review & Feedback
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adjusted Final Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instructor Feedback / Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide constructive feedback or explanations for score adjustments..."
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAttempt(null)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-5 py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition"
                >
                  {reviewMutation.isPending && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {reviewMutation.isPending ? 'Saving Review...' : 'Submit Final Grade'}
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
