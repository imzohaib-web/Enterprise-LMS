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
export const getCourseLearnRoute = (id: string) => `/student/courses/${id}/overview`;
export const getCourseDetailRoute = (id: string) => `/student/courses/${id}/overview`;

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
export const getStudentCourseRoute = (courseId: string, tab: string = 'overview') =>
  `/student/courses/${courseId}/${tab}`;

export const STUDENT = {
  DASHBOARD:          '/student/dashboard',
  COURSES:            '/student/courses',
  COURSE_LEARN:       (courseId: string) => `/student/courses/${courseId}`,
  COURSE_OVERVIEW:    (courseId: string) => `/student/courses/${courseId}/overview`,
  COURSE_CONTENT:     (courseId: string) => `/student/courses/${courseId}/content`,
  COURSE_ASSESSMENTS: (courseId: string) => `/student/courses/${courseId}/assessments`,
  COURSE_ASSIGNMENTS: (courseId: string) => `/student/courses/${courseId}/assignments`,
  COURSE_PROGRESS:    (courseId: string) => `/student/courses/${courseId}/progress`,
  COURSE_CERTIFICATE: (courseId: string) => `/student/courses/${courseId}/certificate`,
  LEARNING_PATHS:     '/student/learning-paths',
  ASSESSMENTS:        '/student/assessments',
  PROGRESS:           '/student/progress',
  CERTIFICATES:       '/student/certificates',
  DISCUSSIONS:        '/student/discussions',
  NOTIFICATIONS:      '/student/notifications',
  PROFILE:            '/student/profile',
  SETTINGS:           '/student/settings',
} as const;

// ── Instructor Course Management Route Helper ─────────────────────────────
export const getInstructorCourseRoute = (courseId: string, tab: string = 'overview') =>
  `/instructor/courses/${courseId}/${tab}`;

// ── Instructor Routes ─────────────────────────────────────────────────────────
export const INSTRUCTOR = {
  DASHBOARD:     '/instructor/dashboard',
  COURSES:       '/instructor/courses',
  COURSE_MANAGE: (courseId: string) => `/instructor/courses/${courseId}`,
  COURSE_OVERVIEW: (courseId: string) => `/instructor/courses/${courseId}/overview`,
  COURSE_CONTENT: (courseId: string) => `/instructor/courses/${courseId}/content`,
  COURSE_SECTIONS: (courseId: string) => `/instructor/courses/${courseId}/sections`,
  COURSE_LESSONS: (courseId: string) => `/instructor/courses/${courseId}/lessons`,
  COURSE_ASSESSMENTS: (courseId: string) => `/instructor/courses/${courseId}/assessments`,
  COURSE_ASSIGNMENTS: (courseId: string) => `/instructor/courses/${courseId}/assignments`,
  COURSE_QUIZZES: (courseId: string) => `/instructor/courses/${courseId}/quizzes`,
  COURSE_STUDENTS: (courseId: string) => `/instructor/courses/${courseId}/students`,
  COURSE_PROGRESS: (courseId: string) => `/instructor/courses/${courseId}/progress`,
  COURSE_SETTINGS: (courseId: string) => `/instructor/courses/${courseId}/settings`,
  LEARNING_PATHS: '/instructor/learning-paths',
  STUDENTS:      '/instructor/students',
  ASSESSMENTS:   '/instructor/assessments',
  ASSIGNMENTS:   '/instructor/assignments',
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
