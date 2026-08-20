import React from 'react';
import { PieChartIcon, TaskIcon } from '../../../icons';

interface CourseProgressTabProps {
  course: any;
  progress: any;
}

export const CourseProgressTab: React.FC<CourseProgressTabProps> = ({
  course,
  progress,
}) => {
  const sections = course?.sections || [];
  const completedLessonsSet = new Set<string>(progress?.completedLessons || []);
  const progressPct = progress?.progressPercentage || 0;
  const quizScores = progress?.quizScores || [];

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-gray-500 block">Completion Rate</span>
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
              {progressPct}%
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
            <PieChartIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-gray-500 block">Completed Lessons</span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {completedLessonsSet.size}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-gray-500 block">Average Quiz Score</span>
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
              {progress?.averageQuizScore ? `${progress.averageQuizScore}%` : 'N/A'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <TaskIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Bar Detail */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
          <span>Overall Course Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-2xs text-gray-400 pt-1">
          Last Activity:{' '}
          {progress?.lastActivity
            ? new Date(progress.lastActivity).toLocaleString()
            : 'No activity recorded yet'}
        </p>
      </div>

      {/* Quiz Attempt History */}
      {quizScores.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Assessment Scores</h4>
          <div className="space-y-2">
            {quizScores.map((qs: any, idx: number) => (
              <div
                key={idx}
                className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Quiz Attempt #{idx + 1}
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Score: {qs.percentage}% ({qs.score} pts)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Completion Breakdown */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Detailed Lesson Checklist</h4>
        {sections.map((sec: any, sIdx: number) => (
          <div key={sec._id || sIdx} className="space-y-2">
            <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Section {sIdx + 1}: {sec.title}
            </h5>
            <div className="space-y-1.5 pl-2">
              {(sec.lessons || []).map((les: any) => {
                const isDone = completedLessonsSet.has(les._id);
                return (
                  <div
                    key={les._id}
                    className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isDone
                          ? 'bg-emerald-500 text-white font-bold'
                          : 'border border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {isDone && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={isDone ? 'line-through text-gray-400' : 'font-medium'}>
                      {les.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
