import React, { useState } from 'react';
import type { Lesson } from '../../types/course';
import { getMediaUrl, getMimeType, isPdfFile, isImageFile } from '../../utils/media';

interface VideoLessonProps {
  lesson: Lesson;
}

export const VideoLesson: React.FC<VideoLessonProps> = ({ lesson }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Unable to load this video. Please try again.');

  const rawVideoUrl = lesson.videoUrl || lesson.externalVideoUrl || '';
  const videoSrc = getMediaUrl(rawVideoUrl);
  const mimeType = getMimeType(rawVideoUrl, 'mp4');

  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return null;
  };

  const embedUrl = getEmbedUrl(lesson.externalVideoUrl || lesson.videoUrl);

  const formatDuration = (secondsOrMins?: number) => {
    if (!secondsOrMins || secondsOrMins <= 0) return null;
    if (secondsOrMins > 100) {
      const mins = Math.floor(secondsOrMins / 60);
      const secs = secondsOrMins % 60;
      return `${mins}m ${secs}s`;
    }
    return `${secondsOrMins} mins`;
  };

  return (
    <div className="space-y-6">
      {/* Video Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
        {isLoading && !hasError && !embedUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            <p className="text-xs text-gray-400">Loading video stream...</p>
          </div>
        )}

        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center space-y-3 z-10">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-sm font-bold">Video Playback Failed</h3>
            <p className="text-xs text-gray-400 max-w-md">{errorMessage}</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Retry Playback
            </button>
          </div>
        ) : (
          <video
            controls
            preload="metadata"
            onLoadStart={() => setIsLoading(true)}
            onLoadedMetadata={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            onWaiting={() => setIsLoading(true)}
            onError={(e) => {
              setIsLoading(false);
              setHasError(true);
              const err = e.currentTarget.error;
              let msg = 'Unable to load this video. Please try again.';
              if (err) {
                if (err.code === 1) msg = 'Video loading aborted.';
                else if (err.code === 2) msg = 'Network error occurred while fetching video.';
                else if (err.code === 3) msg = 'Video decoding failed or format unsupported.';
                else if (err.code === 4) msg = 'Video format or URL not supported by browser.';
              }
              setErrorMessage(msg);
            }}
            className="w-full h-full object-contain"
          >
            <source src={videoSrc} type={mimeType} />
            Your browser does not support HTML5 video playback.
          </video>
        )}
      </div>

      {/* Video Details & Meta */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lesson.title}</h2>
            {lesson.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{lesson.description}</p>
            )}
          </div>
          {lesson.duration > 0 && (
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-900/40">
              ⏱️ Duration: {formatDuration(lesson.duration)}
            </span>
          )}
        </div>

        {lesson.content && (
          <div className="prose dark:prose-invert max-w-none text-xs md:text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Lesson Notes & Instructions</h4>
            <p className="whitespace-pre-line leading-relaxed">{lesson.content}</p>
          </div>
        )}

        {/* Resources list */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              📄 Attached Learning Resources ({lesson.resources.length})
            </h4>
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
    </div>
  );
};

export default VideoLesson;
