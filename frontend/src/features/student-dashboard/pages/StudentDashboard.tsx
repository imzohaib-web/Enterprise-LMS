import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import {
  TaskIcon,
  PieChartIcon,
  ShootingStarIcon,
  ChatIcon,
  MailIcon,
  TimeIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileIcon,
} from '../../../icons';
import { Link } from 'react-router-dom';
import { STUDENT } from '../../../constants/routes';

export const StudentDashboard: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Student Dashboard | Enterprise LMS"
        description="Personalized learning dashboard for active courses, progress tracking, and assessments."
      />
      <div className="space-y-6">
        {/* Widget 1: Welcome Back Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-400 p-6 md:p-8 text-white shadow-md">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full mb-3 backdrop-blur-xs">
              Student Workspace
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome Back, Alex Student!
            </h1>
            <p className="mt-2 text-sm md:text-base text-brand-50/90 leading-relaxed">
              You are currently on a 5-day learning streak. You have 2 pending quizzes and 1 active module due this week.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to={STUDENT.COURSES}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-700 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-xs"
              >
                My Enrolled Courses
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                to={STUDENT.ASSESSMENTS}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-xs"
              >
                View Assessments
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Top Metric Cards Row: Widget 2 (Continue Learning), Widget 3 (Enrolled Courses), Widget 4 (Upcoming Quiz), Widget 5 (Progress Overview) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Widget 2: Continue Learning */}
          <ComponentCard title="Continue Learning" desc="Last visited course module">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Advanced TypeScript Patterns</span>
                <span className="text-brand-500 font-bold">72%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: '72%' }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Module 4: Decorators & Generics
              </p>
              <Link
                to={STUDENT.COURSES}
                className="inline-flex items-center justify-center w-full mt-2 px-3 py-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-lg hover:bg-brand-100 transition-colors"
              >
                Resume Lesson
              </Link>
            </div>
          </ComponentCard>

          {/* Widget 3: Enrolled Courses */}
          <ComponentCard title="Enrolled Courses" desc="Active semester status">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">4</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Courses</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                <FileIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>Completed: <strong className="text-gray-700 dark:text-gray-300">2</strong></span>
              <span>In Progress: <strong className="text-gray-700 dark:text-gray-300">2</strong></span>
            </div>
          </ComponentCard>

          {/* Widget 4: Upcoming Quiz */}
          <ComponentCard title="Upcoming Quiz" desc="Scheduled assessment">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                <TaskIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  Midterm Architecture Quiz
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                  <TimeIcon className="w-3.5 h-3.5" />
                  <span>Due in 2 days</span>
                </div>
              </div>
            </div>
            <Link
              to={STUDENT.ASSESSMENTS}
              className="inline-flex items-center justify-center w-full mt-3 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100/60 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg hover:bg-amber-200/60 transition-colors"
            >
              Start Quiz Preparation
            </Link>
          </ComponentCard>

          {/* Widget 5: Progress Overview */}
          <ComponentCard title="Progress Overview" desc="Overall completion rate">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">84%</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average Passing Grade</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                <PieChartIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <span>On track for distinction badge this term</span>
            </div>
          </ComponentCard>
        </div>

        {/* Lower Row Grid: Widget 6 (Latest Certificate), Widget 7 (Recent Notifications), Widget 8 (Learning Activity), Widget 9 (Recent Discussions) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget 6: Latest Certificate */}
          <ComponentCard title="Latest Certificate" desc="Recently earned credential">
            <div className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                <ShootingStarIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Full Stack React + Node Architecture
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Issued on July 15, 2026 • Verified ID: LMS-CERT-8842
                </p>
              </div>
              <Link
                to={STUDENT.CERTIFICATES}
                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition-colors"
              >
                View
              </Link>
            </div>
          </ComponentCard>

          {/* Widget 7: Recent Notifications */}
          <ComponentCard title="Recent Notifications" desc="Updates and alerts">
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg">
                  <MailIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    New assignment graded in Enterprise Architecture.
                  </p>
                  <span className="text-gray-400">2 hours ago</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    Quiz 3 result available: 95/100 scored.
                  </p>
                  <span className="text-gray-400">Yesterday</span>
                </div>
              </div>
            </div>
          </ComponentCard>

          {/* Widget 8: Learning Activity */}
          <ComponentCard title="Learning Activity" desc="Weekly study metrics">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-xl font-bold text-gray-900 dark:text-white">18.5 hrs</span>
                <p className="text-xs text-gray-500 mt-1">Study Time</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-xl font-bold text-brand-600 dark:text-brand-400">12</span>
                <p className="text-xs text-gray-500 mt-1">Lessons Done</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                <p className="text-xs text-gray-500 mt-1">Quiz Accuracy</p>
              </div>
            </div>
          </ComponentCard>

          {/* Widget 9: Recent Discussions */}
          <ComponentCard title="Recent Discussions" desc="Community & class threads">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <ChatIcon className="w-4 h-4 text-brand-500" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Best practices for React Query cache mutation?
                  </span>
                </div>
                <span className="text-gray-400 text-2xs">4 replies</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <ChatIcon className="w-4 h-4 text-brand-500" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Assessment 2 revision group study setup
                  </span>
                </div>
                <span className="text-gray-400 text-2xs">9 replies</span>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
