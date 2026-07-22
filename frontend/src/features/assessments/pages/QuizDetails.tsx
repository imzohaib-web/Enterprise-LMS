import React from 'react';
import { useQuiz } from '../hooks/useAssessments';

interface QuizDetailsProps {
  quizId: string;
  onStartQuiz: (quizId: string) => void;
  onBack: () => void;
}

export const QuizDetails: React.FC<QuizDetailsProps> = ({ quizId, onStartQuiz, onBack }) => {
  const { data: quiz, isLoading, isError, error } = useQuiz(quizId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl animate-pulse h-96" />
    );
  }

  if (isError || !quiz) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-3xl text-center text-rose-700 dark:text-rose-300">
        <p>Failed to load quiz details. {error?.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl"
        >
          Back to List
        </button>
      </div>
    );
  }

  const actualId = quiz.id || quiz._id || quizId;

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assessments
        </button>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
          {quiz.title}
        </h1>

        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          {quiz.description || 'Test your knowledge on this module.'}
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Total Questions</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {quiz.questions?.length || 0}
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time Limit</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {quiz.timeLimitMinutes} minutes
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Passing Score</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {quiz.passingScore}%
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/50 rounded-2xl space-y-3 text-sm text-brand-900 dark:text-brand-200">
        <h4 className="font-bold text-base text-brand-950 dark:text-brand-100">Before You Begin</h4>
        <ul className="list-disc list-inside space-y-1.5 text-brand-800 dark:text-brand-300">
          <li>Ensure a stable internet connection.</li>
          <li>The countdown timer starts as soon as you click <strong>Start Assessment</strong>.</li>
          <li>You can navigate back and forth between questions before submitting.</li>
          <li>The quiz will automatically submit when time expires.</li>
        </ul>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onStartQuiz(actualId)}
          className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
};
