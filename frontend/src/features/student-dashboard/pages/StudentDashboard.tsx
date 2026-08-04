import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import { selectCurrentUser, fetchMeThunk } from '../../auth/authSlice';
import type { AppDispatch } from '../../../app/store';
import { courseService } from '../../../services/course.service';
import { assessmentApi } from '../../assessments/api/assessmentApi';
import { getMyCertificates } from '../../../services/certificateService';
import { getNotifications } from '../../notifications/api/notificationApi';
import { STUDENT } from '../../../constants/routes';
import {
  TaskIcon,
  PieChartIcon,
  ShootingStarIcon,
  MailIcon,
  TimeIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileIcon,
} from '../../../icons';

export const StudentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMeThunk());
    }
  }, [dispatch, user]);

  const userId = user?._id || (user as any)?.id;

  // ── 1. Enrolled Courses Query ────────────────────────────────────────────────
  const {
    data: enrollments = [],
    isLoading: isEnrollmentsLoading,
  } = useQuery({
    queryKey: ['studentDashboard', 'enrollments', userId],
    queryFn: async () => {
      const res = await courseService.getMyEnrollments();
      return res.data?.data?.enrollments || [];
    },
    enabled: !!userId,
  });

  // ── 2. Assessments / Quizzes Query ──────────────────────────────────────────
  const {
    data: quizzes = [],
    isLoading: isQuizzesLoading,
  } = useQuery({
    queryKey: ['studentDashboard', 'quizzes', userId],
    queryFn: async () => {
      return await assessmentApi.getQuizzes();
    },
    enabled: !!userId,
  });

  // ── 3. Certificates Query ───────────────────────────────────────────────────
  const {
    data: certificates = [],
    isLoading: isCertificatesLoading,
  } = useQuery({
    queryKey: ['studentDashboard', 'certificates', userId],
    queryFn: async () => {
      return await getMyCertificates();
    },
    enabled: !!userId,
  });

  // ── 4. Notifications Query ──────────────────────────────────────────────────
  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
  } = useQuery({
    queryKey: ['studentDashboard', 'notifications', userId],
    queryFn: async () => {
      const res = await getNotifications({ limit: 5 });
      return res.notifications || [];
    },
    enabled: !!userId,
  });

  const isLoading =
    isEnrollmentsLoading ||
    isQuizzesLoading ||
    isCertificatesLoading ||
    isNotificationsLoading;

  // ── Data Calculations ───────────────────────────────────────────────────────
  const activeCoursesCount = enrollments.filter(
    (e) => e.status === 'active' || !e.status
  ).length;
  const completedCoursesCount = enrollments.filter(
    (e) => e.status === 'completed'
  ).length;

  const totalEnrollments = enrollments.length;
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          enrollments.reduce(
            (acc, e) => acc + (e.progressPercentage || 0),
            0
          ) / totalEnrollments
        )
      : 0;

  // Course to continue (highest progress that is not 100%, or first enrolled course)
  const continueLearningEnrollment =
    enrollments.find((e) => (e.progressPercentage || 0) < 100) ||
    enrollments[0];

  const getCourseTitle = (courseObj: any) => {
    if (!courseObj) return 'No Course Selected';
    if (typeof courseObj === 'string') return courseObj;
    return courseObj.title || 'Untitled Course';
  };

  const studentName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Student';

  // ── Loading Skeleton Render ─────────────────────────────────────────────────
  if (isLoading && !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${studentName} | Student Dashboard`}
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
              Welcome Back, {studentName}!
            </h1>
            <p className="mt-2 text-sm md:text-base text-brand-50/90 leading-relaxed">
              {user?.email && <span className="opacity-90 block text-xs mb-1">{user.email}</span>}
              You have {activeCoursesCount} active {activeCoursesCount === 1 ? 'course' : 'courses'} and{' '}
              {quizzes.length} {quizzes.length === 1 ? 'assessment' : 'assessments'} assigned.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to={STUDENT.COURSES}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-700 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-xs"
              >
                My Enrolled Courses ({totalEnrollments})
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                to={STUDENT.ASSESSMENTS}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-xs"
              >
                View Assessments ({quizzes.length})
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Widget 2: Continue Learning */}
          <ComponentCard title="Continue Learning" desc="Last active course">
            {continueLearningEnrollment ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-[180px]">
                    {getCourseTitle(continueLearningEnrollment.course)}
                  </span>
                  <span className="text-brand-500 font-bold">
                    {continueLearningEnrollment.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${continueLearningEnrollment.progressPercentage || 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status: {continueLearningEnrollment.status || 'Active'}
                </p>
                <Link
                  to={STUDENT.COURSES}
                  className="inline-flex items-center justify-center w-full mt-2 px-3 py-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  Resume Course
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No active courses to resume.
                </p>
                <Link
                  to={STUDENT.COURSES}
                  className="inline-block text-xs font-semibold text-brand-500 hover:underline"
                >
                  Explore Course Catalog
                </Link>
              </div>
            )}
          </ComponentCard>

          {/* Widget 3: Enrolled Courses */}
          <ComponentCard title="Enrolled Courses" desc="Active learning status">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {totalEnrollments}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total Enrolled
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                <FileIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>
                Completed:{' '}
                <strong className="text-gray-700 dark:text-gray-300">
                  {completedCoursesCount}
                </strong>
              </span>
              <span>
                In Progress:{' '}
                <strong className="text-gray-700 dark:text-gray-300">
                  {activeCoursesCount}
                </strong>
              </span>
            </div>
          </ComponentCard>

          {/* Widget 4: Upcoming Assessments */}
          <ComponentCard title="Upcoming Quizzes" desc="Scheduled assessments">
            {quizzes.length > 0 ? (
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                  <TaskIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {quizzes[0].title || 'Quiz Assessment'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                    <TimeIcon className="w-3.5 h-3.5" />
                    <span>{quizzes[0].timeLimitMinutes || 30} mins limit</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No upcoming quizzes.
                </p>
              </div>
            )}
            <Link
              to={STUDENT.ASSESSMENTS}
              className="inline-flex items-center justify-center w-full mt-3 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100/60 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg hover:bg-amber-200/60 transition-colors"
            >
              View All Quizzes ({quizzes.length})
            </Link>
          </ComponentCard>

          {/* Widget 5: Progress Overview */}
          <ComponentCard title="Progress Overview" desc="Average completion rate">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {avgProgress}%
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Overall Completion
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                <PieChartIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <Link to={STUDENT.PROGRESS} className="text-brand-500 hover:underline">
                View Detailed Progress &rarr;
              </Link>
            </div>
          </ComponentCard>
        </div>

        {/* Lower Row Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget 6: Latest Certificate */}
          <ComponentCard title="Certificates" desc="Earned credentials">
            {certificates.length > 0 ? (
              <div className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                  <ShootingStarIcon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {certificates[0].courseName || 'Verified Course Certificate'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Code: {certificates[0].verificationCode}
                  </p>
                </div>
                <Link
                  to={STUDENT.CERTIFICATES}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  View
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-2">
                <ShootingStarIcon className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No certificates earned yet. Complete courses to earn verified credentials.
                </p>
              </div>
            )}
          </ComponentCard>

          {/* Widget 7: Recent Notifications */}
          <ComponentCard title="Recent Notifications" desc="Updates and alerts">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((item, idx) => (
                  <div key={item.id || item._id || idx} className="flex items-start gap-3 text-xs">
                    <div className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg">
                      {item.category === 'certificate' ? (
                        <ShootingStarIcon className="w-4 h-4" />
                      ) : item.category === 'assessment' ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <MailIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {item.title}: {item.message}
                      </p>
                      <span className="text-gray-400 text-2xs">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                No recent notifications.
              </div>
            )}
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
