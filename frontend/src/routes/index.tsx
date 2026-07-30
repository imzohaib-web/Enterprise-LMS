import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import Home from '../pages/Dashboard/Home';
import NotFound from '../pages/OtherPage/NotFound';
import ProtectedRoute from './ProtectedRoute';
import CertificateVerification from '../pages/CertificateVerification';
import LMSPlaceholderPage from '../components/common/LMSPlaceholderPage';
import {
  STUDENT,
  INSTRUCTOR,
  ADMIN,
  ASSESSMENTS,
  PROGRESS,
  CERTIFICATES,
  DISCUSSIONS,
  NOTIFICATIONS,
} from '../constants/routes';

import StudentDashboard from '../features/student-dashboard/pages/StudentDashboard';
import {
  InstructorDashboard,
  CourseList,
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

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/pages/certificate-verification" element={<CertificateVerification />} />
      <Route path="/verify/:verificationCode" element={<CertificateVerification />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute isAllowed={true} />}>
        <Route element={<AppLayout />}>
          {/* Main / Home Route */}
          <Route path="/" element={<Home />} />

          {/* Student Feature Routes */}
          <Route path={STUDENT.DASHBOARD} element={<StudentDashboard />} />
          <Route
            path={STUDENT.COURSES}
            element={
              <LMSPlaceholderPage
                title="My Courses"
                description="View your active enrolled courses, syllabus progress, and course materials."
                category="Student Module"
              />
            }
          />
          <Route
            path={STUDENT.LEARNING_PATHS}
            element={
              <LMSPlaceholderPage
                title="Learning Paths"
                description="Explore structured skill tracks, career roadmaps, and competency certifications."
                category="Student Module"
              />
            }
          />
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
          <Route path={INSTRUCTOR.COURSES} element={<CourseList />} />
          <Route path={INSTRUCTOR.STUDENTS} element={<StudentProgressPage />} />
          <Route path={INSTRUCTOR.ASSESSMENTS} element={<QuizList />} />
          <Route path={INSTRUCTOR.CERTIFICATES} element={<CertificateVerification />} />
          <Route path={INSTRUCTOR.DISCUSSIONS} element={<Discussions />} />
          <Route path={INSTRUCTOR.NOTIFICATIONS} element={<Notifications />} />
          <Route
            path={INSTRUCTOR.PROFILE}
            element={
              <LMSPlaceholderPage
                title="Instructor Profile"
                description="Manage your instructor biography, qualifications, and teaching schedule."
                category="Instructor Module"
              />
            }
          />
          <Route path={INSTRUCTOR.QUIZ_RESULTS} element={<QuizResultsPage />} />
          <Route path={INSTRUCTOR.STATISTICS} element={<StatisticsPage />} />
          <Route path={INSTRUCTOR.SETTINGS} element={<InstructorSettings />} />

          {/* Admin Feature Routes (Engineer 1 Scope Placeholders) */}
          <Route
            path={ADMIN.DASHBOARD}
            element={
              <LMSPlaceholderPage
                title="Admin Dashboard"
                description="Platform administration, system metrics, and governance control panel."
                category="Admin Module"
              />
            }
          />
          <Route
            path={ADMIN.USERS}
            element={
              <LMSPlaceholderPage
                title="User Management"
                description="Manage user accounts, roles, access permissions, and directory integration."
                category="Admin Module"
              />
            }
          />
          <Route
            path={ADMIN.COURSES}
            element={
              <LMSPlaceholderPage
                title="Course Management"
                description="Platform-wide course oversight, approval workflows, and catalog publishing."
                category="Admin Module"
              />
            }
          />
          <Route
            path={ADMIN.REPORTS}
            element={
              <LMSPlaceholderPage
                title="System Reports"
                description="Generate compliance audit reports, course completion statistics, and user metrics."
                category="Admin Module"
              />
            }
          />
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
          <Route
            path={ADMIN.PROFILE}
            element={
              <LMSPlaceholderPage
                title="Admin Profile"
                description="Manage administrator profile, security keys, and system audit logs."
                category="Admin Module"
              />
            }
          />

          {/* Generic Top-Level Alias Routes */}
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
