import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { Course } from '../../types/course';
import { STUDENT, INSTRUCTOR } from '../../constants/routes';
import { selectCurrentUser } from '../auth/authSlice';

interface CourseOverviewPreviewProps {
  course: Course;
  isEnrolling: boolean;
  onEnroll: () => void;
}

export const CourseOverviewPreview: React.FC<CourseOverviewPreviewProps> = ({
  course,
  isEnrolling,
  onEnroll,
}) => {
  const user = useSelector(selectCurrentUser);
  const isInstructorOrAdmin = user && ['instructor', 'admin'].includes(user.role);
  const isOwner = isInstructorOrAdmin && (
    user.role === 'admin' ||
    (typeof course.instructor === 'object' ? course.instructor?._id === user._id : course.instructor === user._id)
  );

  const instructorName = course.instructor
    ? typeof course.instructor === 'object'
      ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim()
      : 'Instructor'
    : 'Instructor';

  const backRoute = isInstructorOrAdmin ? INSTRUCTOR.COURSES : STUDENT.COURSES;
  const backLabel = isInstructorOrAdmin ? 'Back to Instructor Catalog' : 'Back to Course Catalog';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={backRoute}
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backLabel}
        </Link>

        {isOwner && (
          <Link
            to={`/courses/${course._id}/builder`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            ✏️ Edit in Course Builder
          </Link>
        )}
      </div>

      {/* Hero Banner Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Info Column */}
        <div className="lg:col-span-7 p-6 md:p-8 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                {course.level} Level
              </span>
              {course.isFree && (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  FREE
                </span>
              )}
              {course.status === 'draft' && (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  DRAFT PREVIEW
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {instructorName[0] || 'I'}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Instructor: {instructorName}</p>
                <p className="text-[11px] text-gray-400">Language: {course.language || 'English'}</p>
              </div>
            </div>

            {isInstructorOrAdmin ? (
              <Link
                to={`/courses/${course._id}/builder`}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer inline-flex"
              >
                <span>Edit Course & Curriculum in Builder &rarr;</span>
              </Link>
            ) : (
              <button
                onClick={onEnroll}
                disabled={isEnrolling}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isEnrolling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Enrolling in Course...</span>
                  </>
                ) : (
                  <>
                    <span>Enroll Now & Start Learning &rarr;</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Thumbnail / Media Column */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-indigo-900 to-purple-900 min-h-[260px]">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum Syllabus Breakdown */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Curriculum Syllabus</h2>
          <span className="text-xs text-gray-400">
            {course.sections?.length || 0} Sections &bull; {course.sections?.reduce((a, s) => a + s.lessons.length, 0)} Total Lessons
          </span>
        </div>

        <div className="space-y-4">
          {course.sections?.map((section, idx) => (
            <div key={section._id || idx} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                Section {idx + 1}: {section.title}
              </h3>
              <ul className="space-y-1 pl-4 border-l-2 border-indigo-500">
                {section.lessons?.map((lesson, lIdx) => (
                  <li key={lesson._id || lIdx} className="text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between py-1">
                    <span>{lIdx + 1}. {lesson.title}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{lesson.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseOverviewPreview;
