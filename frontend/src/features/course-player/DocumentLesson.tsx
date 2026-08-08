import React, { useState } from 'react';
import type { Lesson } from '../../types/course';

interface DocumentLessonProps {
  lesson: Lesson;
}

export const DocumentLesson: React.FC<DocumentLessonProps> = ({ lesson }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            PDF Document
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{lesson.title}</h2>
        </div>

        {lesson.documentUrl && (
          <a
            href={lesson.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in New Tab
          </a>
        )}
      </div>

      {/* PDF Viewer Container */}
      <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-md">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-500 z-10 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            <p className="text-xs">Loading PDF document viewer...</p>
          </div>
        )}

        {lesson.documentUrl ? (
          <iframe
            src={`${lesson.documentUrl}#toolbar=1`}
            title={lesson.title}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-2 text-gray-400">
            <p className="text-sm font-bold">Document URL Not Available</p>
            <p className="text-xs">No PDF file attached to this lesson.</p>
          </div>
        )}
      </div>

      {/* Content / Notes if present */}
      {lesson.content && (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Reading Notes</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{lesson.content}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentLesson;
