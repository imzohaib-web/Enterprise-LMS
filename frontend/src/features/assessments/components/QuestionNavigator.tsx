import React, { memo } from 'react';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answersMap: Record<number, string>;
  onSelectQuestion: (index: number) => void;
}

/**
 * Question Navigator component rendering a quick-access grid of question pills.
 * Color-coded for current, answered, and unanswered states.
 */
export const QuestionNavigator: React.FC<QuestionNavigatorProps> = memo(({
  totalQuestions,
  currentIndex,
  answersMap,
  onSelectQuestion,
}) => {
  const answeredCount = Object.keys(answersMap).length;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Question Navigator
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {answeredCount}/{totalQuestions} Answered
        </span>
      </div>

      {/* Grid of Question Pills */}
      <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(answersMap[idx]);

          let buttonStyle = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';

          if (isAnswered) {
            buttonStyle = 'bg-brand-500 text-white dark:bg-brand-600 font-medium';
          }

          if (isCurrent) {
            buttonStyle += ' ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-gray-900 font-bold';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              aria-label={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'}${isCurrent ? ', Current' : ''})`}
              className={`h-10 w-full rounded-xl flex items-center justify-center text-sm transition-all duration-150 ${buttonStyle}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 inline-block" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-brand-500 inline-block" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
});

QuestionNavigator.displayName = 'QuestionNavigator';
