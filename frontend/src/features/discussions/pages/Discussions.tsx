import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useInstructorDiscussions,
  useInstructorCourses,
  useCreateDiscussion,
  useUpdateDiscussion,
  useDeleteDiscussion,
  useToggleLikeDiscussion,
  useReplyDiscussion,
  useUpdateDiscussionStatus,
} from '../../instructor-dashboard/hooks/useInstructorDashboard';

export const Discussions: React.FC = () => {
  const { data: discussions, isLoading, isError, error, refetch } = useInstructorDiscussions();
  const { data: courses } = useInstructorCourses();

  const createMutation = useCreateDiscussion();
  const updateMutation = useUpdateDiscussion();
  const deleteMutation = useDeleteDiscussion();
  const likeMutation = useToggleLikeDiscussion();
  const replyMutation = useReplyDiscussion();
  const updateStatusMutation = useUpdateDiscussionStatus();

  const [search, setSearch] = useState('');
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Modal State for Start/Edit Discussion
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const courseList = Array.isArray(courses) ? courses : (courses as any)?.courses || [];

  const handleOpenCreateModal = () => {
    setEditingDiscussion(null);
    setTitle('');
    setContent('');
    setCourseId(courseList[0]?.id || courseList[0]?._id || '');
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d: any) => {
    setEditingDiscussion(d);
    setTitle(d.title || '');
    setContent(d.content || '');
    setCourseId(d.courseId || '');
    setTagsInput(d.tags ? d.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const payload = {
      title,
      content,
      courseId: courseId || undefined,
      tags,
    };

    if (editingDiscussion) {
      updateMutation.mutate(
        { id: editingDiscussion.id || editingDiscussion._id, discussionData: payload },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this discussion thread from MongoDB?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleLike = (id: string) => {
    likeMutation.mutate(id);
  };

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

  const filtered = (discussions || []).filter(
    (d: any) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.courseName.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
  );

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
              Start new discussion topics, answer student queries, pin announcements, and moderate your classes in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search topics or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer shadow-sm"
            >
              + Start Discussion
            </button>
          </div>
        </div>

        {/* Discussion List */}
        <ComponentCard title="Active Course Threads" desc="Connected to MongoDB backend database">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
              <p className="text-sm text-gray-500">Loading discussions from MongoDB...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                Failed to load discussions: {(error as any)?.message || 'Server error'}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Retry Loading
              </button>
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((d: any) => (
                <div
                  key={d.id || d._id}
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
                        <p className="text-xs text-gray-400 mt-0.5">
                          Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{d.authorName}</span> in{' '}
                          <span className="text-brand-600 dark:text-brand-400 font-medium">{d.courseName}</span> • {d.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(d.id || d._id)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                          d.isLikedByMe
                            ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        ❤️ {d.likesCount || 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(d.id || d._id, d.isPinned)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {d.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLock(d.id || d._id, d.isLocked)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {d.isLocked ? 'Unlock' : 'Lock'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(d)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg border border-brand-300 text-brand-600 hover:bg-brand-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id || d._id)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{d.content}</p>

                  {/* Tags */}
                  {d.tags && d.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {d.tags.map((tag: string, idx: number) => (
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
                      {d.repliesCount || (d.replies ? d.replies.length : 0)} Instructor & Peer Replies
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveDiscussionId(activeDiscussionId === (d.id || d._id) ? null : (d.id || d._id))}
                      className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                    >
                      {activeDiscussionId === (d.id || d._id) ? 'Hide Replies' : 'View & Reply'}
                    </button>
                  </div>

                  {/* Thread Replies */}
                  {activeDiscussionId === (d.id || d._id) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      {d.replies && d.replies.length > 0 ? (
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
                      ) : (
                        <div className="text-xs text-gray-400 italic py-1">No replies yet. Be the first to answer!</div>
                      )}

                      {!d.isLocked ? (
                        <form onSubmit={(e) => handleReplySubmit(e, d.id || d._id)} className="flex items-center gap-2 pt-2">
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
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer disabled:opacity-50"
                          >
                            {replyMutation.isPending ? 'Posting...' : 'Reply'}
                          </button>
                        </form>
                      ) : (
                        <div className="text-xs font-semibold text-rose-500 pt-1">
                          🔒 This discussion thread has been locked by the instructor.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto text-xl font-bold">
                💬
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No Discussion Topics</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  Start a new topic to interact with students enrolled in your courses.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                + Start Discussion
              </button>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Start / Edit Discussion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingDiscussion ? 'Edit Discussion Thread' : 'Start New Discussion'}
            </h2>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guidance on Module 3 Microservices Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                >
                  <option value="">General (All Assigned Courses)</option>
                  {courseList.map((c: any) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Content / Announcement</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the topic or ask your students a question..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Nodejs, Express, Architecture"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Publish to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Discussions;
