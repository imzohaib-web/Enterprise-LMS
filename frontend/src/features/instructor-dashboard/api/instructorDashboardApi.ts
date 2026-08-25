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
  InstructorAssignment,
  AssignmentSubmissionItem,
  InstructorCertificate,
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

export const createDiscussion = async (discussionData: any): Promise<DiscussionItem> => {
  const res = await axiosInstance.post('/instructor/discussions', discussionData);
  return res.data?.data;
};

export const updateDiscussion = async (id: string, discussionData: any): Promise<DiscussionItem> => {
  const res = await axiosInstance.put(`/instructor/discussions/${id}`, discussionData);
  return res.data?.data;
};

export const deleteDiscussion = async (id: string): Promise<boolean> => {
  await axiosInstance.delete(`/instructor/discussions/${id}`);
  return true;
};

export const toggleLikeDiscussion = async (id: string): Promise<DiscussionItem> => {
  const res = await axiosInstance.patch(`/instructor/discussions/${id}/status`, { toggleLike: true });
  return res.data?.data;
};

export const replyDiscussion = async (discussionId: string, content: string): Promise<DiscussionItem> => {
  const res = await axiosInstance.post(`/instructor/discussions/${discussionId}/reply`, { content });
  return res.data?.data;
};

export const updateDiscussionStatus = async (discussionId: string, statusData: any): Promise<DiscussionItem> => {
  const res = await axiosInstance.patch(`/instructor/discussions/${discussionId}/status`, statusData);
  return res.data?.data;
};

export interface SendNotificationPayload {
  courseId: string;
  recipientScope: 'all' | 'specific';
  recipientStudentIds?: string[];
  type?: string;
  title: string;
  message: string;
}

export interface SentNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  courseTitle: string;
  courseId: string;
  recipientScope: 'all' | 'specific';
  totalRecipients: number;
  recipientNames: string[];
  createdAt: string;
}

export const getInstructorNotifications = async (): Promise<NotificationItem[]> => {
  const res = await axiosInstance.get('/instructor/notifications');
  return res.data?.data || [];
};

export const getInstructorSentNotifications = async (): Promise<SentNotificationItem[]> => {
  try {
    const res = await axiosInstance.get('/instructor/notifications/sent');
    return res.data?.data || [];
  } catch {
    const res = await axiosInstance.get('/notifications/sent');
    return res.data?.data || [];
  }
};

export const sendInstructorNotification = async (
  payload: SendNotificationPayload
): Promise<{ success: boolean; message: string; count: number }> => {
  try {
    const res = await axiosInstance.post('/instructor/notifications/send', payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const res = await axiosInstance.post('/notifications/send', payload);
      return res.data;
    }
    throw err;
  }
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

// ── Assignment Management API Callers ──────────────────────────────────────────

export const getInstructorAssignments = async (): Promise<InstructorAssignment[]> => {
  const res = await axiosInstance.get('/instructor/assignments');
  return res.data?.data || [];
};

export const createInstructorAssignment = async (assignmentData: Partial<InstructorAssignment>): Promise<InstructorAssignment> => {
  const res = await axiosInstance.post('/instructor/assignments', assignmentData);
  return res.data?.data;
};

export const updateInstructorAssignment = async (id: string, assignmentData: Partial<InstructorAssignment>): Promise<InstructorAssignment> => {
  const res = await axiosInstance.put(`/instructor/assignments/${id}`, assignmentData);
  return res.data?.data;
};

export const deleteInstructorAssignment = async (id: string): Promise<boolean> => {
  await axiosInstance.delete(`/instructor/assignments/${id}`);
  return true;
};

export const getAssignmentSubmissions = async (assignmentId: string): Promise<AssignmentSubmissionItem[]> => {
  const res = await axiosInstance.get(`/instructor/assignments/${assignmentId}/submissions`);
  return res.data?.data || [];
};

export const gradeAssignmentSubmission = async (
  submissionId: string,
  gradeData: { score: number; feedback?: string }
): Promise<AssignmentSubmissionItem> => {
  const res = await axiosInstance.patch(`/instructor/submissions/${submissionId}/grade`, gradeData);
  return res.data?.data;
};

export const getInstructorCertificates = async (): Promise<InstructorCertificate[]> => {
  const res = await axiosInstance.get('/instructor/certificates');
  return res.data?.data || [];
};

export const revokeAllSessions = async (): Promise<{ message: string }> => {
  const res = await axiosInstance.post('/instructor/sessions/revoke-all');
  return res.data;
};

export const generate2FA = async (): Promise<{ secret: string; otpauthUrl: string; qrCode: string }> => {
  const res = await axiosInstance.post('/instructor/2fa/generate');
  return res.data?.data;
};

export const verify2FA = async (token: string): Promise<any> => {
  const res = await axiosInstance.post('/instructor/2fa/verify', { token });
  return res.data;
};
