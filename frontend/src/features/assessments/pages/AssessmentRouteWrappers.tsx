import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { QuizDetails } from './QuizDetails';
import { TakeQuiz } from './TakeQuiz';
import { QuizResult } from './QuizResult';
import { useQuizResult } from '../hooks/useAssessments';
import { QuizEvaluationResult } from '../types';

export const QuizDetailsRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <QuizDetails
      quizId={id || ''}
      onStartQuiz={(quizId) => navigate(`/student/assessments/${quizId}/take`)}
      onBack={() => navigate(-1)}
    />
  );
};

export const TakeQuizRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSubmitted = (result: QuizEvaluationResult) => {
    navigate(`/student/assessments/${id}/result`, { state: { result } });
  };

  return (
    <TakeQuiz
      quizId={id || ''}
      onSubmitted={handleSubmitted}
      onCancel={() => navigate(-1)}
    />
  );
};

export const QuizResultRouteWrapper: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const stateResult = (location.state as { result?: QuizEvaluationResult })?.result;

  // Query database for latest attempt if stateResult is absent (e.g., page refresh)
  const {
    data: fetchedResult,
    isLoading,
    isError,
    refetch,
  } = useQuizResult(stateResult ? '' : id);

  const result = stateResult || fetchedResult;

  if (isLoading && !stateResult) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 max-w-xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if ((isError || !result) && !stateResult) {
    return (
      <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-8 max-w-md mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
          ⚠️
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Assessment Result Not Found</h3>
        <p className="text-xs text-gray-500">
          No attempt record was found for this quiz. Please attempt the quiz to generate a result.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-rose-700 transition"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/student/assessments')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizResult
      result={result!}
      onBackToList={() => navigate('/student/assessments')}
    />
  );
};
