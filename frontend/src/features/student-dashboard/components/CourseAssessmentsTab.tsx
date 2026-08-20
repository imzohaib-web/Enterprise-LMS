import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizzes } from '../../assessments/hooks/useAssessments';
import { QuizCard } from '../../assessments/components/QuizCard';
import { QuizSkeleton } from '../../assessments/components/QuizSkeleton';
import { TaskIcon } from '../../../icons';

interface CourseAssessmentsTabProps {
  courseId: string;
  courseTitle: string;
}

export const CourseAssessmentsTab: React.FC<CourseAssessmentsTabProps> = ({
  courseId,
  courseTitle,
}) => {
  const navigate = useNavigate();
  const { data: quizzes = [], isLoading, isError, error, refetch } = useQuizzes(courseId);

  const handleSelectQuiz = (quizId: string) => {
    navigate(`/student/courses/${courseId}/assessments/${quizId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {courseTitle} — Assessments
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Quizzes and knowledge evaluations specific to this course.
          </p>
        </div>
        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl">
          {quizzes.length} {quizzes.length === 1 ? 'Assessment' : 'Assessments'} Available
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <QuizSkeleton count={3} />}

      {/* Error State */}
      {isError && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-3">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
            Failed to load course assessments. {(error as any)?.message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quizzes List */}
      {!isLoading && !isError && (
        <>
          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id || quiz._id}
                  quiz={quiz}
                  onSelect={handleSelectQuiz}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400 space-y-2">
              <TaskIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                No assessments available for this course yet.
              </p>
              <p className="text-xs text-gray-500">
                Your instructor will post quizzes and tests as you progress through the modules.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
