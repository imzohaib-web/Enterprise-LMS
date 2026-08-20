import React from 'react';
import {
  PageIcon,
  UserCircleIcon,
  TimeIcon,
  ShootingStarIcon,
  TaskIcon,
  ArrowRightIcon,
} from '../../../icons';

interface CourseOverviewTabProps {
  course: any;
  progress: any;
  onNavigateTab: (tab: string) => void;
}

export const CourseOverviewTab: React.FC<CourseOverviewTabProps> = ({
  course,
  progress,
  onNavigateTab,
}) => {
  const sections = course?.sections || [];
  const totalLessons = sections.reduce(
    (acc: number, sec: any) => acc + (sec.lessons?.length || 0),
    0
  );
  const progressPct = progress?.progressPercentage || 0;

  const instructorName =
    typeof course?.instructor === 'object'
      ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() ||
        course.instructor.name ||
        'Instructor'
      : course?.instructorName || 'Instructor';

  return (
    <div className="space-y-6">
      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <PageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Modules</span>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {sections.length} Sections ({totalLessons} Lessons)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShootingStarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Course Progress</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {progressPct}% Completed
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <TimeIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Duration</span>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {course?.duration || 'Self-paced'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <UserCircleIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 block">Instructor</span>
            <span className="text-base font-bold text-gray-900 dark:text-white truncate block">
              {instructorName}
            </span>
          </div>
        </div>
      </div>

      {/* Main Description & Action Hero */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About This Course</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {course?.description || 'No detailed description provided for this course.'}
          </p>
        </div>

        {/* Quick Launch Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Ready to continue learning?</h4>
            <p className="text-xs text-gray-500">Pick up right where you left off in the interactive player.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigateTab('content')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              Go to Course Content
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('assessments')}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center gap-1.5"
            >
              <TaskIcon className="w-4 h-4" />
              Assessments
            </button>
          </div>
        </div>
      </div>

      {/* Section Syllabus Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Curriculum Overview</h3>
        {sections.length > 0 ? (
          <div className="space-y-3">
            {sections.map((sec: any, sIdx: number) => (
              <div
                key={sec._id || sIdx}
                className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Section {sIdx + 1}: {sec.title}
                  </h4>
                  <p className="text-2xs text-gray-500 mt-0.5">
                    {sec.lessons?.length || 0} lessons included
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('content')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Lessons &rarr;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No syllabus sections published yet.</p>
        )}
      </div>
    </div>
  );
};
