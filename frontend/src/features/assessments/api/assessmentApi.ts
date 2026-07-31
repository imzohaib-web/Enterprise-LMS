import axiosInstance from '../../../api/axiosInstance';
import { Quiz, QuizSubmissionInput, QuizEvaluationResult, ApiResponse } from '../types';

export const assessmentApi = {
  getQuizzes: async (courseId?: string): Promise<Quiz[]> => {
    const params = courseId ? { courseId } : {};
    const response = await axiosInstance.get<ApiResponse<Quiz[]>>('/assessments', { params });
    return response.data.data;
  },

  getQuizById: async (id: string): Promise<Quiz> => {
    const response = await axiosInstance.get<ApiResponse<Quiz>>(`/assessments/${id}`);
    return response.data.data;
  },

  submitQuiz: async (quizId: string, submission: QuizSubmissionInput): Promise<QuizEvaluationResult> => {
    const response = await axiosInstance.post<ApiResponse<QuizEvaluationResult>>(
      `/assessments/${quizId}/submit`,
      submission
    );
    return response.data.data;
  },
};
