import api from './api';
import type { ApiResponse } from '../types/api';
import type { LearningPath, CreateLearningPathPayload } from '../types/learningPath';

export const learningPathService = {
  listLearningPaths: (params: { page?: number; limit?: number; level?: string; search?: string } = {}) =>
    api.get<ApiResponse<{ paths: LearningPath[] }>>('/learning-paths', { params }),

  getLearningPathById: (id: string) =>
    api.get<ApiResponse<{ path: LearningPath }>>(`/learning-paths/${id}`),

  createLearningPath: (payload: CreateLearningPathPayload) =>
    api.post<ApiResponse<{ path: LearningPath }>>('/learning-paths', payload),

  updateLearningPath: (id: string, payload: Partial<CreateLearningPathPayload>) =>
    api.put<ApiResponse<{ path: LearningPath }>>(`/learning-paths/${id}`, payload),

  deleteLearningPath: (id: string) =>
    api.delete(`/learning-paths/${id}`),

  enrollInLearningPath: (id: string) =>
    api.post(`/learning-paths/${id}/enroll`),
};
