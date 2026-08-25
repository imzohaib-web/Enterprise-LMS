import React from 'react';
import type { Lesson } from '../../types/course';
import { getMediaUrl, isPdfFile, isImageFile } from '../../utils/media';

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
        {lesson.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-normal leading-relaxed">{lesson.description}</p>
        )}
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
            {lesson.resources.map((res, idx) => {
              const resUrl = getMediaUrl(res.url);
              const isPdf = isPdfFile(resUrl) || res.type === 'pdf';
              const isImg = isImageFile(resUrl);
              return (
                <div key={idx} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl">
                  <span className="text-xs">{isPdf ? '📄' : isImg ? '🖼️' : '📦'}</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-[180px] truncate">{res.name || `Attachment ${idx + 1}`}</span>
                  <div className="flex items-center gap-1 ml-2">
                    {(isPdf || isImg) && (
                      <a
                        href={resUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition"
                      >
                        Open
                      </a>
                    )}
                    <a
                      href={resUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-lg transition"
                    >
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextLesson;
