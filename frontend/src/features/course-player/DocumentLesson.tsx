import React, { useState } from 'react';
import type { Lesson } from '../../types/course';
import { getMediaUrl, isPdfFile, isImageFile } from '../../utils/media';

interface DocumentLessonProps {
  lesson: Lesson;
}

export const DocumentLesson: React.FC<DocumentLessonProps> = ({ lesson }) => {
  const [isLoading, setIsLoading] = useState(true);

  const documentSrc = getMediaUrl(lesson.documentUrl);
  const isPdf = isPdfFile(documentSrc);
  const isImg = isImageFile(documentSrc);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            {isPdf ? 'PDF Document' : isImg ? 'Image Resource' : 'Document File'}
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{lesson.title}</h2>
          {lesson.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lesson.description}</p>
          )}
        </div>

        {documentSrc && (
          <div className="flex items-center gap-2">
            {(isPdf || isImg) && (
              <a
                href={documentSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl transition border border-indigo-100 dark:border-indigo-900/40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Preview
              </a>
            )}
            <a
              href={documentSrc}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </a>
          </div>
        )}
      </div>

      {/* Viewer / Preview Container */}
      <div className="relative w-full min-h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-md">
        {documentSrc ? (
          isPdf ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-500 z-10 space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
                  <p className="text-xs">Loading PDF document viewer...</p>
                </div>
              )}
              <iframe
                src={`${documentSrc}#toolbar=1`}
                title={lesson.title}
                onLoad={() => setIsLoading(false)}
                className="w-full h-[600px] border-0"
              />
            </>
          ) : isImg ? (
            <div className="flex items-center justify-center p-6 bg-gray-900">
              <img src={documentSrc} alt={lesson.title} className="max-h-[600px] object-contain rounded-xl shadow-lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold shadow-xs">
                📄
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                  This document format requires an external application to view. Click below to download the file directly.
                </p>
              </div>
              <a
                href={documentSrc}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm inline-flex items-center gap-2"
              >
                📥 Download Document
              </a>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] p-6 text-center space-y-2 text-gray-400">
            <p className="text-sm font-bold">Document URL Not Available</p>
            <p className="text-xs">No file has been attached to this document lesson yet.</p>
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

      {/* Attached Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Attached Resources</h4>
          <div className="flex flex-wrap gap-2">
            {lesson.resources.map((res, idx) => {
              const resUrl = getMediaUrl(res.url);
              const isResPdf = isPdfFile(resUrl) || res.type === 'pdf';
              const isResImg = isImageFile(resUrl);
              return (
                <div key={idx} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl">
                  <span className="text-xs">{isResPdf ? '📄' : isResImg ? '🖼️' : '📦'}</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-[180px] truncate">{res.name || `Attachment ${idx + 1}`}</span>
                  <div className="flex items-center gap-1 ml-2">
                    {(isResPdf || isResImg) && (
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

export default DocumentLesson;
