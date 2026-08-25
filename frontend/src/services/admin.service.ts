import api from './api';
import type { ApiResponse } from '../types/api';

export interface OverviewStats {
  users: { total: number; students: number; instructors: number; admins: number };
  courses: { total: number; published: number; draft: number; pending?: number };
  enrollments: { total: number; active?: number; completed: number; completionRate: number };
  certificates?: { totalIssued: number };
  assessments?: { totalAttempts: number; passedAttempts: number; quizPassRate: number };
  actionable?: {
    pendingApplications?: any[];
    pendingApplicationsCount?: number;
    coursesAwaitingReview?: any[];
    coursesAwaitingReviewCount?: number;
    recentUsers?: any[];
    recentAuditLogs?: any[];
  };
}

export interface GrowthDataPoint { month: string; count: number }
export interface EnrollmentDataPoint { month: string; enrollments: number; completions: number }
export interface CoursePerformance {
  _id: string; title: string; level: string; instructor: { firstName: string; lastName: string };
  category: { name: string }; enrollmentCount: number; completionCount: number;
  completionRate: number; averageRating: number;
}
export interface InstructorPerformance {
  _id: string; firstName: string; lastName: string; avatar?: string; email: string;
  courseCount: number; totalEnrollments: number; totalCompletions: number; avgRating: number;
}
export interface CategoryBreakdown { _id: string; name: string; count: number; enrollments: number }

export interface AuditLogItem {
  _id: string;
  action: string;
  category: 'auth' | 'user' | 'course' | 'certificate' | 'report' | 'system';
  severity: 'info' | 'warning' | 'critical';
  performedBy?: { _id: string; firstName: string; lastName: string; email: string; avatar?: string; role: string };
  performedByName?: string;
  performedByEmail?: string;
  affectedResource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  details?: any;
  createdAt: string;
}

export const adminService = {
  getOverview: () =>
    api.get<ApiResponse<OverviewStats>>('/admin/analytics/overview'),

  getStudentGrowth: (months = 6) =>
    api.get<ApiResponse<GrowthDataPoint[]>>('/admin/analytics/growth', { params: { months } }),

  getCoursePerformance: (limit = 10) =>
    api.get<ApiResponse<CoursePerformance[]>>('/admin/analytics/courses', { params: { limit } }),

  getInstructorPerformance: (limit = 10) =>
    api.get<ApiResponse<InstructorPerformance[]>>('/admin/analytics/instructors', { params: { limit } }),

  getEnrollmentTrend: (months = 6) =>
    api.get<ApiResponse<EnrollmentDataPoint[]>>('/admin/analytics/enrollments', { params: { months } }),

  getCategoryBreakdown: () =>
    api.get<ApiResponse<CategoryBreakdown[]>>('/admin/analytics/categories'),

  getAuditLogs: (params: { page?: number; limit?: number; search?: string; category?: string; severity?: string; action?: string } = {}) =>
    api.get<ApiResponse<{ logs: AuditLogItem[] }>>('/admin/audit-logs', { params }),

  exportReport: (type: 'students' | 'courses' | 'progress', format: 'csv' | 'pdf' = 'csv') =>
    api.get(`/reports/${type}`, { params: { format }, responseType: 'blob' }),

  getSettings: () =>
    api.get<ApiResponse<any>>('/admin/settings'),

  updateSettings: (section: string, settingsData: any) =>
    api.put<ApiResponse<any>>('/admin/settings', { section, settings: settingsData }),

  getSystemHealth: () =>
    api.get<ApiResponse<any>>('/admin/health'),

  listEnrollments: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) =>
    api.get<ApiResponse<{ enrollments: any[] }>>('/admin/enrollments', { params }),

  revokeEnrollment: (id: string, reason: string) =>
    api.patch<ApiResponse<{ enrollment: any }>>(`/admin/enrollments/${id}/revoke`, { reason }),
};
