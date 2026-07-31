/**
 * Route constants for LMS frontend features.
 * Engineer 2 routes.
 * Do NOT include authentication or admin routes.
 */

export const STUDENT = {
  DASHBOARD: '/student/dashboard',
  ASSESSMENTS: '/student/assessments',
  PROGRESS: '/student/progress',
  CERTIFICATES: '/student/certificates',
  DISCUSSIONS: '/student/discussions',
  NOTIFICATIONS: '/student/notifications',
} as const;

export const INSTRUCTOR = {
  DASHBOARD: '/instructor/dashboard',
  COURSES: '/instructor/courses',
  ASSESSMENTS: '/instructor/assessments',
  CERTIFICATES: '/instructor/certificates',
  STUDENTS: '/instructor/students',
  SETTINGS: '/instructor/settings',
  QUIZ_RESULTS: '/instructor/quiz-results',
  STATISTICS: '/instructor/statistics',
  DISCUSSIONS: '/instructor/discussions',
  NOTIFICATIONS: '/instructor/notifications',
} as const;

export const ASSESSMENTS = '/assessments';
export const PROGRESS = '/progress';
export const CERTIFICATES = '/certificates';
export const DISCUSSIONS = '/discussions';
export const NOTIFICATIONS = '/notifications';
