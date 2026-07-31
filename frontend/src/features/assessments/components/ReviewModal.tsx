import React from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answersMap: Record<number, string>;
  onClose: () => void;
  onConfirmSubmit: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  totalQuestions,
  answersMap,
  onClose,
  onConfirmSubmit,
}) => {
  if (!isOpen) return null;

  const answeredCount = Object.keys(answersMap).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl animate-fade-in">
        <h3 id="review-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Review Your Submission
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Please review your attempt details before final submission.
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-center">
            <span className="block text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Answered Questions
            </span>
            <span className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {answeredCount}
            </span>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-center">
            <span className="block text-xs font-medium text-amber-700 dark:text-amber-300">
              Unanswered Questions
            </span>
            <span className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {unansweredCount}
            </span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 mb-6 flex items-center">
            <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You have unanswered questions. Are you sure you want to submit?</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            Back to Quiz
          </button>

          <button
            type="button"
            onClick={onConfirmSubmit}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors shadow-sm"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
};
