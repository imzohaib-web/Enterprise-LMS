import React from 'react';
import { IDiscussion } from '../types';
import DiscussionCard from './DiscussionCard';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DiscussionListProps {
  discussions: IDiscussion[];
  isLoading: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  onSelectDiscussion: (discussion: IDiscussion) => void;
  onLikeDiscussion: (id: string) => void;
  onPinDiscussion?: (id: string) => void;
  onLockDiscussion?: (id: string) => void;
  onEditDiscussion?: (discussion: IDiscussion) => void;
  onDeleteDiscussion?: (id: string) => void;
  onCreateNew?: () => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export const DiscussionList: React.FC<DiscussionListProps> = ({
  discussions,
  isLoading,
  currentUserId,
  currentUserRole,
  onSelectDiscussion,
  onLikeDiscussion,
  onPinDiscussion,
  onLockDiscussion,
  onEditDiscussion,
  onDeleteDiscussion,
  onCreateNew,
  pagination,
  onPageChange,
}) => {
  if (isLoading) {
    return <LoadingSkeleton count={4} />;
  }

  if (!discussions || discussions.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }

  // Ensure pinned discussions always appear at the top
  const sortedDiscussions = [...discussions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {sortedDiscussions.map((discussion) => {
          const discId = discussion._id || discussion.id;
          return (
            <DiscussionCard
              key={discId}
              discussion={discussion}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onSelect={onSelectDiscussion}
              onLike={onLikeDiscussion}
              onPin={onPinDiscussion}
              onLock={onLockDiscussion}
              onEdit={onEditDiscussion}
              onDelete={onDeleteDiscussion}
            />
          );
        })}
      </div>

      {/* TailAdmin Pagination Bar */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-xs shadow-sm mt-6">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Showing Page <span className="font-bold text-gray-900 dark:text-white">{pagination.page}</span> of{' '}
            <span className="font-bold text-gray-900 dark:text-white">{pagination.totalPages}</span> ({pagination.total} topics)
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-gray-700 dark:text-gray-300">
              {pagination.page}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionList;
