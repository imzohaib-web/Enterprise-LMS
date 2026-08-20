import React, { memo } from 'react';
import { Quiz } from '../types';

interface QuizCardProps {
  quiz: Quiz;
  onSelect: (quizId: string) => void;
}

/**
 * TailAdmin styled card displaying quiz details and CTA for starting an assessment.
 */
export const QuizCard: React.FC<QuizCardProps> = memo(({ quiz, onSelect }) => {
  const quizId = quiz.id || quiz._id || '';

  const courseTitle = typeof quiz.courseId === 'object' && quiz.courseId ? (quiz.courseId as any).title : (quiz as any).courseName || '';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Associated Course Badge */}
        {courseTitle && (
          <span className="inline-block px-2.5 py-1 text-2xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg mb-2 truncate max-w-full">
            📖 {courseTitle}
          </span>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">
          {quiz.description || 'Test your understanding with this course assessment.'}
        </p>

        {/* Quiz Meta Info */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Questions</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {quiz.questions?.length || 0}
            </span>
          </div>
          <div className="border-x border-gray-200 dark:border-gray-800">
            <span className="block text-xs text-gray-500 dark:text-gray-400">Time</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {quiz.timeLimitMinutes} mins
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Passing</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {quiz.passingScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onSelect(quizId)}
        className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        View Quiz Details
      </button>
    </div>
  );
});

QuizCard.displayName = 'QuizCard';
