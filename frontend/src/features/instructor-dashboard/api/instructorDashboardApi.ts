import axiosInstance from '../../../api/axiosInstance';
import {
  InstructorStats,
  InstructorCourse,
  StudentProgressItem,
  QuizResultItem,
  ActivityItem,
  EnrollmentTrend,
  QuizPerformanceTrend,
  InstructorProfile,
  DiscussionItem,
  NotificationItem,
} from '../types';

export const getInstructorStats = async (): Promise<InstructorStats> => {
  const res = await axiosInstance.get('/instructor/dashboard/stats');
  return res.data?.data;
};

export const getInstructorCourses = async (params?: {
  search?: string;
  status?: string;
  category?: string;
}): Promise<InstructorCourse[]> => {
  const res = await axiosInstance.get('/instructor/courses', { params });
  return res.data?.data || [];
};

export const createCourse = async (courseData: Partial<InstructorCourse>): Promise<InstructorCourse> => {
  const res = await axiosInstance.post('/instructor/courses', courseData);
  return res.data?.data;
};

export const getCourseById = async (id: string): Promise<InstructorCourse> => {
  const res = await axiosInstance.get(`/instructor/courses/${id}`);
  return res.data?.data;
};

export const updateCourse = async (id: string, courseData: Partial<InstructorCourse>): Promise<InstructorCourse> => {
  const res = await axiosInstance.put(`/instructor/courses/${id}`, courseData);
  return res.data?.data;
};

export const deleteCourse = async (id: string): Promise<boolean> => {
  await axiosInstance.delete(`/instructor/courses/${id}`);
  return true;
};

export const togglePublishCourse = async (id: string, status: string): Promise<InstructorCourse> => {
  const res = await axiosInstance.patch(`/instructor/courses/${id}/publish`, { status });
  return res.data?.data;
};

export const getStudentProgressList = async (): Promise<StudentProgressItem[]> => {
  const res = await axiosInstance.get('/instructor/students/progress');
  return res.data?.data || [];
};

export const getInstructorAssessments = async (): Promise<any[]> => {
  const res = await axiosInstance.get('/instructor/assessments');
  return res.data?.data || [];
};

export const createAssessment = async (assessmentData: any): Promise<any> => {
  const res = await axiosInstance.post('/instructor/assessments', assessmentData);
  return res.data?.data;
};

export const updateAssessment = async (id: string, assessmentData: any): Promise<any> => {
  const res = await axiosInstance.put(`/instructor/assessments/${id}`, assessmentData);
  return res.data?.data;
};

export const deleteAssessment = async (id: string): Promise<boolean> => {
  await axiosInstance.delete(`/instructor/assessments/${id}`);
  return true;
};

export const getQuizResultsList = async (): Promise<QuizResultItem[]> => {
  const res = await axiosInstance.get('/instructor/quiz-results');
  return res.data?.data || [];
};

export const reviewQuizAttempt = async (
  attemptId: string,
  reviewData: { score?: number; status?: string; feedback?: string }
): Promise<any> => {
  const res = await axiosInstance.patch(`/instructor/quiz-results/${attemptId}/review`, reviewData);
  return res.data?.data;
};

export const getInstructorActivities = async (): Promise<ActivityItem[]> => {
  const res = await axiosInstance.get('/instructor/activities');
  return res.data?.data?.recentActivity || [];
};

export const getInstructorAnalytics = async (): Promise<any> => {
  const res = await axiosInstance.get('/instructor/analytics');
  return res.data?.data;
};

export const getEnrollmentTrends = async (): Promise<EnrollmentTrend[]> => {
  const res = await axiosInstance.get('/instructor/trends/enrollments');
  return res.data?.data || [];
};

export const getQuizPerformanceTrends = async (): Promise<QuizPerformanceTrend[]> => {
  const res = await axiosInstance.get('/instructor/trends/quiz-performance');
  return res.data?.data || [];
};

export const getInstructorDiscussions = async (): Promise<DiscussionItem[]> => {
  const res = await axiosInstance.get('/instructor/discussions');
  return res.data?.data || [];
};

export const replyDiscussion = async (discussionId: string, content: string): Promise<DiscussionItem> => {
  const res = await axiosInstance.post(`/instructor/discussions/${discussionId}/reply`, { content });
  return res.data?.data;
};

export const updateDiscussionStatus = async (discussionId: string, statusData: any): Promise<DiscussionItem> => {
  const res = await axiosInstance.patch(`/instructor/discussions/${discussionId}/status`, statusData);
  return res.data?.data;
};

export const getInstructorNotifications = async (): Promise<NotificationItem[]> => {
  const res = await axiosInstance.get('/instructor/notifications');
  return res.data?.data || [];
};

export const markNotificationRead = async (id: string): Promise<boolean> => {
  await axiosInstance.patch(`/instructor/notifications/${id}/read`);
  return true;
};

export const markAllNotificationsRead = async (): Promise<boolean> => {
  await axiosInstance.patch('/instructor/notifications/read-all');
  return true;
};

export const getInstructorProfile = async (): Promise<InstructorProfile> => {
  const res = await axiosInstance.get('/instructor/profile');
  return res.data?.data;
};

export const updateInstructorProfile = async (profileData: Partial<InstructorProfile>): Promise<InstructorProfile> => {
  const res = await axiosInstance.put('/instructor/profile', profileData);
  return res.data?.data;
};

export const updateInstructorSettings = async (settingsData: any): Promise<any> => {
  const res = await axiosInstance.put('/instructor/settings', settingsData);
  return res.data?.data;
};

export const uploadImage = async (fileOrUrl: string): Promise<string> => {
  const res = await axiosInstance.post('/instructor/upload', { url: fileOrUrl });
  return res.data?.data?.url || fileOrUrl;
};
