import React, { useState } from 'react';
import type { Lesson } from '../../types/course';

interface VideoLessonProps {
  lesson: Lesson;
}

export const VideoLesson: React.FC<VideoLessonProps> = ({ lesson }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Video Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            <p className="text-xs text-gray-400">Loading video stream...</p>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center space-y-3 z-10">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-sm font-bold">Video Playback Failed</h3>
            <p className="text-xs text-gray-400 max-w-md">
              Unable to load the video stream from Cloudinary. Please verify your connection or refresh the page.
            </p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
            >
              Retry Video
            </button>
          </div>
        ) : (
          <video
            src={lesson.videoUrl}
            controls
            controlsList="nodownload"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Video Details & Meta */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lesson.title}</h2>
          {lesson.duration > 0 && (
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
              ⏱️ Duration: {formatDuration(lesson.duration)}
            </span>
          )}
        </div>

        {lesson.content && (
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Lesson Description</h4>
            <p className="whitespace-pre-line leading-relaxed">{lesson.content}</p>
          </div>
        )}

        {/* Resources list */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Attached Resources</h4>
            <div className="flex flex-wrap gap-2">
              {lesson.resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 transition"
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
    </div>
  );
};

export default VideoLesson;
