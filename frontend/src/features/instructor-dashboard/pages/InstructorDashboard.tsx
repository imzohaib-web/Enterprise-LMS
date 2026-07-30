import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import StatCard from '../components/StatCard';
import EnrollmentChart from '../components/EnrollmentChart';
import QuizPerformanceChart from '../components/QuizPerformanceChart';
import ActivityTable from '../components/ActivityTable';
import { useInstructorStats } from '../hooks/useInstructorDashboard';
import {
  GridIcon,
  TaskIcon,
  ShootingStarIcon,
  ChatIcon,
  MailIcon,
  UserCircleIcon,
  CheckCircleIcon,
} from '../../../icons';
import { Link } from 'react-router-dom';
import { INSTRUCTOR } from '../../../constants/routes';

export const InstructorDashboard: React.FC = () => {
  const { data: stats, isLoading } = useInstructorStats();

  const activeStats = {
    totalCourses: stats?.totalCourses ?? 12,
    totalStudents: stats?.totalStudents ?? 485,
    publishedCourses: stats?.publishedCourses ?? 9,
    pendingAssessments: stats?.pendingAssessments ?? 14,
    certificatesIssued: 128,
  };

  return (
    <>
      <PageMeta
        title="Instructor Dashboard | Enterprise LMS"
        description="Comprehensive dashboard overview for course management, students, and assessments."
      />

      <div className="space-y-6">
        {/* Banner Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xs">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Instructor Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your published courses, student progress, pending grading, and discussions.
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

        {/* Widgets Row 1: Widget 1 (Course Statistics), Widget 2 (Students), Widget 3 (Published Courses), Widget 4 (Pending Assessments), Widget 5 (Certificates Issued) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Widget 1: Course Statistics */}
          <StatCard
            title="Course Statistics"
            value={isLoading ? '...' : activeStats.totalCourses}
            subtitle="Total courses created"
            icon={<GridIcon className="size-6 text-brand-500" />}
          />
          {/* Widget 2: Students */}
          <StatCard
            title="Students"
            value={isLoading ? '...' : activeStats.totalStudents}
            subtitle="Active enrolled learners"
            icon={<UserCircleIcon className="size-6 text-blue-500" />}
          />
          {/* Widget 3: Published Courses */}
          <StatCard
            title="Published Courses"
            value={isLoading ? '...' : activeStats.publishedCourses}
            subtitle="Live catalog items"
            icon={<CheckCircleIcon className="size-6 text-emerald-500" />}
          />
          {/* Widget 4: Pending Assessments */}
          <StatCard
            title="Pending Assessments"
            value={isLoading ? '...' : activeStats.pendingAssessments}
            subtitle="Submissions to grade"
            icon={<TaskIcon className="size-6 text-amber-500" />}
          />
          {/* Widget 5: Certificates Issued */}
          <StatCard
            title="Certificates Issued"
            value={activeStats.certificatesIssued}
            subtitle="Earned by students"
            icon={<ShootingStarIcon className="size-6 text-purple-500" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentChart />
          <QuizPerformanceChart />
        </div>

        {/* Widgets Row 2: Widget 6 (Recent Discussions) & Widget 7 (Notifications) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget 6: Recent Discussions */}
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
              <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 flex items-start gap-3">
                <ChatIcon className="w-5 h-5 text-brand-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    Clarification on Microservice Architecture Assignment
                  </h4>
                  <p className="text-2xs text-gray-500 mt-0.5">
                    Posted by Mark Vance • Course: Distributed Systems
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

          {/* Widget 7: Notifications */}
          <ComponentCard title="Notifications" desc="System & course announcements">
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg">
                  <MailIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    25 new students enrolled in "Advanced TypeScript Patterns".
                  </p>
                  <span className="text-gray-400 text-2xs">3 hours ago</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-amber-100 text-amber-600 dark:bg-amber-900/30 rounded-lg">
                  <TaskIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    Quiz #4 auto-grading complete. 14 manual reviews pending.
                  </p>
                  <span className="text-gray-400 text-2xs">Today at 09:30 AM</span>
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
