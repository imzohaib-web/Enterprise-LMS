import { useQuery } from '@tanstack/react-query';
import {
  getInstructorStats,
  getInstructorCourses,
  getStudentProgressList,
  getQuizResultsList,
  getInstructorActivities,
  getEnrollmentTrends,
  getQuizPerformanceTrends,
} from '../api/instructorDashboardApi';

export const useInstructorStats = () => {
  return useQuery({
    queryKey: ['instructor', 'stats'],
    queryFn: getInstructorStats,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInstructorCourses = () => {
  return useQuery({
    queryKey: ['instructor', 'courses'],
    queryFn: getInstructorCourses,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentProgressList = () => {
  return useQuery({
    queryKey: ['instructor', 'student-progress'],
    queryFn: getStudentProgressList,
    staleTime: 5 * 60 * 1000,
  });
};

export const useQuizResultsList = () => {
  return useQuery({
    queryKey: ['instructor', 'quiz-results'],
    queryFn: getQuizResultsList,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInstructorActivities = () => {
  return useQuery({
    queryKey: ['instructor', 'activities'],
    queryFn: getInstructorActivities,
    staleTime: 2 * 60 * 1000,
  });
};

export const useEnrollmentTrends = () => {
  return useQuery({
    queryKey: ['instructor', 'enrollment-trends'],
    queryFn: getEnrollmentTrends,
    staleTime: 10 * 60 * 1000,
  });
};

export const useQuizPerformanceTrends = () => {
  return useQuery({
    queryKey: ['instructor', 'quiz-performance-trends'],
    queryFn: getQuizPerformanceTrends,
    staleTime: 10 * 60 * 1000,
  });
};
