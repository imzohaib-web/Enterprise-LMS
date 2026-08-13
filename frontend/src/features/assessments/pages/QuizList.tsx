import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizzes } from '../hooks/useAssessments';
import { QuizCard } from '../components/QuizCard';
import { QuizSkeleton } from '../components/QuizSkeleton';

interface QuizListProps {
  onSelectQuiz?: (quizId: string) => void;
}

/**
 * Quiz List Page rendering searchable grid of available assessments.
 * Includes skeleton loader during fetch and empty state CTA reset.
 */
export const QuizList: React.FC<QuizListProps> = ({ onSelectQuiz }) => {
  const navigate = useNavigate();
  const { data: quizzes, isLoading, isError, error, refetch } = useQuizzes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuizzes = quizzes?.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectQuiz = (quizId: string) => {
    if (onSelectQuiz) {
      onSelectQuiz(quizId);
    } else {
      navigate(`/student/assessments/${quizId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Course Assessments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Test your knowledge and evaluate learning progress across modules.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
          <svg
            className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <QuizSkeleton count={6} />}

      {/* Error State */}
      {isError && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-3">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
            Failed to load quizzes. {error?.message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quizzes Grid */}
      {!isLoading && !isError && (
        <>
          {filteredQuizzes && filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id || quiz._id}
                  quiz={quiz}
                  onSelect={handleSelectQuiz}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                No matching assessments found.
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-3 inline-flex items-center text-xs text-brand-600 hover:underline font-semibold"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
