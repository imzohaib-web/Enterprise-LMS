import React, { useState } from 'react';
import type { Section, Lesson, LessonType } from '../../types/course';

interface SectionAccordionProps {
  sections: Section[];
  onAddSection?: () => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onAddLesson?: (sectionId: string) => void;
  onEditLesson?: (sectionId: string, lesson: Lesson) => void;
  onDeleteLesson?: (sectionId: string, lessonId: string) => void;
  editable?: boolean;
}

const lessonTypeIcons: Record<LessonType, React.ReactNode> = {
  video: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  pdf: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  text: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
  ),
  assignment: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
  ),
};

const lessonTypeColors: Record<LessonType, string> = {
  video:      'text-indigo-500',
  pdf:        'text-rose-500',
  text:       'text-emerald-500',
  assignment: 'text-amber-500',
};

const formatDuration = (secs: number): string => {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const SectionAccordion: React.FC<SectionAccordionProps> = ({
  sections, onAddSection, onEditSection, onDeleteSection,
  onAddLesson, onEditLesson, onDeleteLesson, editable = false,
}) => {
  const [open, setOpen] = useState<Set<string>>(new Set(sections[0]?._id ? [sections[0]._id] : []));

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {sections.map((section, si) => (
        <div key={section._id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          {/* Section header */}
          <div
            className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => toggle(section._id)}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open.has(section._id) ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <div className="flex-1">
              <span className="text-xs text-gray-400 font-medium">Section {si + 1}</span>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{section.title}</h4>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{section.lessons.length} lessons</span>
            {editable && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onEditSection?.(section)} className="p-1 text-gray-400 hover:text-indigo-500 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => onDeleteSection?.(section._id)} className="p-1 text-gray-400 hover:text-red-500 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>

          {/* Lessons list */}
          {open.has(section._id) && (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {section.lessons.map((lesson) => (
                <div key={lesson._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition group">
                  <span className={lessonTypeColors[lesson.type]}>{lessonTypeIcons[lesson.type]}</span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{lesson.title}</span>
                  {lesson.isPreview && (
                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded">Preview</span>
                  )}
                  {lesson.duration > 0 && (
                    <span className="text-xs text-gray-400">{formatDuration(lesson.duration)}</span>
                  )}
                  {editable && (
                    <div className="flex gap-1 items-center transition">
                      <button onClick={() => onEditLesson?.(section._id, lesson)} className="p-1 text-gray-400 hover:text-indigo-500 transition" title="Edit Lesson">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => onDeleteLesson?.(section._id, lesson._id)} className="p-1 text-gray-400 hover:text-red-500 transition" title="Delete Lesson">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {editable && (
                <div className="px-5 py-3">
                  <button
                    onClick={() => onAddLesson?.(section._id)}
                    className="flex items-center gap-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add lesson
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {editable && (
        <button
          onClick={onAddSection}
          className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add section
        </button>
      )}
    </div>
  );
};

export default SectionAccordion;
