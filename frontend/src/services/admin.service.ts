import api from './api';
import type { ApiResponse } from '../types/api';

export interface OverviewStats {
  users: { total: number; students: number; instructors: number; admins: number };
  courses: { total: number; published: number; draft: number };
  enrollments: { total: number; completed: number; completionRate: number };
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

  exportReport: (type: 'students' | 'courses' | 'progress', format: 'csv' | 'pdf' = 'csv') =>
    api.get(`/reports/${type}`, { params: { format }, responseType: 'blob' }),
};
