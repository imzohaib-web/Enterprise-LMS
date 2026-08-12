import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppLayout from '../layout/AppLayout';
import PublicLayout from '../layout/PublicLayout';
import NotFound from '../pages/OtherPage/NotFound';
import ProtectedRoute from './ProtectedRoute';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  PUBLIC,
  STUDENT,
  INSTRUCTOR,
  ADMIN,
  COURSES,
  LEARNING_PATHS,
  ASSESSMENTS,
  PROGRESS,
  CERTIFICATES,
  DISCUSSIONS,
  NOTIFICATIONS,
} from '../constants/routes';

// ── Auth pages ─────────────────────────────────────────────────────────────
import SignIn from '../pages/Auth/SignIn';
import SignUp from '../pages/Auth/SignUp';

// ── Public portal pages ───────────────────────────────────────────────────
import {
  PublicHomePage,
  PublicAboutPage,
  PublicVerifyCertificatePage,
  PublicContactPage,
  PublicPrivacyPage,
  PublicTermsPage,
} from '../features/public';

// ── Feature Pages ─────────────────────────────────────────────────────────
import StudentDashboard from '../features/student-dashboard/pages/StudentDashboard';
import {
  InstructorDashboard,
  CourseList as InstructorCourseList,
  StudentProgressPage,
  QuizResultsPage,
  StatisticsPage,
  InstructorSettings,
  InstructorAssessments,
  InstructorProfilePage,
  InstructorAssignmentsPage,
  InstructorCertificatesPage,
  InstructorLearningPaths,
} from '../features/instructor-dashboard';
import {
  QuizList,
  QuizDetailsRouteWrapper,
  TakeQuizRouteWrapper,
  QuizResultRouteWrapper,
} from '../features/assessments';
import StudentProgress from '../features/progress/pages/StudentProgress';
import Discussions from '../features/discussions/pages/Discussions';
import Notifications from '../features/notifications/pages/Notifications';
import CertificateVerification from '../pages/CertificateVerification';
import StudentProfile from '../features/student-dashboard/pages/StudentProfile';
import StudentSettings from '../features/student-dashboard/pages/StudentSettings';

// Lazy-loaded Admin and Content Management Pages
const AdminDashboard     = lazy(() => import('../pages/Admin/Dashboard'));
const AdminUsers         = lazy(() => import('../pages/Admin/Users'));
const AdminReports       = lazy(() => import('../pages/Admin/Reports'));
const AdminAnalytics     = lazy(() => import('../pages/Admin/Analytics'));
const AdminAuditLogs     = lazy(() => import('../pages/Admin/AuditLogs'));
const AdminSettings      = lazy(() => import('../pages/Admin/SystemSettings'));
const AdminProfile       = lazy(() => import('../pages/Admin/AdminProfile'));
const AdminCourses       = lazy(() => import('../pages/Admin/AdminCourses'));
const CourseList         = lazy(() => import('../pages/Courses/CourseList'));
const CourseBuilder      = lazy(() => import('../pages/Courses/CourseBuilder'));
const CoursePlayer       = lazy(() => import('../features/course-player/CoursePlayer'));
const LearningPathList   = lazy(() => import('../pages/LearningPaths/LearningPathList'));
const LearningPathDetail = lazy(() => import('../pages/LearningPaths/LearningPathDetail'));
const StudentCertificates= lazy(() => import('../features/student-dashboard/pages/StudentCertificates'));

const Loader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
  </div>
);

const RootRedirect: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  if (user?.role === 'admin') return <Navigate to={ADMIN.DASHBOARD} replace />;
  if (user?.role === 'student') return <Navigate to={STUDENT.DASHBOARD} replace />;
  return <Navigate to={INSTRUCTOR.DASHBOARD} replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Authentication Routes ─────────────────────────────────────── */}
      <Route path={PUBLIC.LOGIN} element={<SignIn />} />
      <Route path={PUBLIC.REGISTER} element={<SignUp />} />

      {/* ── Public Web Portal Routes ─────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path={PUBLIC.HOME} element={<PublicHomePage />} />
        <Route path={PUBLIC.ABOUT} element={<PublicAboutPage />} />
        <Route path={PUBLIC.VERIFY} element={<PublicVerifyCertificatePage />} />
        <Route path={PUBLIC.VERIFY_CODE} element={<PublicVerifyCertificatePage />} />
        <Route path="/verify/:verificationCode" element={<CertificateVerification />} />
        <Route path={PUBLIC.CONTACT} element={<PublicContactPage />} />
        <Route path={PUBLIC.PRIVACY} element={<PublicPrivacyPage />} />
        <Route path={PUBLIC.TERMS} element={<PublicTermsPage />} />
      </Route>

      {/* ── Protected Application Routes ───────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Main Root Role-Aware Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Feature Routes (Admin Only) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path={ADMIN.DASHBOARD} element={<Suspense fallback={<Loader />}><AdminDashboard /></Suspense>} />
            <Route path={ADMIN.USERS}     element={<Suspense fallback={<Loader />}><AdminUsers /></Suspense>} />
            <Route path={ADMIN.REPORTS}   element={<Suspense fallback={<Loader />}><AdminReports /></Suspense>} />
            <Route path={ADMIN.COURSES}   element={<Suspense fallback={<Loader />}><AdminCourses /></Suspense>} />
            <Route path={ADMIN.ANALYTICS} element={<Suspense fallback={<Loader />}><AdminAnalytics /></Suspense>} />
            <Route path={ADMIN.AUDIT_LOGS} element={<Suspense fallback={<Loader />}><AdminAuditLogs /></Suspense>} />
            <Route path={ADMIN.SETTINGS}  element={<Suspense fallback={<Loader />}><AdminSettings /></Suspense>} />
            <Route path={ADMIN.NOTIFICATIONS} element={<Notifications />} />
            <Route path={ADMIN.PROFILE} element={<Suspense fallback={<Loader />}><AdminProfile /></Suspense>} />
          </Route>

          {/* Instructor Feature Routes (Instructor & Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
            <Route path={INSTRUCTOR.DASHBOARD} element={<InstructorDashboard />} />
            <Route path={INSTRUCTOR.COURSES} element={<InstructorCourseList />} />
            <Route path={INSTRUCTOR.LEARNING_PATHS} element={<InstructorLearningPaths />} />
            <Route path={INSTRUCTOR.STUDENTS} element={<StudentProgressPage />} />
            <Route path={INSTRUCTOR.ASSESSMENTS} element={<InstructorAssessments />} />
            <Route path={INSTRUCTOR.ASSIGNMENTS} element={<InstructorAssignmentsPage />} />
            <Route path={INSTRUCTOR.CERTIFICATES} element={<InstructorCertificatesPage />} />
            <Route path={INSTRUCTOR.DISCUSSIONS} element={<Discussions />} />
            <Route path={INSTRUCTOR.NOTIFICATIONS} element={<Notifications />} />
            <Route path={INSTRUCTOR.QUIZ_RESULTS} element={<QuizResultsPage />} />
            <Route path={INSTRUCTOR.STATISTICS} element={<StatisticsPage />} />
            <Route path={INSTRUCTOR.ANALYTICS} element={<StatisticsPage />} />
            <Route path={INSTRUCTOR.SETTINGS} element={<InstructorSettings />} />
            <Route path={INSTRUCTOR.PROFILE} element={<InstructorProfilePage />} />
            <Route path={COURSES.NEW} element={<Suspense fallback={<Loader />}><CourseBuilder /></Suspense>} />
            <Route path="/courses/:id/builder" element={<Suspense fallback={<Loader />}><CourseBuilder /></Suspense>} />
          </Route>

          {/* Student Feature Routes (Student & Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path={STUDENT.DASHBOARD} element={<StudentDashboard />} />
            <Route path={STUDENT.COURSES} element={<Suspense fallback={<Loader />}><CourseList /></Suspense>} />
            <Route path={STUDENT.LEARNING_PATHS} element={<Suspense fallback={<Loader />}><LearningPathList /></Suspense>} />
            <Route path="/learning-paths/:id" element={<Suspense fallback={<Loader />}><LearningPathDetail /></Suspense>} />
            <Route path={STUDENT.ASSESSMENTS} element={<QuizList />} />
            <Route path={`${STUDENT.ASSESSMENTS}/:id`} element={<QuizDetailsRouteWrapper />} />
            <Route path={`${STUDENT.ASSESSMENTS}/:id/take`} element={<TakeQuizRouteWrapper />} />
            <Route path={`${STUDENT.ASSESSMENTS}/:id/result`} element={<QuizResultRouteWrapper />} />
            <Route path={STUDENT.PROGRESS} element={<StudentProgress />} />
            <Route path={STUDENT.CERTIFICATES} element={<Suspense fallback={<Loader />}><StudentCertificates /></Suspense>} />
            <Route path={STUDENT.DISCUSSIONS} element={<Discussions />} />
            <Route path={STUDENT.NOTIFICATIONS} element={<Notifications />} />
            <Route path={STUDENT.PROFILE} element={<StudentProfile />} />
            <Route path={STUDENT.SETTINGS} element={<StudentSettings />} />
            <Route path="/courses/:id" element={<Suspense fallback={<Loader />}><CoursePlayer /></Suspense>} />
            <Route path="/courses/:id/learn" element={<Suspense fallback={<Loader />}><CoursePlayer /></Suspense>} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route path={COURSES.LIST} element={<Suspense fallback={<Loader />}><CourseList /></Suspense>} />
          <Route path={LEARNING_PATHS.LIST} element={<Suspense fallback={<Loader />}><LearningPathList /></Suspense>} />
          <Route path={ASSESSMENTS} element={<QuizList />} />
          <Route path={`${ASSESSMENTS}/:id`} element={<QuizDetailsRouteWrapper />} />
          <Route path={`${ASSESSMENTS}/:id/take`} element={<TakeQuizRouteWrapper />} />
          <Route path={`${ASSESSMENTS}/:id/result`} element={<QuizResultRouteWrapper />} />
          <Route path={PROGRESS} element={<StudentProgress />} />
          <Route path={CERTIFICATES} element={<CertificateVerification />} />
          <Route path="/certificates/verify" element={<CertificateVerification />} />
          <Route path={DISCUSSIONS} element={<Discussions />} />
          <Route path={NOTIFICATIONS} element={<Notifications />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
