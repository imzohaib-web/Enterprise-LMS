import React, { useState } from 'react';
import { IReply } from '../types';
import { Heart, Reply as ReplyIcon, MoreVertical, Edit2, Trash2, ShieldCheck, User } from 'lucide-react';
import ReplyComposer from './ReplyComposer';

interface ReplyCardProps {
  reply: IReply;
  currentUserId?: string;
  currentUserRole?: string;
  onLike: (replyId: string) => void;
  onDelete: (replyId: string) => void;
  onEdit: (replyId: string, newContent: string) => void;
  onReplyNested?: (content: string, parentReplyId: string) => void;
  isLocked?: boolean;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  currentUserId = 'user-demo-1',
  currentUserRole = 'student',
  onLike,
  onDelete,
  onEdit,
  onReplyNested,
  isLocked = false,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showMenu, setShowMenu] = useState(false);

  const replyId = reply._id || reply.id;
  const isOwner = reply.authorId === currentUserId;
  const canModify = isOwner || currentUserRole === 'instructor' || currentUserRole === 'admin';

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onEdit(replyId, editContent.trim());
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 transition-colors">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
            {reply.authorName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {reply.authorName || 'Student'}
              </span>
              {reply.authorRole === 'instructor' && (
                <span className="inline-flex items-center text-[10px] font-semibold bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> Instructor
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400">
              {new Date(reply.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Options Menu */}
        {canModify && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-10 py-1 text-xs">
                {isOwner && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(replyId);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2 pt-1">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs bg-brand-500 text-white font-medium rounded-md hover:bg-brand-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {reply.content}
        </p>
      )}

      {/* Footer Actions */}
      <div className="flex items-center space-x-4 pt-1">
        <button
          onClick={() => onLike(replyId)}
          className={`flex items-center space-x-1 text-xs font-medium transition-colors ${
            reply.isLiked
              ? 'text-rose-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${reply.isLiked ? 'fill-current' : ''}`} />
          <span>{reply.likesCount || 0}</span>
        </button>

        {!isLocked && onReplyNested && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors"
          >
            <ReplyIcon className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        )}
      </div>

      {/* Nested Reply Form */}
      {isReplying && onReplyNested && (
        <div className="mt-3 pl-3 border-l-2 border-brand-500">
          <ReplyComposer
            parentReplyId={replyId}
            onCancel={() => setIsReplying(false)}
            onSubmit={async (content) => {
              onReplyNested(content, replyId);
              setIsReplying(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReplyCard;
