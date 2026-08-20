import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageIcon,
  VideoIcon,
  FileIcon,
  TaskIcon,
  ArrowRightIcon,
} from '../../../icons';

interface CourseContentTabProps {
  course: any;
  progress: any;
}

export const CourseContentTab: React.FC<CourseContentTabProps> = ({
  course,
  progress,
}) => {
  const navigate = useNavigate();
  const sections = course?.sections || [];
  const completedSet = new Set<string>(progress?.completedLessons || []);

  const handleLaunchPlayer = (lessonId?: string) => {
    const courseId = course?._id || course?.id;
    if (lessonId) {
      navigate(`/courses/${courseId}/learn?lessonId=${lessonId}`);
    } else {
      navigate(`/courses/${courseId}/learn`);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoIcon className="w-4 h-4 text-blue-500" />;
      case 'document':
      case 'text':
        return <FileIcon className="w-4 h-4 text-emerald-500" />;
      case 'assignment':
      case 'quiz':
        return <TaskIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <PageIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Course Syllabus & Lessons</h3>
          <p className="text-xs text-gray-500 mt-1">
            Access lessons, documents, videos, and exercises for {course?.title}.
          </p>
        </div>
        <button
          onClick={() => handleLaunchPlayer()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span>Open Full Screen Player</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Sections & Lessons */}
      {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section: any, sIdx: number) => (
            <div
              key={section._id || sIdx}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Section {sIdx + 1}: {section.title}
                  </h4>
                  <p className="text-2xs text-gray-500 mt-0.5">
                    {section.lessons?.length || 0} Lessons
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {(section.lessons || []).map((lesson: any, lIdx: number) => {
                  const isCompleted = completedSet.has(lesson._id);
                  return (
                    <div
                      key={lesson._id || lIdx}
                      onClick={() => handleLaunchPlayer(lesson._id)}
                      className="p-4 flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            getLessonIcon(lesson.type)
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate block">
                            {sIdx + 1}.{lIdx + 1} {lesson.title}
                          </span>
                          <span className="text-2xs text-gray-400 capitalize">
                            {lesson.type || 'lesson'} {lesson.duration ? `• ${lesson.duration}` : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchPlayer(lesson._id);
                        }}
                        className="px-3 py-1 text-2xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition"
                      >
                        Play
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400">
          <PageIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            No published sections or lessons found in this course.
          </p>
        </div>
      )}
    </div>
  );
};
