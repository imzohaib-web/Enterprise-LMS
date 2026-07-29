import React, { useState } from 'react';
import { IDiscussion } from '../types';
import PinnedBadge from './PinnedBadge';
import LockedBadge from './LockedBadge';
import {
  Heart,
  MessageSquare,
  MoreVertical,
  Pin,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Paperclip,
  User,
  ShieldCheck,
} from 'lucide-react';

interface DiscussionCardProps {
  discussion: IDiscussion;
  currentUserId?: string;
  currentUserRole?: string;
  onSelect: (discussion: IDiscussion) => void;
  onLike: (id: string) => void;
  onPin?: (id: string) => void;
  onLock?: (id: string) => void;
  onEdit?: (discussion: IDiscussion) => void;
  onDelete?: (id: string) => void;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  currentUserId = 'user-demo-1',
  currentUserRole = 'student',
  onSelect,
  onLike,
  onPin,
  onLock,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const discId = discussion._id || discussion.id;
  const isInstructor = currentUserRole === 'instructor' || currentUserRole === 'admin';
  const isAuthor = discussion.authorId === currentUserId;
  const canModify = isAuthor || isInstructor;

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-900 border rounded-2xl transition-all duration-200 hover:shadow-md ${
        discussion.isPinned
          ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="space-y-4">
        {/* Top bar: Author Info & Badges */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-extrabold text-sm">
              {discussion.authorName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {discussion.authorName || 'Course Member'}
                </span>
                {discussion.authorRole === 'instructor' && (
                  <span className="inline-flex items-center text-xs font-semibold bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Instructor
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(discussion.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {discussion.isPinned && <PinnedBadge />}
            {discussion.isLocked && <LockedBadge />}

            {canModify && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-20 py-1 text-xs"
                  >
                    {isInstructor && onPin && (
                      <button
                        onClick={() => {
                          onPin(discId);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Pin className="w-3.5 h-3.5" />{' '}
                        {discussion.isPinned ? 'Unpin' : 'Pin Topic'}
                      </button>
                    )}
                    {isInstructor && onLock && (
                      <button
                        onClick={() => {
                          onLock(discId);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                      >
                        {discussion.isLocked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" /> Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Lock Replies
                          </>
                        )}
                      </button>
                    )}
                    {isAuthor && onEdit && (
                      <button
                        onClick={() => {
                          onEdit(discussion);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(discId);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Title & Excerpt */}
        <div
          onClick={() => onSelect(discussion)}
          className="cursor-pointer space-y-2 group"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
            {discussion.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {discussion.content}
          </p>
        </div>

        {/* Tags & Attachments preview */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {discussion.tags?.map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full"
            >
              #{t}
            </span>
          ))}

          {discussion.attachments && discussion.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-0.5 rounded-full">
              <Paperclip className="w-3 h-3" /> {discussion.attachments.length} attachment(s)
            </span>
          )}
        </div>

        {/* Card Footer Metrics */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(discId)}
              className={`flex items-center space-x-1.5 font-semibold transition-colors ${
                discussion.isLiked
                  ? 'text-rose-500'
                  : 'hover:text-rose-500 dark:hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
              <span>{discussion.likesCount || 0}</span>
            </button>

            <button
              onClick={() => onSelect(discussion)}
              className="flex items-center space-x-1.5 font-semibold hover:text-brand-500 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{discussion.repliesCount || 0} replies</span>
            </button>
          </div>

          <button
            onClick={() => onSelect(discussion)}
            className="text-xs font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            View Thread &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;
