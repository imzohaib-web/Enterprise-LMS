import React from 'react';
import type { Lesson } from '../../types/course';
import VideoLesson from './VideoLesson';
import DocumentLesson from './DocumentLesson';
import TextLesson from './TextLesson';

interface LessonViewerProps {
  lesson: Lesson | null;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ lesson }) => {
  if (!lesson) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center text-gray-400 space-y-3">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl font-bold">
          📚
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Select a Lesson to Start Learning</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Choose a lesson module from the curriculum menu on the right to view videos, reading materials, or documents.
        </p>
      </div>
    );
  }

  // Priority 1: Video Lesson
  if (lesson.type === 'video' || lesson.videoUrl) {
    return <VideoLesson lesson={lesson} />;
  }

  // Priority 2: Document / PDF Lesson
  if (lesson.type === 'pdf' || lesson.documentUrl) {
    return <DocumentLesson lesson={lesson} />;
  }

  // Priority 3: Text / Article / Assignment Lesson
  if (lesson.content) {
    return <TextLesson lesson={lesson} />;
  }

  // Fallback: Empty Lesson Content State (Rule E.4: No Fake Placeholder Content)
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center text-gray-400 space-y-3">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center mx-auto text-xl font-bold">
        📝
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        Lesson content is currently unavailable or undergoing updates by the instructor.
      </p>
    </div>
  );
};

export default LessonViewer;
