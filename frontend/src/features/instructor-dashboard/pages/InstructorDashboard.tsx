import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import StatCard from '../components/StatCard';
import EnrollmentChart from '../components/EnrollmentChart';
import QuizPerformanceChart from '../components/QuizPerformanceChart';
import ActivityTable from '../components/ActivityTable';
import { useInstructorStats } from '../hooks/useInstructorDashboard';
import { BoxCubeIcon, CalenderIcon, GridIcon, TaskIcon } from '../../../icons';

export const InstructorDashboard: React.FC = () => {
  const { data: stats, isLoading } = useInstructorStats();

  return (
    <>
      <PageMeta
        title="Instructor Dashboard | Enterprise LMS"
        description="Comprehensive dashboard overview for instructors"
      />

      <div className="space-y-6">
        {/* Banner / Title Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Instructor Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track course performance, student enrollments, quiz results, and pending evaluations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-semibold">
              <CalenderIcon className="w-4 h-4" />
              Active Term 2026
            </span>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Courses"
            value={isLoading ? '...' : stats?.totalCourses || 0}
            growth={stats?.coursesGrowth}
            icon={<GridIcon className="size-6" />}
            subtitle="Curriculum modules created"
          />
          <StatCard
            title="Total Students"
            value={isLoading ? '...' : stats?.totalStudents || 0}
            growth={stats?.studentsGrowth}
            icon={<BoxCubeIcon className="size-6" />}
            subtitle="Enrolled across all courses"
          />
          <StatCard
            title="Published Courses"
            value={isLoading ? '...' : stats?.publishedCourses || 0}
            growth={stats?.publishedGrowth}
            icon={<GridIcon className="size-6" />}
            subtitle="Active in student catalog"
          />
          <StatCard
            title="Pending Assessments"
            value={isLoading ? '...' : stats?.pendingAssessments || 0}
            growth={stats?.pendingGrowth}
            icon={<TaskIcon className="size-6" />}
            subtitle="Requiring review/submission"
          />
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
