import React from 'react';

interface LessonNavigationProps {
  isCompleted: boolean;
  isFirstLesson: boolean;
  isLastLesson: boolean;
  isMarkingComplete: boolean;
  onMarkComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  isCompleted,
  isFirstLesson,
  isLastLesson,
  isMarkingComplete,
  onMarkComplete,
  onNext,
  onPrev,
}) => {
  return (
    <div className="sticky bottom-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3">
      {/* Previous Lesson Button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstLesson}
        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Previous</span>
      </button>

      {/* Mark as Complete Button */}
      <button
        type="button"
        onClick={onMarkComplete}
        disabled={isMarkingComplete}
        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
          isCompleted
            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {isMarkingComplete ? (
          <>
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />
            <span>Updating Progress...</span>
          </>
        ) : isCompleted ? (
          <>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>
            <span>Completed</span>
          </>
        ) : (
          <span>Mark as Complete</span>
        )}
      </button>

      {/* Next Lesson or Course Completed Button */}
      {isLastLesson ? (
        <span className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
          <span>🎉 Course Completed</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <span>Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LessonNavigation;
