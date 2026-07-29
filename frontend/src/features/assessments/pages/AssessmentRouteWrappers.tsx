import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { QuizDetails } from './QuizDetails';
import { TakeQuiz } from './TakeQuiz';
import { QuizResult } from './QuizResult';
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
  const navigate = useNavigate();
  const location = useLocation();

  const defaultResult: QuizEvaluationResult = {
    score: 85,
    percentage: 85,
    correctAnswers: 8,
    wrongAnswers: 2,
    passed: true,
    timeTaken: '5 mins 20 secs',
  };

  const result: QuizEvaluationResult =
    (location.state as { result?: QuizEvaluationResult })?.result || defaultResult;

  return (
    <QuizResult
      result={result}
      onBackToList={() => navigate('/student/assessments')}
    />
  );
};
