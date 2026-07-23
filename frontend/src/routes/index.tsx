import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import NotFound from '../pages/OtherPage/NotFound';
import AuthGuard from '../components/auth/AuthGuard';

// ── Auth pages (no lazy for critical path) ────────────────────────────────────
import SignIn from '../pages/Auth/SignIn';
import SignUp from '../pages/Auth/SignUp';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Home            = lazy(() => import('../pages/Dashboard/Home'));
const AdminDashboard  = lazy(() => import('../pages/Admin/Dashboard'));
const AdminUsers      = lazy(() => import('../pages/Admin/Users'));
const AdminReports    = lazy(() => import('../pages/Admin/Reports'));
const CourseList      = lazy(() => import('../pages/Courses/CourseList'));
const CourseBuilder   = lazy(() => import('../pages/Courses/CourseBuilder'));
const LearningPathList = lazy(() => import('../pages/LearningPaths/LearningPathList'));

const Loader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Public Auth Routes ─────────────────────────────────────────── */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* ── Protected Routes (all authenticated users) ────────────────── */}
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* ── Admin routes ─────────────────────────────────────────────── */}
        <Route path="admin" element={<AuthGuard allowedRoles={['admin']}><Suspense fallback={<Loader />}><AdminDashboard /></Suspense></AuthGuard>} />
        <Route path="admin/dashboard" element={<AuthGuard allowedRoles={['admin']}><Suspense fallback={<Loader />}><AdminDashboard /></Suspense></AuthGuard>} />
        <Route path="admin/users"     element={<AuthGuard allowedRoles={['admin']}><Suspense fallback={<Loader />}><AdminUsers /></Suspense></AuthGuard>} />
        <Route path="admin/reports"   element={<AuthGuard allowedRoles={['admin']}><Suspense fallback={<Loader />}><AdminReports /></Suspense></AuthGuard>} />

        {/* ── Courses ──────────────────────────────────────────────────── */}
        <Route path="courses" element={<Suspense fallback={<Loader />}><CourseList /></Suspense>} />
        <Route path="courses/new" element={<AuthGuard allowedRoles={['admin', 'instructor']}><Suspense fallback={<Loader />}><CourseBuilder /></Suspense></AuthGuard>} />
        <Route path="courses/:id/builder" element={<AuthGuard allowedRoles={['admin', 'instructor']}><Suspense fallback={<Loader />}><CourseBuilder /></Suspense></AuthGuard>} />

        {/* ── Learning Paths ────────────────────────────────────────────── */}
        <Route path="learning-paths" element={<Suspense fallback={<Loader />}><LearningPathList /></Suspense>} />

        {/* ── Legacy home ──────────────────────────────────────────────── */}
        <Route path="home" element={<Suspense fallback={<Loader />}><Home /></Suspense>} />

        {/* ── Engineer 2 routes (placeholder – Engineer 2 fills these in) ─ */}
        <Route path="student/*" element={<div className="p-8 text-gray-500">Student module (Engineer 2)</div>} />
        <Route path="instructor/*" element={<div className="p-8 text-gray-500">Instructor module (Engineer 2)</div>} />
      </Route>

      {/* ── 404 ──────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
