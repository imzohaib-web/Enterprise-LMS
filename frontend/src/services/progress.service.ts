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

export interface DayActivity {
  date: string;
  day: string;
  minutes: number;
  formatted: string;
}

export interface WeeklyActivityData {
  period: string;
  totalMinutes: number;
  totalFormatted: string;
  activity: DayActivity[];
}

export const progressService = {
  getCourseProgress: (courseId: string) =>
    api.get<ApiResponse<{ progress: CourseProgressData }>>(`/progress/course/${courseId}`),

  getStudentProgress: () =>
    api.get<ApiResponse<{ progress: CourseProgressData[] }>>('/progress/student'),

  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post<ApiResponse<{ progress: CourseProgressData }>>('/progress/lesson', { courseId, lessonId }),

  getWeeklyActivity: () =>
    api.get<ApiResponse<{ activityData: WeeklyActivityData }>>('/progress/activity'),

  logActivity: (payload: { courseId?: string; lessonId?: string; durationMinutes?: number; type?: string }) =>
    api.post<ApiResponse<{ success: boolean }>>('/progress/activity/log', payload),
};

export default progressService;
