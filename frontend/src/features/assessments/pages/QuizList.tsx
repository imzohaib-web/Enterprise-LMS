import React, { useState } from 'react';
import { useQuizzes } from '../hooks/useAssessments';
import { QuizCard } from '../components/QuizCard';

interface QuizListProps {
  onSelectQuiz?: (quizId: string) => void;
}

export const QuizList: React.FC<QuizListProps> = ({ onSelectQuiz }) => {
  const { data: quizzes, isLoading, isError, error } = useQuizzes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuizzes = quizzes?.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-center text-sm">
          Failed to load quizzes. {error?.message}
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
                  onSelect={(id) => onSelectQuiz && onSelectQuiz(id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base font-medium">No assessments available.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
