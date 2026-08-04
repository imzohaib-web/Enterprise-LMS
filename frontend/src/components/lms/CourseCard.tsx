import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types/course';

interface CourseCardProps {
  course: Course;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const levelColors = {
  beginner:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced:     'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const statusColors = {
  published: 'bg-emerald-100 text-emerald-700',
  draft:     'bg-gray-100 text-gray-600',
  archived:  'bg-red-100 text-red-600',
};

const CourseCard: React.FC<CourseCardProps> = ({ course, showActions = false, onDelete }) => {
  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${levelColors[course.level]}`}>
            {course.level}
          </span>
          {showActions && (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[course.status]}`}>
              {course.status}
            </span>
          )}
        </div>
        {course.isFree && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">FREE</div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/courses/${course._id}`} className="group-hover:text-indigo-600 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-5">{course.title}</h3>
          </Link>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            by {typeof course.instructor === 'object' ? `${course.instructor.firstName} ${course.instructor.lastName}` : ''}
          </p>
        )}

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {course.averageRating.toFixed(1)}
            </span>
          )}
          <span>{course.enrollmentCount.toLocaleString()} students</span>
          <span>{course.lessonCount ?? 0} lessons</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            <Link
              to={`/courses/${course._id}/builder`}
              className="flex-1 text-center py-1.5 px-3 text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition"
            >
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(course._id)}
                className="py-1.5 px-3 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
