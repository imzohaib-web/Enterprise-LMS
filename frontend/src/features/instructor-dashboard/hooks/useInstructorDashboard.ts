import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInstructorStats,
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getStudentProgressList,
  getQuizResultsList,
  reviewQuizAttempt,
  getInstructorActivities,
  getInstructorAnalytics,
  getEnrollmentTrends,
  getQuizPerformanceTrends,
  getInstructorDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  toggleLikeDiscussion,
  replyDiscussion,
  updateDiscussionStatus,
  getInstructorNotifications,
  getInstructorSentNotifications,
  sendInstructorNotification,
  SendNotificationPayload,
  markNotificationRead,
  markAllNotificationsRead,
  getInstructorProfile,
  updateInstructorProfile,
  updateInstructorSettings,
  getInstructorAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getInstructorAssignments,
  createInstructorAssignment,
  updateInstructorAssignment,
  deleteInstructorAssignment,
  getAssignmentSubmissions,
  gradeAssignmentSubmission,
  getInstructorCertificates,
  revokeAllSessions,
  generate2FA,
  verify2FA,
  getCourseOverviewStats,
} from '../api/instructorDashboardApi';
import { InstructorCourse, InstructorProfile, InstructorAssignment } from '../types';
import { courseService } from '../../../services/course.service';

export const useInstructorStats = () => {
  return useQuery({
    queryKey: ['instructor', 'stats'],
    queryFn: getInstructorStats,
    staleTime: 60 * 1000,
  });
};

export const useInstructorCourses = (params?: { search?: string; status?: string; category?: string }) => {
  return useQuery({
    queryKey: ['instructor', 'courses', params],
    queryFn: () => getInstructorCourses(params),
    staleTime: 60 * 1000,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseData: Partial<InstructorCourse>) => createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseData }: { id: string; courseData: Partial<InstructorCourse> }) =>
      updateCourse(id, courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useTogglePublishCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => togglePublishCourse(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useSubmitCourseForReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseService.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useCourseOverviewStats = (courseId: string) => {
  return useQuery({
    queryKey: ['instructor', 'course-overview', courseId],
    queryFn: () => getCourseOverviewStats(courseId),
    enabled: Boolean(courseId),
    staleTime: 30 * 1000,
  });
};

export const useStudentProgressList = (courseId?: string) => {
  return useQuery({
    queryKey: ['instructor', 'student-progress', courseId],
    queryFn: () => getStudentProgressList(courseId),
    staleTime: 60 * 1000,
  });
};

export const useQuizResultsList = (courseId?: string) => {
  return useQuery({
    queryKey: ['instructor', 'quiz-results', courseId],
    queryFn: () => getQuizResultsList(courseId),
    staleTime: 60 * 1000,
  });
};

export const useReviewQuizAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attemptId,
      reviewData,
    }: {
      attemptId: string;
      reviewData: { score?: number; status?: string; feedback?: string };
    }) => reviewQuizAttempt(attemptId, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quiz-results'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'student-progress'] });
    },
  });
};

export const useInstructorActivities = () => {
  return useQuery({
    queryKey: ['instructor', 'activities'],
    queryFn: getInstructorActivities,
    staleTime: 60 * 1000,
  });
};

export const useInstructorAnalytics = () => {
  return useQuery({
    queryKey: ['instructor', 'analytics'],
    queryFn: getInstructorAnalytics,
    staleTime: 60 * 1000,
  });
};

export const useEnrollmentTrends = () => {
  return useQuery({
    queryKey: ['instructor', 'enrollment-trends'],
    queryFn: getEnrollmentTrends,
    staleTime: 5 * 60 * 1000,
  });
};

export const useQuizPerformanceTrends = () => {
  return useQuery({
    queryKey: ['instructor', 'quiz-performance-trends'],
    queryFn: getQuizPerformanceTrends,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInstructorDiscussions = () => {
  return useQuery({
    queryKey: ['instructor', 'discussions'],
    queryFn: getInstructorDiscussions,
    staleTime: 30 * 1000,
  });
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discussionData: any) => createDiscussion(discussionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'discussions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'analytics'] });
    },
  });
};

export const useUpdateDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, discussionData }: { id: string; discussionData: any }) =>
      updateDiscussion(id, discussionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'discussions'] });
    },
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDiscussion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'discussions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'analytics'] });
    },
  });
};

export const useToggleLikeDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleLikeDiscussion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'discussions'] });
    },
  });
};

export const useReplyDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ discussionId, content }: { discussionId: string; content: string }) =>
      replyDiscussion(discussionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'discussions'] });
    },
  });
};

export const useUpdateDiscussionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ discussionId, statusData }: { discussionId: string; statusData: any }) =>
      updateDiscussionStatus(discussionId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'discussions'] });
    },
  });
};

export const useInstructorNotifications = () => {
  return useQuery({
    queryKey: ['instructor', 'notifications'],
    queryFn: getInstructorNotifications,
    staleTime: 30 * 1000,
  });
};

export const useInstructorSentNotifications = () => {
  return useQuery({
    queryKey: ['instructor', 'notifications', 'sent'],
    queryFn: getInstructorSentNotifications,
    staleTime: 30 * 1000,
  });
};

export const useSendInstructorNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendNotificationPayload) => sendInstructorNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'notifications'] });
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
    },
  });
};

export const useInstructorProfile = () => {
  return useQuery({
    queryKey: ['instructor', 'profile'],
    queryFn: getInstructorProfile,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateInstructorProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileData: Partial<InstructorProfile>) => updateInstructorProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'profile'] });
    },
  });
};

export const useUpdateInstructorSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settingsData: any) => updateInstructorSettings(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'profile'] });
    },
  });
};

export const useInstructorAssessments = (courseId?: string) => {
  return useQuery({
    queryKey: ['instructor', 'assessments', courseId],
    queryFn: () => getInstructorAssessments(courseId),
    staleTime: 30 * 1000,
  });
};

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentData: any) => createAssessment(assessmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assessments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assessmentData }: { id: string; assessmentData: any }) =>
      updateAssessment(id, assessmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assessments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assessments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

// ── Assignment Hooks ──────────────────────────────────────────────────────────

export const useInstructorAssignments = (courseId?: string) => {
  return useQuery({
    queryKey: ['instructor', 'assignments', courseId],
    queryFn: () => getInstructorAssignments(courseId),
    staleTime: 30 * 1000,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentData: Partial<InstructorAssignment>) => createInstructorAssignment(assignmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignmentData }: { id: string; assignmentData: Partial<InstructorAssignment> }) =>
      updateInstructorAssignment(id, assignmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments'] });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInstructorAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
    },
  });
};

export const useAssignmentSubmissions = (assignmentId: string | null) => {
  return useQuery({
    queryKey: ['instructor', 'assignment-submissions', assignmentId],
    queryFn: () => getAssignmentSubmissions(assignmentId!),
    enabled: Boolean(assignmentId),
    staleTime: 15 * 1000,
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, gradeData }: { submissionId: string; gradeData: { score: number; feedback?: string } }) =>
      gradeAssignmentSubmission(submissionId, gradeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignment-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'stats'] });
    },
  });
};

export const useInstructorCertificates = () => {
  return useQuery({
    queryKey: ['instructor', 'certificates'],
    queryFn: getInstructorCertificates,
    staleTime: 30 * 1000,
  });
};

export const useRevokeAllSessions = () => {
  return useMutation({
    mutationFn: () => revokeAllSessions(),
  });
};

export const useGenerate2FA = () => {
  return useMutation({
    mutationFn: () => generate2FA(),
  });
};

export const useVerify2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => verify2FA(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'profile'] });
    },
  });
};
