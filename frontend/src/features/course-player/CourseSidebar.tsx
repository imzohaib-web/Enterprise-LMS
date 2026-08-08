import React, { useState } from 'react';
import type { Section } from '../../types/course';
import type { FlatLesson } from './types';

interface CourseSidebarProps {
  sections: Section[];
  flatLessons: FlatLesson[];
  activeLessonId?: string;
  completedLessonIds: Set<string>;
  progressPercentage: number;
  onSelectLesson: (lessonId: string) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  sections,
  flatLessons,
  activeLessonId,
  completedLessonIds,
  progressPercentage,
  onSelectLesson,
  isMobile = false,
  onCloseMobile,
}) => {
  const [search, setSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'assignment':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins} mins`;
    return `${secs} secs`;
  };

  return (
    <aside className={`flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 ${isMobile ? 'w-full' : 'w-full'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            Course Curriculum
          </h2>
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress summary */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-500">
            <span>Progress: {completedLessonIds.size} / {flatLessons.length} done</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Curriculum Accordion List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {sections.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 italic">No sections created for this course yet.</div>
        ) : (
          sections.map((section, sIdx) => {
            const isCollapsed = Boolean(collapsedSections[section._id]);
            const filteredLessons = section.lessons.filter((l) =>
              l.title.toLowerCase().includes(search.toLowerCase())
            );

            if (search && filteredLessons.length === 0) return null;

            const sectionCompletedCount = section.lessons.filter((l) => completedLessonIds.has(l._id)).length;

            return (
              <div key={section._id || sIdx} className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Section Header Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleSection(section._id)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between text-left transition"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block tracking-wider">
                      Section {sIdx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">{section.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-gray-400">
                      {sectionCompletedCount}/{section.lessons.length}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Lessons list under section */}
                {!isCollapsed && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {filteredLessons.map((lesson) => {
                      const isActive = lesson._id === activeLessonId;
                      const isCompleted = completedLessonIds.has(lesson._id);

                      return (
                        <button
                          key={lesson._id}
                          type="button"
                          onClick={() => {
                            onSelectLesson(lesson._id);
                            if (isMobile && onCloseMobile) onCloseMobile();
                          }}
                          className={`w-full p-3 flex items-start gap-2.5 text-left transition-colors ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border-l-4 border-indigo-600'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {/* Completion Status Checkmark */}
                          <div className="mt-0.5 flex-shrink-0">
                            {isCompleted ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                ✓
                              </span>
                            ) : (
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                {getLessonIcon(lesson.type)}
                              </span>
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs leading-snug truncate">{lesson.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              <span className="capitalize">{lesson.type}</span>
                              {lesson.duration > 0 && <span>&bull; {formatDuration(lesson.duration)}</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default CourseSidebar;
