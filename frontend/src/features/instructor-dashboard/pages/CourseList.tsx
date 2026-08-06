import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useInstructorCourses,
  useCreateCourse,
  useTogglePublishCourse,
  useDeleteCourse,
} from '../hooks/useInstructorDashboard';
import { InstructorCourse } from '../types';

export const CourseList: React.FC = () => {
  const { data: courses, isLoading, isError } = useInstructorCourses();
  const createCourseMutation = useCreateCourse();
  const togglePublishMutation = useTogglePublishCourse();
  const deleteCourseMutation = useDeleteCourse();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New course form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Software Engineering');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState(199);
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [newStatus, setNewStatus] = useState<'published' | 'draft'>('published');

  const filteredCourses = courses?.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createCourseMutation.mutate(
      {
        title: newTitle,
        category: newCategory,
        description: newDescription,
        price: Number(newPrice),
        thumbnail: newThumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        difficulty: newDifficulty,
        status: newStatus,
        totalModules: 8,
        enrolledStudents: 0,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setNewTitle('');
          setNewDescription('');
        },
      }
    );
  };

  const handleTogglePublish = (course: InstructorCourse) => {
    const targetStatus = course.status === 'published' ? 'draft' : 'published';
    togglePublishMutation.mutate({ id: course.id || course._id || '', status: targetStatus });
  };

  const handleDelete = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  return (
    <>
      <PageMeta title="Course Management | Instructor Portal" description="Manage instructor authored courses" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Course Catalog
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create, edit, publish, and manage all your authored course modules synchronized with MongoDB.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              + Create New Course
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search course title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                statusFilter === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              All ({courses?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                statusFilter === 'published'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              Published ({courses?.filter((c) => c.status === 'published').length || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                statusFilter === 'draft'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              Drafts ({courses?.filter((c) => c.status === 'draft').length || 0})
            </button>
          </div>
        </div>

        {/* Courses Table / Grid */}
        <ComponentCard title="Authored Courses" desc="Live synchronized courses from MongoDB">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading courses from database...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load courses.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Enrolled Students</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filteredCourses && filteredCourses.length > 0 ? (
                    filteredCourses.map((c) => (
                      <tr key={c.id || c._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {c.thumbnail && (
                              <img
                                src={c.thumbnail}
                                alt={c.title}
                                className="w-12 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{c.title}</div>
                              <div className="text-xs text-gray-400">{c.duration || '10 hours'} • {c.difficulty || 'intermediate'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge color={c.status === 'published' ? 'success' : 'warning'}>
                            {c.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          {(c.enrolledStudents || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                          ${c.price || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(c)}
                              className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              {c.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id || c._id || '')}
                              className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No courses found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Course</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Microservices Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Cloud & Architecture">Cloud & Architecture</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Databases">Databases</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Comprehensive description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newThumbnail}
                  onChange={(e) => setNewThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50"
                >
                  {createCourseMutation.isPending ? 'Saving...' : 'Save Course to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseList;
