/**
 * Route constants for LMS frontend features.
 * Public web portal routes & Role-based app routes.
 */

// ── Public Portal ─────────────────────────────────────────────────────────────
export const PUBLIC = {
  HOME: '/',
  COURSES: '/courses',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  VERIFY_CODE: '/verify/:code',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH = {
  SIGN_IN: '/login',
  SIGN_UP: '/register',
} as const;

// ── Admin ──────────────────────────────────────────────────────────────────────
export const ADMIN = {
  DASHBOARD:  '/admin/dashboard',
  USERS:      '/admin/users',
  COURSES:    '/admin/courses',
  REPORTS:    '/admin/reports',
  ANALYTICS:  '/admin/analytics',
  AUDIT_LOGS: '/admin/audit-logs',
  SETTINGS:   '/admin/settings',
  NOTIFICATIONS: '/admin/notifications',
  PROFILE:    '/admin/profile',
} as const;

// ── Courses ───────────────────────────────────────────────────────────────────
export const getCourseLearnRoute = (id: string) => `/courses/${id}/learn`;
export const getCourseDetailRoute = (id: string) => `/courses/${id}`;

export const COURSES = {
  LIST:    '/courses',
  NEW:     '/courses/new',
  DETAIL:  (id: string) => `/courses/${id}`,
  LEARN:   (id: string) => `/courses/${id}/learn`,
  BUILDER: (id: string) => `/courses/${id}/builder`,
} as const;



// ── Learning Paths ────────────────────────────────────────────────────────────
export const LEARNING_PATHS = {
  LIST:   '/learning-paths',
  NEW:    '/learning-paths/new',
  DETAIL: (id: string) => `/learning-paths/${id}`,
} as const;

// ── Instructor Dashboard Alias ────────────────────────────────────────────────
export const INSTRUCTOR_DASH = '/instructor/dashboard';

// ── Student Routes ────────────────────────────────────────────────────────────
export const STUDENT = {
  DASHBOARD:      '/student/dashboard',
  COURSES:        '/student/courses',
  LEARNING_PATHS: '/student/learning-paths',
  ASSESSMENTS:    '/student/assessments',
  PROGRESS:       '/student/progress',
  CERTIFICATES:   '/student/certificates',
  DISCUSSIONS:    '/student/discussions',
  NOTIFICATIONS:  '/student/notifications',
  PROFILE:        '/student/profile',
  SETTINGS:       '/student/settings',
} as const;

// ── Instructor Routes ─────────────────────────────────────────────────────────
export const INSTRUCTOR = {
  DASHBOARD:     '/instructor/dashboard',
  COURSES:       '/instructor/courses',
  STUDENTS:      '/instructor/students',
  ASSESSMENTS:   '/instructor/assessments',
  CERTIFICATES:  '/instructor/certificates',
  DISCUSSIONS:   '/instructor/discussions',
  NOTIFICATIONS: '/instructor/notifications',
  PROFILE:       '/instructor/profile',
  QUIZ_RESULTS:  '/instructor/quiz-results',
  STATISTICS:    '/instructor/statistics',
  ANALYTICS:     '/instructor/statistics',
  SETTINGS:      '/instructor/settings',
} as const;

// ── Module Top-Level Aliases ──────────────────────────────────────────────────
export const ASSESSMENTS   = '/assessments';
export const PROGRESS      = '/progress';
export const CERTIFICATES  = '/certificates';
export const DISCUSSIONS   = '/discussions';
export const NOTIFICATIONS = '/notifications';
