/**
 * Route constants for LMS frontend features.
 * Placeholders for Engineer 2 routes.
 * Do NOT include authentication, admin, or course routes.
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
  ASSESSMENTS: '/instructor/assessments',
  DISCUSSIONS: '/instructor/discussions',
  NOTIFICATIONS: '/instructor/notifications',
} as const;

export const ASSESSMENTS = '/assessments';
export const PROGRESS = '/progress';
export const CERTIFICATES = '/certificates';
export const DISCUSSIONS = '/discussions';
export const NOTIFICATIONS = '/notifications';
