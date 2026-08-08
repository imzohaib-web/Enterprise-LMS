import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { assessmentApi } from '../api/assessmentApi';
import { Quiz, QuizSubmissionInput, QuizEvaluationResult } from '../types';

export const useQuizzes = (courseId?: string): UseQueryResult<Quiz[], Error> => {
  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => assessmentApi.getQuizzes(courseId),
  });
};

export const useQuiz = (id: string): UseQueryResult<Quiz, Error> => {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => assessmentApi.getQuizById(id),
    enabled: Boolean(id),
  });
};

export const useSubmitQuiz = (): UseMutationResult<
  QuizEvaluationResult,
  Error,
  { quizId: string; submission: QuizSubmissionInput }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, submission }) => assessmentApi.submitQuiz(quizId, submission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useQuizResult = (quizId: string): UseQueryResult<QuizEvaluationResult, Error> => {
  return useQuery({
    queryKey: ['quizResult', quizId],
    queryFn: () => assessmentApi.getQuizResult(quizId),
    enabled: Boolean(quizId),
  });
};
