import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import NotFound from '../pages/OtherPage/NotFound';
import ProtectedRoute from './ProtectedRoute';
import CertificateVerification from '../pages/CertificateVerification';
import { STUDENT, INSTRUCTOR, ASSESSMENTS, PROGRESS, CERTIFICATES, DISCUSSIONS, NOTIFICATIONS } from '../constants/routes';

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

import {
  CalendarPage,
  ProfilePage,
  FormElementsPage,
  BasicTablesPage,
  BlankPage,
  LineChartPage,
  BarChartPage,
  AlertsPage,
  AvatarsPage,
  BadgePage,
  ButtonsPage,
  ImagesPage,
  VideosPage,
  SignInPage,
  SignUpPage,
} from '../pages/OtherPage/PlaceholderPages';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/pages/certificate-verification" element={<CertificateVerification />} />
      <Route path="/verify/:verificationCode" element={<CertificateVerification />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute isAllowed={true} />}>
        <Route element={<AppLayout />}>
          {/* Main / Home Route - Instructor Dashboard */}
          <Route path="/" element={<InstructorDashboard />} />

          {/* Instructor Dashboard Feature Routes */}
          <Route path={INSTRUCTOR.DASHBOARD} element={<InstructorDashboard />} />
          <Route path={INSTRUCTOR.COURSES} element={<CourseList />} />
          <Route path={INSTRUCTOR.ASSESSMENTS} element={<QuizList />} />
          <Route path={INSTRUCTOR.CERTIFICATES} element={<CertificateVerification />} />
          <Route path={INSTRUCTOR.STUDENTS} element={<StudentProgressPage />} />
          <Route path={INSTRUCTOR.QUIZ_RESULTS} element={<QuizResultsPage />} />
          <Route path={INSTRUCTOR.STATISTICS} element={<StatisticsPage />} />
          <Route path={INSTRUCTOR.SETTINGS} element={<InstructorSettings />} />
          <Route path={INSTRUCTOR.DISCUSSIONS} element={<Discussions />} />
          <Route path={INSTRUCTOR.NOTIFICATIONS} element={<Notifications />} />

          {/* Student Routes */}
          <Route path={STUDENT.DASHBOARD} element={<StudentDashboard />} />
          <Route path={STUDENT.ASSESSMENTS} element={<QuizList />} />
          <Route path={`${STUDENT.ASSESSMENTS}/:id`} element={<QuizDetailsRouteWrapper />} />
          <Route path={`${STUDENT.ASSESSMENTS}/:id/take`} element={<TakeQuizRouteWrapper />} />
          <Route path={`${STUDENT.ASSESSMENTS}/:id/result`} element={<QuizResultRouteWrapper />} />
          <Route path={STUDENT.PROGRESS} element={<StudentProgress />} />
          <Route path={STUDENT.CERTIFICATES} element={<CertificateVerification />} />
          <Route path={STUDENT.DISCUSSIONS} element={<Discussions />} />
          <Route path={STUDENT.NOTIFICATIONS} element={<Notifications />} />

          {/* LMS Generic Application Routes */}
          <Route path={ASSESSMENTS} element={<QuizList />} />
          <Route path={`${ASSESSMENTS}/:id`} element={<QuizDetailsRouteWrapper />} />
          <Route path={`${ASSESSMENTS}/:id/take`} element={<TakeQuizRouteWrapper />} />
          <Route path={`${ASSESSMENTS}/:id/result`} element={<QuizResultRouteWrapper />} />
          <Route path={PROGRESS} element={<StudentProgress />} />
          <Route path={CERTIFICATES} element={<CertificateVerification />} />
          <Route path="/certificates/verify" element={<CertificateVerification />} />
          <Route path={DISCUSSIONS} element={<Discussions />} />
          <Route path={NOTIFICATIONS} element={<Notifications />} />

          {/* Sidebar Demo & Utility Routes */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/form-elements" element={<FormElementsPage />} />
          <Route path="/basic-tables" element={<BasicTablesPage />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="/error-404" element={<NotFound />} />
          <Route path="/line-chart" element={<LineChartPage />} />
          <Route path="/bar-chart" element={<BarChartPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/avatars" element={<AvatarsPage />} />
          <Route path="/badge" element={<BadgePage />} />
          <Route path="/buttons" element={<ButtonsPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
