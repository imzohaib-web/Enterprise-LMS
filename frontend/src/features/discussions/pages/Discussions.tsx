import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadCrumb from '../../../components/common/PageBreadCrumb';
import DiscussionHeader from '../components/DiscussionHeader';
import DiscussionFilters from '../components/DiscussionFilters';
import DiscussionSearch from '../components/DiscussionSearch';
import DiscussionList from '../components/DiscussionList';
import DiscussionComposer from '../components/DiscussionComposer';
import ReplyCard from '../components/ReplyCard';
import ReplyComposer from '../components/ReplyComposer';
import PinnedBadge from '../components/PinnedBadge';
import LockedBadge from '../components/LockedBadge';
import { selectCurrentUser } from '../../auth/authSlice';
import { progressService } from '../../../services/progress.service';

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
import { Heart, MessageSquare, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Discussions: React.FC = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = currentUser?._id || (currentUser as any)?.id || '';
  const currentUserRole = currentUser?.role || 'student';

  const [searchParams, setSearchParams] = useSearchParams();
  const threadParam = searchParams.get('thread');

  // Course Selector State ('all' by default)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<DiscussionFilter>('all');
  const [sort, setSort] = useState<DiscussionSort>('latest');
  const [page, setPage] = useState(1);

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<IDiscussion | null>(null);

  // Active Discussion Detail State
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(threadParam);

  // Synchronize state with URL search param
  useEffect(() => {
    if (threadParam) {
      setActiveDiscussionId(threadParam);
    }
  }, [threadParam]);

  // Fetch student's real enrolled courses for dropdown
  const { data: enrollmentsData = [] } = useQuery({
    queryKey: ['studentEnrolledCoursesForDiscussions', currentUserId],
    queryFn: async () => {
      const res: any = await progressService.getStudentProgress();
      return res.data?.enrollments || res.enrollments || [];
    },
    enabled: !!currentUserId,
  });

  const availableCourses = enrollmentsData.map((e: any) => ({
    id: e.courseId?._id || e.courseId || e.course,
    title: e.courseId?.title || e.courseTitle || 'Enrolled Course',
  }));

  // Discussions Query
  const { data: discussionsData, isLoading, isError, refetch } = useDiscussions(
    selectedCourseId,
    {
      search: searchQuery,
      filter,
      sort,
      page,
      limit: 10,
    }
  );

  // Single Discussion Thread Query
  const {
    data: activeDiscussionData,
    isLoading: isDiscussionLoading,
    isError: isDiscussionError,
  } = useDiscussion(activeDiscussionId || '');

  // Mutations
  const createDiscussionMutation = useCreateDiscussion();
  const updateDiscussionMutation = useUpdateDiscussion();
  const deleteDiscussionMutation = useDeleteDiscussion();
  const createReplyMutation = useCreateReply();
  const deleteReplyMutation = useDeleteReply();
  const likeDiscussionMutation = useLikeDiscussion();
  const likeReplyMutation = useLikeReply();
  const pinDiscussionMutation = usePinDiscussion();
  const lockDiscussionMutation = useLockDiscussion();

  // Socket.IO Real-time Connection
  useEffect(() => {
    const socket: Socket = io(
      import.meta.env?.VITE_WS_URL || import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000'
    );

    if (activeDiscussionId) {
      socket.emit('join-discussion', activeDiscussionId);
    }

    socket.on('discussion:created', () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    });

    socket.on('reply:created', (data) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      if (data.discussionId === activeDiscussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', activeDiscussionId] });
      }
    });

    socket.on('discussion:liked', (data) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      if (data.discussionId === activeDiscussionId) {
        queryClient.invalidateQueries({ queryKey: ['discussion', activeDiscussionId] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeDiscussionId, queryClient]);

  // Handlers
  const handleOpenDiscussion = (discussion: IDiscussion) => {
    const discId = discussion._id || discussion.id;
    if (discId) {
      setActiveDiscussionId(discId);
      setSearchParams({ thread: discId });
    }
  };

  const handleBackToList = () => {
    setActiveDiscussionId(null);
    setSearchParams({});
  };

  const handleComposerSubmit = async (data: CreateDiscussionInput) => {
    try {
      if (editingDiscussion) {
        const id = editingDiscussion._id || editingDiscussion.id || '';
        await updateDiscussionMutation.mutateAsync({
          id,
          data: {
            title: data.title,
            content: data.content,
            tags: data.tags,
            attachments: data.attachments,
          },
        });
        toast.success('Discussion post updated!');
      } else {
        await createDiscussionMutation.mutateAsync(data);
        toast.success('Discussion published successfully!');
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

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discussion thread?')) return;
    try {
      await deleteDiscussionMutation.mutateAsync(id);
      toast.success('Discussion deleted');
      if (activeDiscussionId === id) {
        handleBackToList();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete discussion');
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
      toast.success('Pin status toggled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Only instructors can pin discussions');
    }
  };

  const handleLockDiscussion = async (id: string) => {
    try {
      await lockDiscussionMutation.mutateAsync(id);
      toast.success('Lock status toggled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Only instructors can lock discussions');
    }
  };

  const handleReplySubmit = async (content: string, parentReplyId?: string | null) => {
    if (!activeDiscussionId) return;
    try {
      await createReplyMutation.mutateAsync({
        discussionId: activeDiscussionId,
        data: { content, parentReplyId: parentReplyId || undefined },
      });
      toast.success('Reply posted!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete your reply?')) return;
    try {
      await deleteReplyMutation.mutateAsync({
        replyId,
        discussionId: activeDiscussionId || undefined,
      });
      toast.success('Reply removed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete reply');
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

  const updateReplyMutation = useUpdateReply();

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

  const discussion = activeDiscussionData;
  const isAuthor =
    discussion &&
    (discussion.authorId === currentUserId ||
      (typeof discussion.authorId === 'object' && (discussion.authorId as any)?._id === currentUserId));
  const isInstructorOrAdmin = currentUserRole === 'instructor' || currentUserRole === 'admin';

  return (
    <>
      <PageMeta
        title="Discussion Forum | Student Portal"
        description="Collaborate with peers, ask questions, and engage in technical course discussions."
      />

      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Discussion Forum" />

        {/* ── Active Discussion Detail Thread View ─────────────────────── */}
        {activeDiscussionId ? (
          <div className="space-y-6">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to all discussions
            </button>

            {isDiscussionLoading ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
              </div>
            ) : isDiscussionError || !discussion ? (
              <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-8 text-center space-y-3">
                <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Discussion Not Found</h3>
                <p className="text-xs text-gray-500">The discussion thread does not exist or may have been deleted.</p>
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Return to Discussions
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Thread Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="flex items-center gap-2">
                      {discussion.isPinned && <PinnedBadge />}
                      {discussion.isLocked && <LockedBadge />}
                    </div>

                    {/* Actions (Edit/Delete/Pin/Lock) */}
                    <div className="flex items-center gap-2">
                      {isInstructorOrAdmin && (
                        <>
                          <button
                            onClick={() => handlePinDiscussion(discussion._id || discussion.id || '')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition"
                          >
                            {discussion.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => handleLockDiscussion(discussion._id || discussion.id || '')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition"
                          >
                            {discussion.isLocked ? 'Unlock' : 'Lock'}
                          </button>
                        </>
                      )}

                      {(isAuthor || isInstructorOrAdmin) && (
                        <>
                          <button
                            onClick={() => handleEditClick(discussion)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(discussion._id || discussion.id || '')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Discussion Title */}
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    {discussion.title}
                  </h1>

                  {/* Author Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                      {discussion.authorName ? discussion.authorName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {discussion.authorName || 'Student'}
                        </span>
                        {discussion.authorRole === 'instructor' && (
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            Instructor
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block">
                        {new Date(discussion.createdAt || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {discussion.content}
                  </div>

                  {/* Tags */}
                  {discussion.tags && discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {discussion.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleLikeDiscussion(discussion._id || discussion.id || '')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          discussion.likes?.includes(currentUserId)
                            ? 'fill-rose-500 text-rose-500'
                            : ''
                        }`}
                      />
                      <span>{discussion.likesCount || 0} Likes</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                      <MessageSquare className="w-4 h-4" />
                      <span>{discussion.repliesCount || discussion.replies?.length || 0} Replies</span>
                    </div>
                  </div>
                </div>

                {/* Replies Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Replies ({discussion.replies?.length || 0})
                  </h3>

                  {/* Reply Composer */}
                  {!discussion.isLocked ? (
                    <ReplyComposer onSubmit={(content, parentReplyId) => handleReplySubmit(content, parentReplyId || undefined)} />
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      🔒 This discussion thread has been locked by an instructor. New replies are disabled.
                    </div>
                  )}

                  {/* Replies List */}
                  <div className="space-y-3 pt-2">
                    {discussion.replies && discussion.replies.length > 0 ? (
                      discussion.replies.map((reply) => (
                        <ReplyCard
                          key={reply._id || reply.id}
                          reply={reply}
                          currentUserId={currentUserId}
                          currentUserRole={currentUserRole}
                          onLike={() => handleLikeReply(reply._id || reply.id || '')}
                          onDelete={() => handleDeleteReply(reply._id || reply.id || '')}
                          onEdit={(replyId, newContent) => handleEditReply(replyId, newContent)}
                          onReplyNested={(content, parentReplyId) => handleReplySubmit(content, parentReplyId)}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-4">
                        No replies yet. Be the first to answer!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Main Discussion List View ───────────────────────────────── */
          <div className="space-y-6">
            <DiscussionHeader
              selectedCourseId={selectedCourseId}
              onCourseChange={setSelectedCourseId}
              onOpenComposer={() => setIsComposerOpen(true)}
              courses={availableCourses}
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <DiscussionSearch
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <DiscussionFilters
                activeFilter={filter}
                activeSort={sort}
                onFilterChange={setFilter}
                onSortChange={setSort}
              />
            </div>

            {/* Discussion Cards Grid / List */}
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 border border-rose-200 dark:border-rose-900/40 rounded-3xl bg-rose-50/40 text-center space-y-3">
                <p className="text-xs font-bold text-rose-600">Unable to load discussion posts.</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : (
              <DiscussionList
                discussions={discussionsData?.discussions || []}
                isLoading={isLoading}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onSelectDiscussion={handleOpenDiscussion}
                onLikeDiscussion={handleLikeDiscussion}
                onPinDiscussion={handlePinDiscussion}
                onLockDiscussion={handleLockDiscussion}
                onEditDiscussion={handleEditClick}
                onDeleteDiscussion={handleDeleteClick}
                pagination={discussionsData?.pagination}
                onPageChange={setPage}
              />
            )}
          </div>
        )}

        {/* Create / Edit Discussion Composer Modal */}
        <DiscussionComposer
          isOpen={isComposerOpen}
          onClose={() => {
            setIsComposerOpen(false);
            setEditingDiscussion(null);
          }}
          onSubmit={handleComposerSubmit}
          initialData={editingDiscussion}
          courseId={selectedCourseId === 'all' ? availableCourses[0]?.id || 'general' : selectedCourseId}
          isSubmitting={
            createDiscussionMutation.isPending || updateDiscussionMutation.isPending
          }
        />
      </div>
    </>
  );
};

export default Discussions;
