/**
 * Route constants for LMS frontend features.
 * Engineer 1: admin, courses, learning paths
 * Engineer 2: student, instructor sub-routes
 */

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH = {
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
} as const;

// ── Admin (Engineer 1) ────────────────────────────────────────────────────────
export const ADMIN = {
  DASHBOARD:  '/admin/dashboard',
  USERS:      '/admin/users',
  REPORTS:    '/admin/reports',
} as const;

// ── Courses (Engineer 1) ──────────────────────────────────────────────────────
export const COURSES = {
  LIST:    '/courses',
  NEW:     '/courses/new',
  DETAIL:  (id: string) => `/courses/${id}`,
  BUILDER: (id: string) => `/courses/${id}/builder`,
} as const;

// ── Learning Paths (Engineer 1) ───────────────────────────────────────────────
export const LEARNING_PATHS = {
  LIST:   '/learning-paths',
  NEW:    '/learning-paths/new',
  DETAIL: (id: string) => `/learning-paths/${id}`,
} as const;

// ── Instructor dashboard (Engineer 1 shell, Engineer 2 fills in) ──────────────
export const INSTRUCTOR_DASH = '/instructor/dashboard';

// ── Engineer 2 student routes ─────────────────────────────────────────────────
export const STUDENT = {
  DASHBOARD:     '/student/dashboard',
  ASSESSMENTS:   '/student/assessments',
  PROGRESS:      '/student/progress',
  CERTIFICATES:  '/student/certificates',
  DISCUSSIONS:   '/student/discussions',
  NOTIFICATIONS: '/student/notifications',
} as const;

// ── Engineer 2 instructor routes ──────────────────────────────────────────────
export const INSTRUCTOR = {
  DASHBOARD:     '/instructor/dashboard',
  ASSESSMENTS:   '/instructor/assessments',
  DISCUSSIONS:   '/instructor/discussions',
  NOTIFICATIONS: '/instructor/notifications',
} as const;

export const ASSESSMENTS   = '/assessments';
export const PROGRESS      = '/progress';
export const CERTIFICATES  = '/certificates';
export const DISCUSSIONS   = '/discussions';
export const NOTIFICATIONS = '/notifications';
