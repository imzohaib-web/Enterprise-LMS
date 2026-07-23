import React, { useState, useCallback } from 'react';
import { useQuiz, useSubmitQuiz } from '../hooks/useAssessments';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { Timer } from '../components/Timer';
import { ReviewModal } from '../components/ReviewModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { QuizEvaluationResult } from '../types';

interface TakeQuizProps {
  quizId: string;
  onSubmitted: (result: QuizEvaluationResult) => void;
  onCancel?: () => void;
}

export const TakeQuiz: React.FC<TakeQuizProps> = ({ quizId, onSubmitted, onCancel }) => {
  const { data: quiz, isLoading, isError, error } = useQuiz(quizId);
  const submitQuizMutation = useSubmitQuiz();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;

  const currentQuestion = questions[currentIndex];
  const currentSelectedOption = answersMap[currentIndex] || '';

  const handleSelectOption = (option: string) => {
    setAnswersMap((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const executeSubmission = useCallback(() => {
    if (!quiz) return;

    const formattedAnswers = questions.map((q, idx) => {
      const qId = q.id || q._id || q.question;
      return {
        questionId: qId,
        selectedOption: answersMap[idx] || '',
      };
    });

    submitQuizMutation.mutate(
      {
        quizId,
        submission: {
          answers: formattedAnswers,
          timeTakenSeconds: elapsedSeconds,
        },
      },
      {
        onSuccess: (data) => {
          onSubmitted(data);
        },
      }
    );
  }, [quiz, questions, answersMap, elapsedSeconds, quizId, submitQuizMutation, onSubmitted]);

  const handleTimeUp = useCallback(() => {
    executeSubmission();
  }, [executeSubmission]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-16 bg-white dark:bg-gray-900 border rounded-2xl" />
        <div className="h-96 bg-white dark:bg-gray-900 border rounded-2xl" />
      </div>
    );
  }

  if (isError || !quiz || totalQuestions === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-3xl text-center text-rose-700 dark:text-rose-300">
        <p>Failed to load assessment. {error?.message}</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 md:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {quiz.title}
          </h1>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-2 overflow-hidden max-w-md">
            <div
              className="bg-brand-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Timer Component */}
        <div className="flex items-center gap-3">
          <Timer
            initialMinutes={quiz.timeLimitMinutes}
            onTimeUp={handleTimeUp}
            onTick={(elapsed) => setElapsedSeconds(elapsed)}
          />

          <button
            type="button"
            onClick={() => setIsReviewOpen(true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Review ({Object.keys(answersMap).length}/{totalQuestions})
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <QuestionCard
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={totalQuestions}
            selectedOption={currentSelectedOption}
            onSelectOption={handleSelectOption}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-colors shadow-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Question Navigator (1 Col) */}
        <div className="space-y-6">
          <QuestionNavigator
            totalQuestions={totalQuestions}
            currentIndex={currentIndex}
            answersMap={answersMap}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
          />

          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-2xl transition-colors shadow-sm"
          >
            Submit Assessment
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        totalQuestions={totalQuestions}
        answersMap={answersMap}
        onClose={() => setIsReviewOpen(false)}
        onConfirmSubmit={() => {
          setIsReviewOpen(false);
          setIsConfirmOpen(true);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        isLoading={submitQuizMutation.isPending}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          executeSubmission();
        }}
      />
    </div>
  );
};
