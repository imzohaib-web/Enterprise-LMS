import api from './api';
import type { ApiResponse } from '../types/api';

export interface QuizScoreRecord {
  quizId: string;
  score: number;
  percentage: number;
  updatedAt?: string;
}

export interface CourseProgressData {
  id: string;
  studentId: string;
  courseId: string | any;
  progressPercentage: number;
  completedLessons: string[];
  completedQuizzes: string[];
  averageQuizScore?: number;
  quizScores?: QuizScoreRecord[];
  completed: boolean;
  lastActivity?: string;
  completedAt?: string;
}

export const progressService = {
  getCourseProgress: (courseId: string) =>
    api.get<ApiResponse<{ progress: CourseProgressData }>>(`/progress/course/${courseId}`),

  getStudentProgress: () =>
    api.get<ApiResponse<{ progress: CourseProgressData[] }>>('/progress/student'),

  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post<ApiResponse<{ progress: CourseProgressData }>>('/progress/lesson', { courseId, lessonId }),
};

export default progressService;
