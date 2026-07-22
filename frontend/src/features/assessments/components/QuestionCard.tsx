import React, { memo } from 'react';
import { Question } from '../types';
import { Option } from './Option';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string;
  onSelectOption: (option: string) => void;
}

/**
 * Question Card component displaying question text, difficulty badge, marks, and options.
 * Optimized with React.memo for re-rendering performance.
 */
export const QuestionCard: React.FC<QuestionCardProps> = memo(({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
}) => {
  const getDifficultyBadgeColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800';
      case 'medium':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-gray-100 dark:border-gray-800 mb-6">
        <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 tracking-wide uppercase">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          {question.difficulty && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${getDifficultyBadgeColor(
                question.difficulty
              )}`}
            >
              {question.difficulty}
            </span>
          )}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {question.marks || 1} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-6 leading-relaxed">
        {question.question}
      </h2>

      {/* Options List */}
      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <Option
            key={typeof opt === 'string' ? idx : opt.id || idx}
            option={opt}
            index={idx}
            isSelected={selectedOption === (typeof opt === 'string' ? opt : opt.text || opt.id)}
            onSelect={onSelectOption}
          />
        ))}
      </div>
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';
