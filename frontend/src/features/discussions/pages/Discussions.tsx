import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useInstructorDiscussions,
  useReplyDiscussion,
  useUpdateDiscussionStatus,
} from '../../instructor-dashboard/hooks/useInstructorDashboard';

export const Discussions: React.FC = () => {
  const { data: discussions, isLoading, isError } = useInstructorDiscussions();
  const replyMutation = useReplyDiscussion();
  const updateStatusMutation = useUpdateDiscussionStatus();

  const [search, setSearch] = useState('');
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = discussions?.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.courseName.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleReplySubmit = (e: React.FormEvent, discussionId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    replyMutation.mutate(
      { discussionId, content: replyText },
      {
        onSuccess: () => {
          setReplyText('');
        },
      }
    );
  };

  const handleTogglePin = (discussionId: string, currentPinned: boolean) => {
    updateStatusMutation.mutate({
      discussionId,
      statusData: { isPinned: !currentPinned },
    });
  };

  const handleToggleLock = (discussionId: string, currentLocked: boolean) => {
    updateStatusMutation.mutate({
      discussionId,
      statusData: { isLocked: !currentLocked },
    });
  };

  return (
    <>
      <PageMeta
        title="Discussion Board & Community | Instructor Portal"
        description="Course discussion forums and student interactions"
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Course Discussion Forums
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Moderate topics, answer student questions, pin important announcements, and engage with your classes in real time.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search discussion topics or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Discussion List */}
        <ComponentCard title="Active Course Threads" desc="Real MongoDB discussion board">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading discussions...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load discussions.</div>
          ) : filtered && filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={d.authorAvatar || '/images/user/owner.jpg'}
                        alt={d.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base">{d.title}</h3>
                          {d.isPinned && <Badge color="warning">Pinned</Badge>}
                          {d.isLocked && <Badge color="error">Locked</Badge>}
                        </div>
                        <p className="text-xs text-gray-400">
                          Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{d.authorName}</span> in{' '}
                          <span className="text-brand-600 dark:text-brand-400">{d.courseName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(d.id, d.isPinned)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {d.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLock(d.id, d.isLocked)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {d.isLocked ? 'Unlock' : 'Lock'}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{d.content}</p>

                  {/* Tags */}
                  {d.tags && d.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {d.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reply Section Toggle */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      {d.repliesCount || 0} Instructor & Peer Replies
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveDiscussionId(activeDiscussionId === d.id ? null : d.id)}
                      className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                    >
                      {activeDiscussionId === d.id ? 'Hide Replies' : 'View & Reply'}
                    </button>
                  </div>

                  {/* Thread Replies */}
                  {activeDiscussionId === d.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      {d.replies && d.replies.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2 border-brand-500">
                          {d.replies.map((r: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                  {r.authorName}
                                  {r.isInstructor && (
                                    <span className="px-2 py-0.5 rounded bg-brand-500 text-white text-[10px] uppercase font-extrabold">
                                      Instructor
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{r.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {!d.isLocked && (
                        <form onSubmit={(e) => handleReplySubmit(e, d.id)} className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write an official instructor reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                          />
                          <button
                            type="submit"
                            disabled={replyMutation.isPending}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer"
                          >
                            Reply
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">No active discussion topics found.</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default Discussions;
