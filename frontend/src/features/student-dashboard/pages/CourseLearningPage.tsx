import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '../../../components/common/PageMeta';
import { courseService } from '../../../services/course.service';
import { progressService } from '../../../services/progress.service';

import { CourseOverviewTab } from '../components/CourseOverviewTab';
import { CourseContentTab } from '../components/CourseContentTab';
import { CourseAssessmentsTab } from '../components/CourseAssessmentsTab';
import { CourseAssignmentsTab } from '../components/CourseAssignmentsTab';
import { CourseProgressTab } from '../components/CourseProgressTab';
import { CourseCertificateTab } from '../components/CourseCertificateTab';

import {
  PageIcon,
  TaskIcon,
  PieChartIcon,
  ShootingStarIcon,
  FileIcon,
  UserCircleIcon,
  ArrowRightIcon,
} from '../../../icons';

export const CourseLearningPage: React.FC = () => {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from route path
  const activeTab = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    const lastSeg = pathSegments[pathSegments.length - 1];
    const validTabs = ['overview', 'content', 'assessments', 'assignments', 'progress', 'certificate'];
    if (validTabs.includes(lastSeg)) {
      return lastSeg;
    }
    return 'overview';
  }, [location.pathname]);

  // 1. Fetch Course details
  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
    error: courseError,
  } = useQuery({
    queryKey: ['courseDetail', courseId],
    queryFn: async () => {
      const res = await courseService.getCourseById(courseId);
      return res.data?.data?.course;
    },
    enabled: Boolean(courseId),
  });

  // 2. Fetch My Enrollments to verify student authorization
  const { data: myEnrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: async () => {
      const res = await courseService.getMyEnrollments();
      return res.data?.data?.enrollments || [];
    },
  });

  const isEnrolled = useMemo(() => {
    return myEnrollments.some((e: any) => {
      const eCourseId = typeof e.course === 'object' ? e.course?._id : e.course;
      return eCourseId === courseId;
    });
  }, [myEnrollments, courseId]);

  // 3. Fetch Course Progress for enrolled student
  const { data: progress } = useQuery({
    queryKey: ['courseProgress', courseId],
    queryFn: async () => {
      const res = await progressService.getCourseProgress(courseId);
      return res.data?.data?.progress;
    },
    enabled: Boolean(courseId) && isEnrolled,
  });

  const handleTabChange = (tab: string) => {
    navigate(`/student/courses/${courseId}/${tab}`);
  };

  const isLoading = isCourseLoading || isEnrollmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  // Not enrolled or Course Not Found state
  if (isCourseError || !course) {
    return (
      <div className="p-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl text-center space-y-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Not Found</h2>
        <p className="text-xs text-gray-500">
          {(courseError as any)?.response?.data?.message || "The course you requested doesn't exist or is unavailable."}
        </p>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
        >
          &larr; Back to My Courses
        </Link>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="p-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl text-center space-y-4 max-w-lg mx-auto mt-10 shadow-sm">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <PageIcon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-gray-500">
          You are not enrolled in <strong>{course.title}</strong>. Please enroll in this course to access its learning materials, assessments, and assignments.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/courses"
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-xs"
          >
            Browse Course Catalog
          </Link>
          <Link
            to="/student/courses"
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 transition"
          >
            My Courses
          </Link>
        </div>
      </div>
    );
  }

  const instructorObj = typeof course.instructor === 'object' ? course.instructor : null;
  const instructorName = instructorObj
    ? `${(instructorObj as any).firstName || ''} ${(instructorObj as any).lastName || ''}`.trim() ||
      (instructorObj as any).email ||
      'Instructor'
    : typeof course.instructor === 'string'
    ? course.instructor
    : (course as any).instructorName || 'Instructor';

  const categoryName =
    typeof course.category === 'object' && course.category
      ? (course.category as any).name
      : typeof course.category === 'string'
      ? course.category
      : 'Course Space';

  const progressPct = progress?.progressPercentage || 0;

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: <PageIcon className="w-4 h-4" /> },
    { id: 'content', label: 'Course Content', icon: <PageIcon className="w-4 h-4" /> },
    { id: 'assessments', label: 'Assessments', icon: <TaskIcon className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileIcon className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <PieChartIcon className="w-4 h-4" /> },
    { id: 'certificate', label: 'Certificate', icon: <ShootingStarIcon className="w-4 h-4" /> },
  ];

  return (
    <>
      <PageMeta
        title={`${course.title} | Course Learning Space`}
        description={`Interactive learning space for ${course.title}`}
      />

      <div className="space-y-6">
        {/* Dedicated Course Learning Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-indigo-900/40">
          <div className="relative z-10 space-y-4">
            {/* Top Navigation & Back Link */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/student/courses"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs transition"
              >
                &larr; Back to My Courses
              </Link>
              <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                <span>Active Enrollment</span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
              <div className="space-y-1 max-w-3xl">
                <span className="text-2xs font-bold uppercase tracking-wider text-indigo-400">
                  {categoryName}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200 pt-1">
                  <span className="flex items-center gap-1.5">
                    <UserCircleIcon className="w-4 h-4 text-indigo-400" />
                    Instructor: <strong>{instructorName}</strong>
                  </span>
                  <span>•</span>
                  <span>Level: <strong className="capitalize">{course.level || 'All Levels'}</strong></span>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl min-w-[200px] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Progress</span>
                  <span className="text-emerald-400">{progressPct}%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <button
                  onClick={() => handleTabChange('content')}
                  className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-2xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  Continue Learning
                  <ArrowRightIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-xs">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content Area */}
        <div className="transition-all duration-300">
          {activeTab === 'overview' && (
            <CourseOverviewTab
              course={course}
              progress={progress}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'content' && (
            <CourseContentTab course={course} progress={progress} />
          )}

          {activeTab === 'assessments' && (
            <CourseAssessmentsTab courseId={courseId} courseTitle={course.title} />
          )}

          {activeTab === 'assignments' && (
            <CourseAssignmentsTab courseId={courseId} courseTitle={course.title} />
          )}

          {activeTab === 'progress' && (
            <CourseProgressTab course={course} progress={progress} />
          )}

          {activeTab === 'certificate' && (
            <CourseCertificateTab
              courseId={courseId}
              courseTitle={course.title}
              progress={progress}
              onNavigateTab={handleTabChange}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CourseLearningPage;
