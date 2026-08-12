import React from 'react';
import { Link } from 'react-router-dom';
import { STUDENT } from '../../constants/routes';

interface CoursePlayerErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const CoursePlayerError: React.FC<CoursePlayerErrorProps> = ({
  title = 'Unable to Load Course',
  message = 'The requested course or lesson content could not be loaded from the server.',
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          ⚠️
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Try Again
            </button>
          )}
          <Link
            to={STUDENT.COURSES}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-xs font-bold rounded-xl transition text-center"
          >
            Back to Course Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerError;
