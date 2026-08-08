import React from 'react';
import { MessageSquarePlus, BookOpen } from 'lucide-react';
import Button from '../../../components/ui/button/Button';

interface DiscussionHeaderProps {
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
  onOpenComposer: () => void;
  courses?: { id: string; title: string }[];
}

export const DiscussionHeader: React.FC<DiscussionHeaderProps> = ({
  selectedCourseId,
  onCourseChange,
  onOpenComposer,
  courses = [],
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xs">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          Discussion Forums
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Collaborate with peers, ask instructors questions, and exchange knowledge.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Course Dropdown Selector */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <select
            value={selectedCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer max-w-[200px] truncate"
          >
            <option value="all" className="bg-white dark:bg-gray-900">
              All Courses
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-gray-900">
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* New Discussion Button */}
        <Button
          onClick={onOpenComposer}
          size="md"
          variant="primary"
          startIcon={<MessageSquarePlus className="w-4 h-4" />}
        >
          New Post
        </Button>
      </div>
    </div>
  );
};

export default DiscussionHeader;
