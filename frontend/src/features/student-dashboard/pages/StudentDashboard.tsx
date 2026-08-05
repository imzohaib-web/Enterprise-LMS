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
import { learningPathService } from '../../../services/learningPath.service';
import api from '../../../services/api';
import { STUDENT } from '../../../constants/routes';
import {
  TaskIcon,
  PieChartIcon,
  ShootingStarIcon,
  MailIcon,
  TimeIcon,
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
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['studentDashboard', 'enrollments', userId],
    queryFn: async () => {
      const res = await courseService.getMyEnrollments();
      return res.data?.data?.enrollments || [];
    },
    enabled: !!userId,
  });

  // ── 2. Assessments / Quizzes Query ──────────────────────────────────────────
  const { data: quizzes = [], isLoading: isQuizzesLoading } = useQuery({
    queryKey: ['studentDashboard', 'quizzes', userId],
    queryFn: async () => {
      return await assessmentApi.getQuizzes();
    },
    enabled: !!userId,
  });

  // ── 3. Certificates Query ───────────────────────────────────────────────────
  const { data: certificates = [], isLoading: isCertificatesLoading } = useQuery({
    queryKey: ['studentDashboard', 'certificates', userId],
    queryFn: async () => {
      return await getMyCertificates();
    },
    enabled: !!userId,
  });

  // ── 4. Notifications Query ──────────────────────────────────────────────────
  const { data: notifications = [], isLoading: isNotificationsLoading } = useQuery({
    queryKey: ['studentDashboard', 'notifications', userId],
    queryFn: async () => {
      const res = await getNotifications({ limit: 5 });
      return res.notifications || [];
    },
    enabled: !!userId,
  });

  // ── 5. Learning Paths Query ──────────────────────────────────────────────────
  const { data: learningPaths = [], isLoading: isPathsLoading } = useQuery({
    queryKey: ['studentDashboard', 'learningPaths', userId],
    queryFn: async () => {
      const res = await learningPathService.listLearningPaths();
      return res.data?.data?.paths || [];
    },
    enabled: !!userId,
  });

  // ── 6. Discussions Query ─────────────────────────────────────────────────────
  const { data: discussions = [] } = useQuery({
    queryKey: ['studentDashboard', 'discussions', userId],
    queryFn: async () => {
      const res = await api.get('/discussions');
      return res.data?.data?.discussions || res.data?.discussions || [];
    },
    enabled: !!userId,
  });

  const isLoading =
    isEnrollmentsLoading ||
    isQuizzesLoading ||
    isCertificatesLoading ||
    isNotificationsLoading ||
    isPathsLoading;

  // ── Calculations ────────────────────────────────────────────────────────────
  const activeCoursesCount = enrollments.filter((e) => e.status === 'active' || !e.status).length;
  const completedCoursesCount = enrollments.filter((e) => e.status === 'completed' || e.progressPercentage === 100).length;

  const totalEnrollments = enrollments.length;
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / totalEnrollments)
      : 0;

  const continueLearningEnrollment =
    enrollments.find((e) => (e.progressPercentage || 0) < 100) || enrollments[0];

  const getCourseTitle = (courseObj: any) => {
    if (!courseObj) return 'No Course Selected';
    if (typeof courseObj === 'string') return courseObj;
    return courseObj.title || 'Untitled Course';
  };

  const studentName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Student';

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
        description="Personalized learning dashboard for active courses, progress tracking, learning paths, and assessments."
      />

      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full mb-3 backdrop-blur-xs">
              Student Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome Back, {studentName}!
            </h1>
            <p className="mt-2 text-sm md:text-base text-brand-50/90 leading-relaxed">
              {user?.email && <span className="opacity-90 block text-xs mb-1">{user.email}</span>}
              You have {activeCoursesCount} active {activeCoursesCount === 1 ? 'course' : 'courses'} and{' '}
              {quizzes.length} {quizzes.length === 1 ? 'assessment' : 'assessments'} scheduled.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to={STUDENT.COURSES}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-700 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-sm"
              >
                My Courses ({totalEnrollments})
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                to={STUDENT.LEARNING_PATHS}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-xs"
              >
                Learning Paths ({learningPaths.length})
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Continue Learning */}
          <ComponentCard title="Continue Learning" desc="Last active course">
            {continueLearningEnrollment ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-[170px]">
                    {getCourseTitle(continueLearningEnrollment.course)}
                  </span>
                  <span className="text-brand-500 font-bold">
                    {continueLearningEnrollment.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${continueLearningEnrollment.progressPercentage || 0}%` }}
                  />
                </div>
                <Link
                  to={STUDENT.COURSES}
                  className="inline-flex items-center justify-center w-full mt-2 px-3 py-2 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  Resume Course
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-gray-500">No active courses to resume.</p>
                <Link to={STUDENT.COURSES} className="text-xs font-semibold text-brand-500 hover:underline">
                  Browse Courses
                </Link>
              </div>
            )}
          </ComponentCard>

          {/* Card 2: Enrolled Courses */}
          <ComponentCard title="Enrolled Courses" desc="Active learning status">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {totalEnrollments}
                </span>
                <p className="text-xs text-gray-500 mt-1">Total Enrolled</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                <FileIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500">
              <span>Completed: <strong>{completedCoursesCount}</strong></span>
              <span>Active: <strong>{activeCoursesCount}</strong></span>
            </div>
          </ComponentCard>

          {/* Card 3: Upcoming Assessments */}
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
                    <span>{quizzes[0].timeLimitMinutes || 30} mins</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-2 text-center">No upcoming quizzes.</p>
            )}
            <Link
              to={STUDENT.ASSESSMENTS}
              className="inline-flex items-center justify-center w-full mt-3 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100/60 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200/60 transition-colors"
            >
              View Quizzes ({quizzes.length})
            </Link>
          </ComponentCard>

          {/* Card 4: Overall Progress */}
          <ComponentCard title="Progress Overview" desc="Average completion rate">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {avgProgress}%
                </span>
                <p className="text-xs text-gray-500 mt-1">Average Completion</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                <PieChartIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <Link to={STUDENT.PROGRESS} className="text-brand-500 hover:underline">
                View Detailed Analytics &rarr;
              </Link>
            </div>
          </ComponentCard>
        </div>

        {/* Secondary Row Grid: Learning Paths & Weekly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 5: Learning Path Progress */}
          <ComponentCard title="Learning Paths" desc="Assigned roadmaps">
            {learningPaths.length > 0 ? (
              <div className="space-y-4">
                {learningPaths.slice(0, 2).map((path: any) => (
                  <div key={path._id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{path.title}</h4>
                      <span className="text-2xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full capitalize">{path.level}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{path.description}</p>
                    <div className="flex items-center justify-between text-2xs text-gray-400 pt-1">
                      <span>{path.courses?.length || 0} courses included</span>
                      <Link to={`/learning-paths/${path._id}`} className="text-indigo-600 font-bold hover:underline">
                        View Roadmap &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No learning paths assigned yet.
              </div>
            )}
          </ComponentCard>

          {/* Card 6: Weekly Learning Activity */}
          <ComponentCard title="Weekly Learning Activity" desc="Hours spent learning this week">
            <div className="flex items-end justify-between h-32 pt-4 px-2">
              {[
                { day: 'Mon', hours: 2.5 },
                { day: 'Tue', hours: 4.0 },
                { day: 'Wed', hours: 1.5 },
                { day: 'Thu', hours: 3.5 },
                { day: 'Fri', hours: 5.0 },
                { day: 'Sat', hours: 2.0 },
                { day: 'Sun', hours: 1.0 },
              ].map((item, idx) => {
                const heightPct = (item.hours / 5) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full max-w-[28px] bg-gray-100 dark:bg-gray-800 rounded-t-lg h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-brand-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-2xs text-gray-500 font-semibold">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </ComponentCard>
        </div>

        {/* Lower Row Grid: Certificates, Discussions & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 7: Recent Certificates */}
          <ComponentCard title="Earned Certificates" desc="Verified credentials">
            {certificates.length > 0 ? (
              <div className="space-y-3">
                {certificates.slice(0, 2).map((cert: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                      <ShootingStarIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <h5 className="font-bold text-gray-900 dark:text-white truncate">{cert.courseName || 'Python Certificate'}</h5>
                      <span className="text-2xs text-gray-400">Code: {cert.verificationCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">No certificates earned yet.</div>
            )}
          </ComponentCard>

          {/* Card 8: Latest Discussions */}
          <ComponentCard title="Latest Discussions" desc="Peer & instructor topics">
            {discussions.length > 0 ? (
              <div className="space-y-3">
                {discussions.slice(0, 2).map((disc: any, idx: number) => (
                  <div key={idx} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl text-xs space-y-1">
                    <h5 className="font-bold text-gray-900 dark:text-white truncate">{disc.title}</h5>
                    <p className="text-gray-500 line-clamp-1">{disc.content}</p>
                    <Link to={STUDENT.DISCUSSIONS} className="text-2xs font-semibold text-brand-600 hover:underline">
                      Join Discussion &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">No active discussions.</div>
            )}
          </ComponentCard>

          {/* Card 9: Recent Notifications */}
          <ComponentCard title="Recent Notifications" desc="System alerts & updates">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="p-1 bg-blue-100 text-blue-600 rounded-md">
                      <MailIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
                      <span className="text-2xs text-gray-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">No notifications.</div>
            )}
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
