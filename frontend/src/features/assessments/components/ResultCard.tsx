import React, { memo } from 'react';
import { QuizEvaluationResult } from '../types';

interface ResultCardProps {
  result: QuizEvaluationResult;
  onBackToList: () => void;
}

/**
 * Result Summary Card component displaying evaluation score, percentage, correct/wrong counts, and Pass/Fail badge.
 */
export const ResultCard: React.FC<ResultCardProps> = memo(({ result, onBackToList }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-10 shadow-lg text-center">
      {/* Pass/Fail Status Badge */}
      <div className="inline-flex items-center justify-center mb-6">
        {result.passed ? (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Passed Assessment
          </span>
        ) : (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Did Not Pass
          </span>
        )}
      </div>

      {/* Main Score Display */}
      <div className="mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
          {result.percentage}%
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Score Obtained: <span className="font-semibold text-gray-800 dark:text-gray-200">{result.score}</span>
        </p>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Correct Answers</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {result.correctAnswers}
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Wrong Answers</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {result.wrongAnswers}
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time Taken</span>
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {result.timeTaken || 'N/A'}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onBackToList}
        className="w-full md:w-auto px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-medium text-base rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        Back to Assessments
      </button>
    </div>
  );
});

ResultCard.displayName = 'ResultCard';
