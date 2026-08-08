import React from 'react';
import type { Lesson } from '../../types/course';

interface TextLessonProps {
  lesson: Lesson;
}

export const TextLesson: React.FC<TextLessonProps> = ({ lesson }) => {
  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
        <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
          Text & Article Lesson
        </span>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{lesson.title}</h2>
      </div>

      {/* Main Text Article Container */}
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs">
        {lesson.content ? (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-line space-y-4 font-sans">
            {lesson.content}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs italic">
            No content written for this lesson yet.
          </div>
        )}
      </div>

      {/* Attached Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Lesson Attachments & Links</h4>
          <div className="flex flex-wrap gap-2">
            {lesson.resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{res.name || `Attachment ${idx + 1}`}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextLesson;
