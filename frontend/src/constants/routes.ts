/**
 * Route constants for LMS frontend features.
 * Public web portal routes & Role-based app routes.
 */

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

export const STUDENT = {
  DASHBOARD: '/student/dashboard',
  COURSES: '/student/courses',
  LEARNING_PATHS: '/student/learning-paths',
  ASSESSMENTS: '/student/assessments',
  PROGRESS: '/student/progress',
  CERTIFICATES: '/student/certificates',
  DISCUSSIONS: '/student/discussions',
  NOTIFICATIONS: '/student/notifications',
  PROFILE: '/student/profile',
  SETTINGS: '/student/settings',
} as const;

export const INSTRUCTOR = {
  DASHBOARD: '/instructor/dashboard',
  COURSES: '/instructor/courses',
  STUDENTS: '/instructor/students',
  ASSESSMENTS: '/instructor/assessments',
  CERTIFICATES: '/instructor/certificates',
  DISCUSSIONS: '/instructor/discussions',
  NOTIFICATIONS: '/instructor/notifications',
  PROFILE: '/instructor/profile',
  QUIZ_RESULTS: '/instructor/quiz-results',
  STATISTICS: '/instructor/statistics',
  SETTINGS: '/instructor/settings',
} as const;

export const ADMIN = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  COURSES: '/admin/courses',
  REPORTS: '/admin/reports',
  ANALYTICS: '/admin/analytics',
  NOTIFICATIONS: '/admin/notifications',
  PROFILE: '/admin/profile',
} as const;

// Alias top-level routes
export const ASSESSMENTS = '/assessments';
export const PROGRESS = '/progress';
export const CERTIFICATES = '/certificates';
export const DISCUSSIONS = '/discussions';
export const NOTIFICATIONS = '/notifications';
