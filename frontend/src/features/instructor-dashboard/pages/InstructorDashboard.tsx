import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import StatCard from '../components/StatCard';
import EnrollmentChart from '../components/EnrollmentChart';
import QuizPerformanceChart from '../components/QuizPerformanceChart';
import ActivityTable from '../components/ActivityTable';
import { useInstructorStats, useInstructorProfile } from '../hooks/useInstructorDashboard';
import { BoxCubeIcon, CalenderIcon, GridIcon, TaskIcon } from '../../../icons';

export const InstructorDashboard: React.FC = () => {
  const { data: stats, isLoading: isStatsLoading } = useInstructorStats();
  const { data: profile } = useInstructorProfile();

  const welcomeName = profile?.name || 'Dr. Sarah Jenkins';

  return (
    <>
      <PageMeta
        title="Instructor Dashboard | Enterprise LMS"
        description="Comprehensive dashboard overview for enterprise instructors"
      />

      <div className="space-y-6">
        {/* Welcome Instructor Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {profile?.avatar && (
                <img
                  src={profile.avatar}
                  alt={welcomeName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              )}
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Welcome back, {welcomeName}! 👋
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Here is your enterprise teaching overview. Track assigned courses, live student enrollments, quiz evaluations, and analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-semibold">
              <CalenderIcon className="w-4 h-4" />
              Active Term 2026
            </span>
          </div>
        </div>

        {/* Primary Dashboard Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Assigned Courses"
            value={isStatsLoading ? '...' : stats?.totalCourses || stats?.assignedCourses || 0}
            growth={stats?.coursesGrowth}
            icon={<GridIcon className="size-6 text-brand-500" />}
            subtitle={`Published: ${stats?.publishedCourses || 0} | Drafts: ${stats?.draftCourses || 0}`}
          />
          <StatCard
            title="Total Enrolled Students"
            value={isStatsLoading ? '...' : stats?.totalStudents || 0}
            growth={stats?.studentsGrowth}
            icon={<BoxCubeIcon className="size-6 text-blue-500" />}
            subtitle="Unique active learners"
          />
          <StatCard
            title="Active Enrollments"
            value={isStatsLoading ? '...' : stats?.activeEnrollments || stats?.totalStudents || 0}
            growth={stats?.studentsGrowth}
            icon={<BoxCubeIcon className="size-6 text-emerald-500" />}
            subtitle="Total course seats filled"
          />
          <StatCard
            title="Pending Assessments"
            value={isStatsLoading ? '...' : stats?.pendingAssessments || stats?.pendingQuizReviews || 0}
            growth={stats?.pendingGrowth}
            icon={<TaskIcon className="size-6 text-amber-500" />}
            subtitle="Requires review / grading"
          />
        </div>

        {/* Secondary Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-xs">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Published Courses</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.publishedCourses || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-xs">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Certificates Issued</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.certificatesIssued || 1}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-xs">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Learning Paths</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.learningPaths || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-xs">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Course Discussions</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.recentDiscussions || 1}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentChart />
          <QuizPerformanceChart />
        </div>

        {/* Latest Activity Table */}
        <ActivityTable />
      </div>
    </>
  );
};

export default InstructorDashboard;
