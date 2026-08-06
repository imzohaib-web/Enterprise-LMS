import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import PublicLayout from '../layout/PublicLayout';
import NotFound from '../pages/OtherPage/NotFound';
import ProtectedRoute from './ProtectedRoute';
import LMSPlaceholderPage from '../components/common/LMSPlaceholderPage';
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

// Lazy-loaded Admin and Content Management Pages
const AdminDashboard   = lazy(() => import('../pages/Admin/Dashboard'));
const AdminUsers       = lazy(() => import('../pages/Admin/Users'));
const AdminReports     = lazy(() => import('../pages/Admin/Reports'));
const CourseList       = lazy(() => import('../pages/Courses/CourseList'));
const CourseBuilder    = lazy(() => import('../pages/Courses/CourseBuilder'));
const LearningPathList = lazy(() => import('../pages/LearningPaths/LearningPathList'));

const Loader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
  </div>
);

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
        <Route path={PUBLIC.CONTACT} element={<PublicContactPage />} />
        <Route path={PUBLIC.PRIVACY} element={<PublicPrivacyPage />} />
        <Route path={PUBLIC.TERMS} element={<PublicTermsPage />} />
      </Route>

      {/* ── Protected Application Routes ───────────────────────────────── */}
      <Route element={<ProtectedRoute isAllowed={true} />}>
        <Route element={<AppLayout />}>
          {/* Main Root Redirect to Instructor Dashboard */}
          <Route path="/" element={<InstructorDashboard />} />

          {/* Admin Feature Routes */}
          <Route path={ADMIN.DASHBOARD} element={<Suspense fallback={<Loader />}><AdminDashboard /></Suspense>} />
          <Route path={ADMIN.USERS}     element={<Suspense fallback={<Loader />}><AdminUsers /></Suspense>} />
          <Route path={ADMIN.REPORTS}   element={<Suspense fallback={<Loader />}><AdminReports /></Suspense>} />
          <Route path={ADMIN.COURSES}   element={<Suspense fallback={<Loader />}><CourseList /></Suspense>} />
          <Route
            path={ADMIN.ANALYTICS}
            element={
              <LMSPlaceholderPage
                title="Platform Analytics"
                description="System-wide usage analytics, storage monitoring, and engagement tracking."
                category="Admin Module"
              />
            }
          />
          <Route path={ADMIN.NOTIFICATIONS} element={<Notifications />} />

          {/* Courses & Learning Paths */}
          <Route path={COURSES.LIST} element={<Suspense fallback={<Loader />}><CourseList /></Suspense>} />
          <Route path={COURSES.NEW} element={<Suspense fallback={<Loader />}><CourseBuilder /></Suspense>} />
          <Route path="/courses/:id/builder" element={<Suspense fallback={<Loader />}><CourseBuilder /></Suspense>} />
          <Route path={LEARNING_PATHS.LIST} element={<Suspense fallback={<Loader />}><LearningPathList /></Suspense>} />

          {/* Student Feature Routes */}
          <Route path={STUDENT.DASHBOARD} element={<StudentDashboard />} />
          <Route path={STUDENT.COURSES} element={<Suspense fallback={<Loader />}><CourseList /></Suspense>} />
          <Route path={STUDENT.LEARNING_PATHS} element={<Suspense fallback={<Loader />}><LearningPathList /></Suspense>} />
          <Route path={STUDENT.ASSESSMENTS} element={<QuizList />} />
          <Route path={`${STUDENT.ASSESSMENTS}/:id`} element={<QuizDetailsRouteWrapper />} />
          <Route path={`${STUDENT.ASSESSMENTS}/:id/take`} element={<TakeQuizRouteWrapper />} />
          <Route path={`${STUDENT.ASSESSMENTS}/:id/result`} element={<QuizResultRouteWrapper />} />
          <Route path={STUDENT.PROGRESS} element={<StudentProgress />} />
          <Route path={STUDENT.CERTIFICATES} element={<CertificateVerification />} />
          <Route path={STUDENT.DISCUSSIONS} element={<Discussions />} />
          <Route path={STUDENT.NOTIFICATIONS} element={<Notifications />} />
          <Route
            path={STUDENT.PROFILE}
            element={
              <LMSPlaceholderPage
                title="Student Profile"
                description="Manage your profile information, academic records, and avatar."
                category="Student Module"
              />
            }
          />
          <Route
            path={STUDENT.SETTINGS}
            element={
              <LMSPlaceholderPage
                title="Student Settings"
                description="Manage account security, email notifications, and UI preferences."
                category="Student Module"
              />
            }
          />

          {/* Instructor Feature Routes */}
          <Route path={INSTRUCTOR.DASHBOARD} element={<InstructorDashboard />} />
          <Route path={INSTRUCTOR.COURSES} element={<InstructorCourseList />} />
          <Route path={INSTRUCTOR.STUDENTS} element={<StudentProgressPage />} />
          <Route path={INSTRUCTOR.ASSESSMENTS} element={<QuizList />} />
          <Route path={INSTRUCTOR.CERTIFICATES} element={<CertificateVerification />} />
          <Route path={INSTRUCTOR.DISCUSSIONS} element={<Discussions />} />
          <Route path={INSTRUCTOR.NOTIFICATIONS} element={<Notifications />} />
          <Route path={INSTRUCTOR.QUIZ_RESULTS} element={<QuizResultsPage />} />
          <Route path={INSTRUCTOR.STATISTICS} element={<StatisticsPage />} />
          <Route path={INSTRUCTOR.ANALYTICS} element={<StatisticsPage />} />
          <Route path={INSTRUCTOR.SETTINGS} element={<InstructorSettings />} />

          {/* Module Top-Level Aliases */}
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
