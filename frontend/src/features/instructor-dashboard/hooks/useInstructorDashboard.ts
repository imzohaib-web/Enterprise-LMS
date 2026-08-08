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
  markNotificationRead,
  markAllNotificationsRead,
  getInstructorProfile,
  updateInstructorProfile,
  updateInstructorSettings,
  getInstructorAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} from '../api/instructorDashboardApi';
import { InstructorCourse, InstructorProfile } from '../types';

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
    },
  });
};

export const useStudentProgressList = () => {
  return useQuery({
    queryKey: ['instructor', 'student-progress'],
    queryFn: getStudentProgressList,
    staleTime: 60 * 1000,
  });
};

export const useQuizResultsList = () => {
  return useQuery({
    queryKey: ['instructor', 'quiz-results'],
    queryFn: getQuizResultsList,
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

export const useInstructorAssessments = () => {
  return useQuery({
    queryKey: ['instructor', 'assessments'],
    queryFn: getInstructorAssessments,
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
