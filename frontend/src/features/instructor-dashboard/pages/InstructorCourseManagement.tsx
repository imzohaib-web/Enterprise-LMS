import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import {
  useInstructorCourses,
  useCourseOverviewStats,
} from '../hooks/useInstructorDashboard';
import { INSTRUCTOR } from '../../../constants/routes';

// Tab Subcomponents
import CourseOverviewTab from '../components/CourseOverviewTab';
import InstructorAssessments from './InstructorAssessments';
import InstructorAssignmentsPage from './InstructorAssignments';
import StudentProgressPage from './StudentProgressPage';
import InstructorSettings from './InstructorSettings';
import CourseBuilder from '../../../pages/Courses/CourseBuilder';

import {
  GridIcon,
  TaskIcon,
  DocsIcon,
  BoxCubeIcon,
  PieChartIcon,
  PlugInIcon,
  PageIcon,
} from '../../../icons';

export const InstructorCourseManagement: React.FC = () => {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from URL path
  const activeTab = useMemo(() => {
    const segments = location.pathname.split('/');
    const lastSeg = segments[segments.length - 1];
    const validTabs = ['overview', 'content', 'sections', 'lessons', 'assessments', 'assignments', 'quizzes', 'students', 'progress', 'settings'];
    if (validTabs.includes(lastSeg)) {
      return lastSeg;
    }
    return 'overview';
  }, [location.pathname]);

  // Fetch current course overview stats & info
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useCourseOverviewStats(courseId);

  // Fetch all instructor teaching courses for Course Switcher
  const { data: coursesData } = useInstructorCourses();

  const coursesList = useMemo(() => {
    if (!coursesData) return [];
    return Array.isArray(coursesData) ? coursesData : (coursesData as any).courses || [];
  }, [coursesData]);

  const activeCourse = overviewData?.course;
  const activeStats = overviewData?.stats;

  const handleTabChange = (tab: string) => {
    navigate(`/instructor/courses/${courseId}/${tab}`);
  };

  const handleCourseSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourseId = e.target.value;
    if (newCourseId && newCourseId !== courseId) {
      navigate(`/instructor/courses/${newCourseId}/${activeTab}`);
    }
  };

  if (isOverviewLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  if (isOverviewError || !activeCourse) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Course Not Found or Access Denied</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          You do not have permission to manage this course, or the course ID is invalid.
        </p>
        <Link
          to={INSTRUCTOR.COURSES}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
        >
          ← Back to Teaching Courses
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${activeCourse.title} — Course Management | Enterprise LMS`}
        description={`Dedicated course management workspace for ${activeCourse.title}`}
      />

      <div className="space-y-6">
        {/* ── COURSE MANAGEMENT HEADER BAR ────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-100 dark:border-gray-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={INSTRUCTOR.COURSES}
                  className="text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 transition"
                >
                  ← Teaching Courses
                </Link>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                  {activeCourse.category}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  activeCourse.status === 'published'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>
                  {activeCourse.status}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {activeCourse.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Students: <strong className="text-gray-900 dark:text-white font-bold">{activeStats?.enrolledStudentsCount || 0}</strong></span>
                <span>•</span>
                <span>Sections: <strong className="text-gray-900 dark:text-white font-bold">{activeStats?.totalSections || 0}</strong></span>
                <span>•</span>
                <span>Lessons: <strong className="text-gray-900 dark:text-white font-bold">{activeStats?.totalLessons || 0}</strong></span>
                <span>•</span>
                <span>Assessments: <strong className="text-gray-900 dark:text-white font-bold">{activeStats?.assessmentsCount || 0}</strong></span>
              </div>
            </div>

            {/* Course Switcher Dropdown */}
            <div className="flex items-center gap-3 self-start lg:self-center">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/80 px-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Switch Course:</span>
                <select
                  value={courseId}
                  onChange={handleCourseSwitch}
                  className="bg-transparent text-xs font-semibold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer max-w-[220px] truncate"
                >
                  {coursesList.map((c: any) => (
                    <option key={c.id || c._id} value={c.id || c._id} className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── COURSE NAVIGATION TABS ───────────────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: 'overview', label: 'Overview', icon: <GridIcon className="size-4" /> },
              { id: 'content', label: 'Course Content', icon: <PageIcon className="size-4" /> },
              { id: 'assessments', label: 'Assessments & Quizzes', icon: <TaskIcon className="size-4" /> },
              { id: 'assignments', label: 'Assignments', icon: <DocsIcon className="size-4" /> },
              { id: 'students', label: `Students (${activeStats?.enrolledStudentsCount || 0})`, icon: <BoxCubeIcon className="size-4" /> },
              { id: 'progress', label: 'Progress & Analytics', icon: <PieChartIcon className="size-4" /> },
              { id: 'settings', label: 'Course Settings', icon: <PlugInIcon className="size-4" /> },
            ].map((tab) => {
              const active = activeTab === tab.id || (activeTab === 'sections' && tab.id === 'content') || (activeTab === 'lessons' && tab.id === 'content') || (activeTab === 'quizzes' && tab.id === 'assessments');
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ACTIVE TAB CONTENT RENDERER ───────────────────────────────────────── */}
        <div>
          {activeTab === 'overview' && (
            <CourseOverviewTab courseId={courseId} onNavigateTab={handleTabChange} />
          )}

          {(activeTab === 'content' || activeTab === 'sections' || activeTab === 'lessons') && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6">
              <CourseBuilder courseIdOverride={courseId} />
            </div>
          )}

          {(activeTab === 'assessments' || activeTab === 'quizzes') && (
            <InstructorAssessments courseId={courseId} />
          )}

          {activeTab === 'assignments' && (
            <InstructorAssignmentsPage courseId={courseId} />
          )}

          {activeTab === 'students' && (
            <StudentProgressPage courseId={courseId} />
          )}

          {activeTab === 'progress' && (
            <StudentProgressPage courseId={courseId} />
          )}

          {activeTab === 'settings' && (
            <InstructorSettings courseId={courseId} />
          )}
        </div>
      </div>
    </>
  );
};

export default InstructorCourseManagement;
