import api from './api';
import type { ApiResponse } from '../types/api';
import type {
  Course, Category, Enrollment,
  CreateCoursePayload, CreateSectionPayload, CreateLessonPayload,
  Section, Lesson, UploadResult,
} from '../types/course';

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  category?: string;
  status?: string;
  instructor?: string;
  isFree?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const courseService = {
  // ── Courses ────────────────────────────────────────────────────────────
  listCourses: (params: ListCoursesParams = {}) =>
    api.get<ApiResponse<{ courses: Course[] }>>('/courses', { params }),

  getCourseById: (id: string) =>
    api.get<ApiResponse<{ course: Course }>>(`/courses/${id}`),

  getCourseBySlug: (slug: string) =>
    api.get<ApiResponse<{ course: Course }>>(`/courses/slug/${slug}`),

  createCourse: (payload: CreateCoursePayload) =>
    api.post<ApiResponse<{ course: Course }>>('/courses', payload),

  updateCourse: (id: string, payload: Partial<CreateCoursePayload & { status: string }>) =>
    api.put<ApiResponse<{ course: Course }>>(`/courses/${id}`, payload),

  deleteCourse: (id: string) =>
    api.delete(`/courses/${id}`),

  uploadThumbnail: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('thumbnail', file);
    return api.post<ApiResponse<{ course: Course; thumbnailUrl: string }>>(`/courses/${id}/thumbnail`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  enrollInCourse: (id: string, enrollmentData?: { phone?: string; learningGoals?: string; agreedTerms?: boolean }) =>
    api.post<ApiResponse<{ enrollment: Enrollment }>>(`/courses/${id}/enroll`, enrollmentData),

  getMyEnrollments: (params: { page?: number; limit?: number } = {}) =>
    api.get<ApiResponse<{ enrollments: Enrollment[] }>>('/courses/enrolled', { params }),

  // ── Course Lifecycle & Moderation ──────────────────────────────────────
  submitForReview: (id: string) =>
    api.post<ApiResponse<{ course: Course }>>(`/courses/${id}/submit`),

  approveCourse: (id: string) =>
    api.patch<ApiResponse<{ course: Course }>>(`/courses/${id}/approve`),

  rejectCourse: (id: string, rejectionReason: string) =>
    api.patch<ApiResponse<{ course: Course }>>(`/courses/${id}/reject`, { rejectionReason }),

  // ── Categories ─────────────────────────────────────────────────────────
  listCategories: () =>
    api.get<ApiResponse<{ categories: Category[] }>>('/courses/categories'),

  createCategory: (data: { name: string; description?: string }) =>
    api.post<ApiResponse<{ category: Category }>>('/courses/categories', data),

  // ── Sections ───────────────────────────────────────────────────────────
  listSections: (courseId: string) =>
    api.get<ApiResponse<{ sections: Section[] }>>(`/courses/${courseId}/sections`),

  addSection: (courseId: string, payload: CreateSectionPayload) =>
    api.post<ApiResponse<{ section: Section }>>(`/courses/${courseId}/sections`, payload),

  updateSection: (courseId: string, sectionId: string, payload: Partial<CreateSectionPayload>) =>
    api.put<ApiResponse<{ section: Section }>>(`/courses/${courseId}/sections/${sectionId}`, payload),

  deleteSection: (courseId: string, sectionId: string) =>
    api.delete(`/courses/${courseId}/sections/${sectionId}`),

  // ── Lessons ────────────────────────────────────────────────────────────
  addLesson: (courseId: string, sectionId: string, payload: CreateLessonPayload) =>
    api.post<ApiResponse<{ lesson: Lesson }>>(`/courses/${courseId}/sections/${sectionId}/lessons`, payload),

  updateLesson: (courseId: string, sectionId: string, lessonId: string, payload: Partial<CreateLessonPayload>) =>
    api.put<ApiResponse<{ lesson: Lesson }>>(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, payload),

  deleteLesson: (courseId: string, sectionId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`),

  // ── File uploads ───────────────────────────────────────────────────────
  uploadVideo: (file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData();
    fd.append('video', file);
    return api.post<ApiResponse<UploadResult>>('/courses/upload/video', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },

  uploadDocument: (file: File) => {
    const fd = new FormData();
    fd.append('document', file);
    return api.post<ApiResponse<UploadResult>>('/courses/upload/document', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadResource: (file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData();
    fd.append('resource', file);
    return api.post<ApiResponse<{ name: string; url: string; publicId: string; size: number; type: string }>>('/courses/upload/resource', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },
};
