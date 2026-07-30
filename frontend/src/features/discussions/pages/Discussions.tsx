import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import PageMeta from '../../../components/common/PageMeta';
import DiscussionHeader from '../components/DiscussionHeader';
import DiscussionFilters from '../components/DiscussionFilters';
import DiscussionSearch from '../components/DiscussionSearch';
import DiscussionList from '../components/DiscussionList';
import DiscussionComposer from '../components/DiscussionComposer';
import ReplyCard from '../components/ReplyCard';
import ReplyComposer from '../components/ReplyComposer';
import PinnedBadge from '../components/PinnedBadge';
import LockedBadge from '../components/LockedBadge';
import { Modal } from '../../../components/ui/modal';

import {
  useDiscussions,
  useDiscussion,
  useCreateDiscussion,
  useUpdateDiscussion,
  useDeleteDiscussion,
  useCreateReply,
  useUpdateReply,
  useDeleteReply,
  useLikeDiscussion,
  useLikeReply,
  usePinDiscussion,
  useLockDiscussion,
} from '../hooks/useDiscussions';
import { DiscussionFilter, DiscussionSort, IDiscussion, CreateDiscussionInput } from '../types';
import {
  Heart,
  MessageSquare,
  ArrowLeft,
  Paperclip,
  User,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Discussions: React.FC = () => {
  const queryClient = useQueryClient();

  // State
  const [selectedCourseId, setSelectedCourseId] = useState('course-101');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<DiscussionFilter>('all');
  const [sort, setSort] = useState<DiscussionSort>('latest');
  const [page, setPage] = useState(1);

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<IDiscussion | null>(null);

  // Active Discussion Detail Overlay State
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);

  // User context (Demo or authenticated user context)
  const currentUserId = 'user-demo-1';
  const currentUserRole = 'instructor'; // Can be 'student' or 'instructor'

  // Fetch Discussions list
  const { data: discussionsData, isLoading } = useDiscussions(selectedCourseId, {
    search: searchQuery,
    filter,
    sort,
    page,
    limit: 10,
  });

  // Fetch Single Discussion thread details if opened
  const { data: activeDiscussion } = useDiscussion(activeDiscussionId || '');

  // Mutations
  const createDiscussionMutation = useCreateDiscussion();
  const updateDiscussionMutation = useUpdateDiscussion();
  const deleteDiscussionMutation = useDeleteDiscussion();
  const createReplyMutation = useCreateReply();
  const updateReplyMutation = useUpdateReply();
  const deleteReplyMutation = useDeleteReply();
  const likeDiscussionMutation = useLikeDiscussion();
  const likeReplyMutation = useLikeReply();
  const pinDiscussionMutation = usePinDiscussion();
  const lockDiscussionMutation = useLockDiscussion();

  // Real-time Socket.IO Setup
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join-course', selectedCourseId);
      if (activeDiscussionId) {
        socket.emit('join-discussion', activeDiscussionId);
      }
    });

    socket.on('discussion:created', () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('New discussion post added in real-time!', { duration: 3000 });
    });

    socket.on('reply:created', () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      if (activeDiscussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', activeDiscussionId] });
        queryClient.invalidateQueries({ queryKey: ['replies', activeDiscussionId] });
      }
    });

    socket.on('discussion:liked', () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    });

    socket.on('reply:liked', () => {
      if (activeDiscussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', activeDiscussionId] });
      }
    });

    socket.on('discussion:pinned', () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    });

    socket.on('discussion:locked', () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      if (activeDiscussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', activeDiscussionId] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedCourseId, activeDiscussionId, queryClient]);

  // Handler Actions
  const handleCreateOrUpdateDiscussion = async (inputData: CreateDiscussionInput) => {
    try {
      if (editingDiscussion) {
        const discId = editingDiscussion._id || editingDiscussion.id;
        await updateDiscussionMutation.mutateAsync({
          id: discId,
          data: {
            title: inputData.title,
            content: inputData.content,
            tags: inputData.tags,
            attachments: inputData.attachments,
          },
        });
        toast.success('Discussion post updated successfully!');
      } else {
        await createDiscussionMutation.mutateAsync(inputData);
        toast.success('Discussion post published successfully!');
      }
      setIsComposerOpen(false);
      setEditingDiscussion(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save discussion');
    }
  };

  const handleEditClick = (discussion: IDiscussion) => {
    setEditingDiscussion(discussion);
    setIsComposerOpen(true);
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this discussion post?')) {
      try {
        await deleteDiscussionMutation.mutateAsync(id);
        toast.success('Discussion deleted successfully');
        if (activeDiscussionId === id) {
          setActiveDiscussionId(null);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete discussion');
      }
    }
  };

  const handleLikeDiscussion = async (id: string) => {
    try {
      await likeDiscussionMutation.mutateAsync(id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to like discussion');
    }
  };

  const handlePinDiscussion = async (id: string) => {
    try {
      await pinDiscussionMutation.mutateAsync(id);
      toast.success('Discussion pin status toggled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Only instructors can pin discussions');
    }
  };

  const handleLockDiscussion = async (id: string) => {
    try {
      await lockDiscussionMutation.mutateAsync(id);
      toast.success('Discussion lock status toggled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Only instructors can lock discussions');
    }
  };

  // Reply handlers
  const handlePostReply = async (content: string, parentReplyId?: string | null) => {
    if (!activeDiscussionId) return;
    try {
      await createReplyMutation.mutateAsync({
        discussionId: activeDiscussionId,
        data: { content, parentReplyId: parentReplyId || null },
      });
      toast.success('Reply posted!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleEditReply = async (replyId: string, newContent: string) => {
    try {
      await updateReplyMutation.mutateAsync({
        replyId,
        data: { content: newContent },
        discussionId: activeDiscussionId || undefined,
      });
      toast.success('Reply updated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update reply');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (window.confirm('Delete this reply?')) {
      try {
        await deleteReplyMutation.mutateAsync({
          replyId,
          discussionId: activeDiscussionId || undefined,
        });
        toast.success('Reply deleted');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete reply');
      }
    }
  };

  const handleLikeReply = async (replyId: string) => {
    try {
      await likeReplyMutation.mutateAsync({
        replyId,
        discussionId: activeDiscussionId || undefined,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to like reply');
    }
  };

  return (
    <>
      <PageMeta
        title="Course Discussions | Enterprise LMS"
        description="Engage with course members, ask questions, and share knowledge."
      />

      <div className="space-y-6">
        {/* Header Bar */}
        <DiscussionHeader
          selectedCourseId={selectedCourseId}
          onCourseChange={(cId) => {
            setSelectedCourseId(cId);
            setPage(1);
          }}
          onOpenComposer={() => {
            setEditingDiscussion(null);
            setIsComposerOpen(true);
          }}
        />

        {/* Search Bar */}
        <DiscussionSearch
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
        />

        {/* Filter and Sort Tabs */}
        <DiscussionFilters
          activeFilter={filter}
          activeSort={sort}
          onFilterChange={(f) => {
            setFilter(f);
            setPage(1);
          }}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
        />

        {/* Main Discussions List */}
        <DiscussionList
          discussions={discussionsData?.discussions || []}
          isLoading={isLoading}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onSelectDiscussion={(disc) => setActiveDiscussionId(disc._id || disc.id)}
          onLikeDiscussion={handleLikeDiscussion}
          onPinDiscussion={handlePinDiscussion}
          onLockDiscussion={handleLockDiscussion}
          onEditDiscussion={handleEditClick}
          onDeleteDiscussion={handleDeleteDiscussion}
          onCreateNew={() => {
            setEditingDiscussion(null);
            setIsComposerOpen(true);
          }}
          pagination={discussionsData?.pagination}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Composer Modal */}
      <DiscussionComposer
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setEditingDiscussion(null);
        }}
        onSubmit={handleCreateOrUpdateDiscussion}
        initialData={editingDiscussion}
        courseId={selectedCourseId}
        isSubmitting={
          createDiscussionMutation.isPending || updateDiscussionMutation.isPending
        }
      />

      {/* Thread Details Modal Overlay */}
      {activeDiscussionId && (
        <Modal
          isOpen={Boolean(activeDiscussionId)}
          onClose={() => setActiveDiscussionId(null)}
          className="max-w-4xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          {activeDiscussion ? (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setActiveDiscussionId(null)}
                className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to all discussions
              </button>

              {/* Main Discussion Topic Details */}
              <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/70 p-6 rounded-2xl space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                      {activeDiscussion.authorName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {activeDiscussion.authorName || 'Course Author'}
                        </span>
                        {activeDiscussion.authorRole === 'instructor' && (
                          <span className="inline-flex items-center text-xs font-semibold bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Instructor
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(activeDiscussion.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeDiscussion.isPinned && <PinnedBadge />}
                    {activeDiscussion.isLocked && <LockedBadge />}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">
                    {activeDiscussion.title}
                  </h2>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {activeDiscussion.content}
                  </p>
                </div>

                {/* Tags & Attachments */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {activeDiscussion.tags?.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {activeDiscussion.attachments && activeDiscussion.attachments.length > 0 && (
                  <div className="pt-2 space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Attachments:</span>
                    <div className="flex flex-wrap gap-2">
                      {activeDiscussion.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-xl border border-brand-100 dark:border-brand-500/20 hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          {att.name || 'Attachment'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics & Actions */}
                <div className="flex items-center space-x-6 border-t border-gray-200 dark:border-gray-700/80 pt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handleLikeDiscussion(activeDiscussion._id || activeDiscussion.id)}
                    className={`flex items-center space-x-1.5 transition-colors ${
                      activeDiscussion.isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${activeDiscussion.isLiked ? 'fill-current' : ''}`} />
                    <span>{activeDiscussion.likesCount || 0} Likes</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{activeDiscussion.repliesCount || 0} Replies</span>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-500" /> Responses (
                  {activeDiscussion.replies?.length || 0})
                </h3>

                {/* Root Reply Composer */}
                <ReplyComposer
                  onSubmit={(content) => handlePostReply(content, null)}
                  isDisabled={activeDiscussion.isLocked}
                  isSubmitting={createReplyMutation.isPending}
                />

                {/* List of Replies */}
                {activeDiscussion.replies && activeDiscussion.replies.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {activeDiscussion.replies.map((rep) => {
                      const repId = rep._id || rep.id;
                      return (
                        <ReplyCard
                          key={repId}
                          reply={rep}
                          currentUserId={currentUserId}
                          currentUserRole={currentUserRole}
                          isLocked={activeDiscussion.isLocked}
                          onLike={handleLikeReply}
                          onDelete={handleDeleteReply}
                          onEdit={handleEditReply}
                          onReplyNested={(content, parentId) => handlePostReply(content, parentId)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
                    No replies yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 animate-pulse">Loading discussion thread...</div>
          )}
        </Modal>
      )}
    </>
  );
};

export default Discussions;
