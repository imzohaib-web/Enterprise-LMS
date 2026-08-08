import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import StatCard from '../components/StatCard';
import EnrollmentChart from '../components/EnrollmentChart';
import QuizPerformanceChart from '../components/QuizPerformanceChart';
import ActivityTable from '../components/ActivityTable';
import { useInstructorStats, useInstructorProfile } from '../hooks/useInstructorDashboard';
import { BoxCubeIcon, GridIcon, TaskIcon, ChatIcon, MailIcon } from '../../../icons';
import { Link } from 'react-router-dom';
import { INSTRUCTOR } from '../../../constants/routes';

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
            <Link
              to={INSTRUCTOR.COURSES}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-xs"
            >
              + Create New Course
            </Link>
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

        {/* Widgets Row 2: Recent Discussions & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComponentCard title="Recent Discussions" desc="Student queries requiring response">
            <div className="space-y-3">
              <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 flex items-start gap-3">
                <ChatIcon className="w-5 h-5 text-brand-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    Question regarding Quiz #2 grading criteria
                  </h4>
                  <p className="text-2xs text-gray-500 mt-0.5">
                    Posted by Sarah Jenkins • Course: Full Stack React
                  </p>
                </div>
                <Link
                  to={INSTRUCTOR.DISCUSSIONS}
                  className="px-2.5 py-1 text-2xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100"
                >
                  Reply
                </Link>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Notifications" desc="System & course announcements">
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg">
                  <MailIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    Students enrolled in active courses.
                  </p>
                  <span className="text-gray-400 text-2xs">3 hours ago</span>
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Activity Table */}
        <ActivityTable />
      </div>
    </>
  );
};

export default InstructorDashboard;
