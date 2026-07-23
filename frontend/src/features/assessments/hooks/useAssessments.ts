import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
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
  return useMutation({
    mutationFn: ({ quizId, submission }) => assessmentApi.submitQuiz(quizId, submission),
  });
};
