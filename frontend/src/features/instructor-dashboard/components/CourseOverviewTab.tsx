import React from 'react';
import StatCard from './StatCard';
import ComponentCard from '../../../components/common/ComponentCard';
import { useCourseOverviewStats, useStudentProgressList } from '../hooks/useInstructorDashboard';
import { BoxCubeIcon, TaskIcon, PieChartIcon, GridIcon, DocsIcon, ArrowRightIcon } from '../../../icons';

interface CourseOverviewTabProps {
  courseId: string;
  onNavigateTab: (tab: string) => void;
}

export const CourseOverviewTab: React.FC<CourseOverviewTabProps> = ({ courseId, onNavigateTab }) => {
  const { data: overviewData, isLoading, isError } = useCourseOverviewStats(courseId);
  const { data: studentList = [] } = useStudentProgressList(courseId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  if (isError || !overviewData) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <p className="text-sm font-semibold text-rose-500">Failed to load course overview data.</p>
      </div>
    );
  }

  const { course, stats } = overviewData;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Enrolled Students"
          value={stats.enrolledStudentsCount}
          icon={<BoxCubeIcon className="size-6 text-brand-500" />}
          subtitle="Enrolled in this course"
        />
        <StatCard
          title="Course Content"
          value={`${stats.totalSections} Sections`}
          icon={<GridIcon className="size-6 text-indigo-500" />}
          subtitle={`${stats.totalLessons} total lessons`}
        />
        <StatCard
          title="Assessments & Quizzes"
          value={stats.assessmentsCount}
          icon={<TaskIcon className="size-6 text-emerald-500" />}
          subtitle={`${stats.assignmentsCount} assignments created`}
        />
        <StatCard
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          icon={<PieChartIcon className="size-6 text-amber-500" />}
          subtitle={`${stats.pendingReviewsCount} pending reviews`}
        />
      </div>

      {/* Course Summary & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Info Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Course Summary</h3>
            <span className="px-2.5 py-1 text-2xs font-semibold rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 capitalize">
              {course.category} • {course.level}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {course.description || 'No course description provided yet.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
              <span className="text-2xs text-gray-400 font-medium block">Price</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {course.price > 0 ? `$${course.price}` : 'Free'}
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
              <span className="text-2xs text-gray-400 font-medium block">Status</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {course.status}
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
              <span className="text-2xs text-gray-400 font-medium block">Sections</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.totalSections}
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
              <span className="text-2xs text-gray-400 font-medium block">Lessons</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.totalLessons}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Management Actions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Management Actions</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Direct access to manage content and students for this course.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('content')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
            >
              <span className="flex items-center gap-2">
                <GridIcon className="w-4 h-4 text-indigo-500" />
                Edit Course Content & Lessons
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigateTab('assessments')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
            >
              <span className="flex items-center gap-2">
                <TaskIcon className="w-4 h-4 text-emerald-500" />
                Manage Course Assessments
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigateTab('students')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
            >
              <span className="flex items-center gap-2">
                <BoxCubeIcon className="w-4 h-4 text-blue-500" />
                View Enrolled Student Roster ({stats.enrolledStudentsCount})
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
            >
              <span className="flex items-center gap-2">
                <DocsIcon className="w-4 h-4 text-amber-500" />
                Course Settings & Publishing
              </span>
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled Students Overview */}
      <ComponentCard title="Enrolled Students Roster" desc="Students currently taking this course">
        {studentList.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            No students are currently enrolled in this course.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {studentList.slice(0, 5).map((s) => (
              <div key={s.id || s.studentId} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {s.studentName ? s.studentName[0] : 'S'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{s.studentName}</h4>
                    <p className="text-2xs text-gray-400">{s.studentEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">{s.progressPercent}%</span>
                    <span className="text-2xs text-gray-400">Course Progress</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('students')}
                    className="px-3 py-1 text-2xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default CourseOverviewTab;
