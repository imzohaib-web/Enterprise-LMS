import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types/course';
import type { FlatLesson } from './types';
import { STUDENT } from '../../constants/routes';

interface CourseHeaderProps {
  course: Course;
  activeLesson: FlatLesson | null;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  activeLesson,
  completedCount,
  totalCount,
  progressPercentage,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}) => {
  const instructorName = course.instructor
    ? typeof course.instructor === 'object'
      ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim()
      : 'Instructor'
    : 'Instructor';

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0 shadow-2xs">
      {/* Left: Back button & Course Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={STUDENT.COURSES}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0"
          title="Back to Catalog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              {course.level}
            </span>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {course.title}
            </h1>
          </div>
          {activeLesson ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {activeLesson.sectionTitle} &bull; <span className="text-gray-700 dark:text-gray-300 font-semibold">{activeLesson.title}</span>
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 truncate">by {instructorName}</p>
          )}
        </div>
      </div>

      {/* Right: Progress & Mobile Drawer Toggle */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Progress Bar (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-gray-900 dark:text-white">{progressPercentage}%</span>
            <span className="text-[10px] text-gray-400 block">
              {completedCount} / {totalCount} lessons
            </span>
          </div>
          <div className="w-24 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          aria-expanded={isMobileSidebarOpen}
          className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
            isMobileSidebarOpen
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span>Curriculum ({progressPercentage}%)</span>
        </button>
      </div>
    </header>
  );
};

export default CourseHeader;
