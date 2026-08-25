import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import { BecomeInstructorModal } from '../components/BecomeInstructorModal';
import { selectCurrentUser, fetchMeThunk } from '../../auth/authSlice';
import type { AppDispatch } from '../../../app/store';
import { courseService } from '../../../services/course.service';
import { progressService } from '../../../services/progress.service';
import { assessmentApi } from '../../assessments/api/assessmentApi';
import { getMyCertificates } from '../../../services/certificateService';
import { getNotifications } from '../../notifications/api/notificationApi';
import { learningPathService } from '../../../services/learningPath.service';
import api from '../../../services/api';
import { STUDENT, INSTRUCTOR } from '../../../constants/routes';
import { instructorApplicationService } from '../../../services/instructorApplication.service';
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

  // ── 0. Instructor Application Query ─────────────────────────────────────────
  const { data: applicationData } = useQuery({
    queryKey: ['myInstructorApplication', userId],
    queryFn: () => instructorApplicationService.getMyApplication(),
    enabled: !!userId,
  });
  const myApp = applicationData?.data?.application;

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

  // ── 7. Real Weekly Learning Activity Query ──────────────────────────────────
  const {
    data: weeklyActivity,
    isLoading: isActivityLoading,
    isError: isActivityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ['studentLearningActivity', userId],
    queryFn: async () => {
      const res = await progressService.getWeeklyActivity();
      return res.data?.data?.activityData;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
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

  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);

  return (
    <>
      <PageMeta
        title={`${studentName} | Student Dashboard`}
        description="Personalized learning dashboard for active courses, progress tracking, learning paths, and assessments."
      />

      <BecomeInstructorModal
        isOpen={isInstructorModalOpen}
        onClose={() => setIsInstructorModalOpen(false)}
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
              {/* Role-Aware Instructor CTA Button */}
              {user?.role === 'instructor' || user?.role === 'admin' || myApp?.status === 'APPROVED' ? (
                <Link
                  to={INSTRUCTOR.DASHBOARD}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-400/30 rounded-xl transition-colors backdrop-blur-xs cursor-pointer"
                >
                  <span>🎓</span> Instructor Dashboard
                </Link>
              ) : myApp?.status === 'PENDING' || (user as any)?.accountStatus === 'PENDING_APPROVAL' ? (
                <button
                  onClick={() => setIsInstructorModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-400/30 rounded-xl transition-colors backdrop-blur-xs cursor-pointer"
                >
                  <span>⏳</span> Application Pending
                </button>
              ) : (
                <button
                  onClick={() => setIsInstructorModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-400/30 rounded-xl transition-colors backdrop-blur-xs cursor-pointer"
                >
                  <span>🎓</span> Become an Instructor
                </button>
              )}
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
                  to={`/student/courses/${typeof continueLearningEnrollment.course === 'object' ? continueLearningEnrollment.course._id : continueLearningEnrollment.course}/overview`}
                  className="inline-flex items-center justify-center w-full mt-2 px-3 py-2 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  Open Course Learning Space
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
              to={STUDENT.COURSES}
              className="inline-flex items-center justify-center w-full mt-3 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100/60 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200/60 transition-colors"
            >
              Select Course to View Quizzes ({quizzes.length})
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

          {/* Card 6: Real Weekly Learning Activity */}
          <ComponentCard
            title="Weekly Learning Activity"
            desc={
              isActivityLoading
                ? "Loading activity..."
                : weeklyActivity?.totalFormatted
                ? `${weeklyActivity.totalFormatted} total this week`
                : "Active learning time"
            }
          >
            {isActivityLoading ? (
              <div className="flex items-end justify-between h-32 pt-4 px-2 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full max-w-[28px] bg-gray-200 dark:bg-gray-800 rounded-t-lg h-24" />
                    <div className="w-6 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            ) : isActivityError ? (
              <div className="py-6 text-center space-y-3 border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl p-4">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Unable to load learning activity.
                </p>
                <button
                  type="button"
                  onClick={() => refetchActivity()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : !weeklyActivity || weeklyActivity.totalMinutes === 0 ? (
              <div className="py-8 text-center space-y-2 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-500">No learning activity recorded this week yet.</p>
                <Link
                  to={STUDENT.COURSES}
                  className="inline-block text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Start Learning &rarr;
                </Link>
              </div>
            ) : (
              <div
                className="space-y-2"
                aria-label={`Weekly activity chart: total ${weeklyActivity.totalFormatted} learned this week`}
              >
                <div className="flex items-end justify-between h-32 pt-4 px-2">
                  {(() => {
                    const maxMins = Math.max(60, ...weeklyActivity.activity.map((a) => a.minutes));
                    return weeklyActivity.activity.map((item, idx) => {
                      const heightPct = item.minutes > 0 ? Math.max(12, Math.round((item.minutes / maxMins) * 100)) : 0;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-2 flex-1 group relative"
                          title={`${item.day}: ${item.formatted}`}
                        >
                          <div className="w-full max-w-[28px] bg-gray-100 dark:bg-gray-800 rounded-t-lg h-full flex items-end overflow-hidden">
                            <div
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                item.minutes > 0 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-transparent'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span className="text-2xs text-gray-500 dark:text-gray-400 font-semibold">{item.day}</span>

                          {/* Hover Tooltip */}
                          {item.minutes > 0 && (
                            <div className="absolute -top-8 hidden group-hover:block bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10 whitespace-nowrap">
                              {item.formatted}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
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
