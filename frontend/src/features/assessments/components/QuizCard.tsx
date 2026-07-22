import React from 'react';
import { Quiz } from '../types';

interface QuizCardProps {
  quiz: Quiz;
  onSelect: (quizId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onSelect }) => {
  const quizId = quiz.id || quiz._id || '';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
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
};
