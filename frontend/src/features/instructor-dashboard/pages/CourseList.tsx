import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import ThumbnailUploader from '../../../components/lms/ThumbnailUploader';
import { courseService } from '../../../services/course.service';
import { TableSkeleton } from '../components/SkeletonLoader';
import {
  useInstructorCourses,
  useCreateCourse,
  useTogglePublishCourse,
  useSubmitCourseForReview,
  useDeleteCourse,
} from '../hooks/useInstructorDashboard';
import { InstructorCourse } from '../types';

export const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'students' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const { data: coursesData, isLoading, isError, refetch } = useInstructorCourses({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const createCourseMutation = useCreateCourse();
  const togglePublishMutation = useTogglePublishCourse();
  const submitReviewMutation = useSubmitCourseForReview();
  const deleteCourseMutation = useDeleteCourse();

  // Multi-select bulk state & form validation state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ title?: string; price?: string }>({});

  // Create course modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Software Engineering');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | undefined>();
  const [newDifficulty, setNewDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [newStatus, setNewStatus] = useState<'published' | 'draft'>('draft');

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCourses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCourses.map((c) => c.id || c._id || ''));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected course(s)?`)) {
      selectedIds.forEach((id) => deleteCourseMutation.mutate(id));
      setSelectedIds([]);
    }
  };

  const coursesList = useMemo(() => {
    const dataObj = coursesData as any;
    let list: InstructorCourse[] = Array.isArray(dataObj)
      ? dataObj
      : dataObj?.courses || [];

    // Local sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'students') {
        return (b.enrolledStudents || 0) - (a.enrolledStudents || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });
  }, [coursesData, sortBy]);

  // Paginated records
  const totalPages = Math.ceil(coursesList.length / itemsPerPage) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return coursesList.slice(start, start + itemsPerPage);
  }, [coursesList, page, itemsPerPage]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; price?: string } = {};

    if (!newTitle.trim()) {
      errors.title = 'Course title is required';
    } else if (newTitle.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    }

    if (newPrice < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

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
        onSuccess: async (data: any) => {
          setIsCreateModalOpen(false);
          setNewTitle('');
          setNewDescription('');
          setNewThumbnail('');
          const createdId = data?.id || data?._id;
          if (createdId && newThumbnailFile) {
            try {
              await courseService.uploadThumbnail(createdId, newThumbnailFile);
            } catch {
              /* ignore thumbnail upload error */
            }
          }
          if (createdId) {
            navigate(`/courses/${createdId}/builder`);
          }
        },
      }
    );
  };

  const handleTogglePublish = (course: InstructorCourse) => {
    const targetStatus = course.status === 'published' ? 'draft' : 'published';
    togglePublishMutation.mutate({ id: course.id || course._id || '', status: targetStatus });
  };

  const handleDelete = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course from MongoDB?')) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  return (
    <>
      <PageMeta title="Authored Course Catalog | Instructor Portal" description="Manage instructor authored courses" />

      <div className="space-y-6">
        {/* Top Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Course Catalog
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time course management synchronized directly with MongoDB. Filter, publish, edit, or delete your authored courses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Course
            </button>
          </div>
        </div>

        {/* Filters, Search & Layout Controls */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative w-full lg:w-96">
              <input
                type="text"
                placeholder="Search by course title or category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-900 transition"
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

            {/* Dropdown Filters & Sorting */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Categories</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cloud & Architecture">Cloud & Architecture</option>
                <option value="DevOps">DevOps</option>
                <option value="Databases">Databases</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="newest">Sort: Newest Created</option>
                <option value="title">Sort: Title (A-Z)</option>
                <option value="students">Sort: Most Enrolled</option>
                <option value="rating">Sort: Highest Rated</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Table View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Grid Cards View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Courses ({coursesList.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('published');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('draft');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Content Section */}
        <ComponentCard title="MongoDB Synchronized Catalog" desc={`Showing ${paginatedCourses.length} of ${coursesList.length} total authored courses`}>
          {/* Floating Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="mb-4 p-3 bg-brand-500 text-white rounded-xl flex items-center justify-between shadow-md">
              <div className="text-xs font-semibold">
                {selectedIds.length} course(s) selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Delete Selected ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : isError ? (
            <div className="py-12 text-center space-y-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                Failed to fetch course catalog from database.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Retry Request
              </button>
            </div>
          ) : coursesList.length === 0 ? (
            <div className="py-16 text-center space-y-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto text-xl font-bold">
                📚
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No Assigned Courses Found</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  You have not authored any courses matching your criteria yet. Courses created by you or assigned by Admin will appear here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                + Create Your First Course
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={paginatedCourses.length > 0 && selectedIds.length === paginatedCourses.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Thumbnail & Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Lessons</th>
                    <th className="py-3 px-4">Assessments</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {paginatedCourses.map((c) => {
                    const cid = c.id || c._id || '';
                    const isSelected = selectedIds.includes(cid);
                    return (
                      <tr key={cid} className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-brand-50/40 dark:bg-brand-900/10' : ''}`}>
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(cid)}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Link to={`/courses/${cid}`}>
                            <img
                              src={c.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
                              alt={c.title}
                              className="w-14 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-sm hover:opacity-80 transition"
                            />
                          </Link>
                          <div>
                            <Link to={`/courses/${cid}`} className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition line-clamp-1">
                              {c.title}
                            </Link>
                            <div className="text-xs text-gray-400">{c.duration || '10 hours'} • {c.difficulty || 'intermediate'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                        {c.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1 ${
                            c.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : c.status === 'pending_approval' || c.status === 'under_review'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                              : c.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {c.status === 'published' && 'Published'}
                          {(c.status === 'pending_approval' || c.status === 'under_review') && '⏳ Under Review'}
                          {c.status === 'rejected' && '❌ Rejected'}
                          {c.status === 'draft' && 'Draft'}
                          {c.status === 'archived' && 'Archived'}
                        </span>
                        {c.status === 'rejected' && (c as any).rejectionReason && (
                          <div className="text-[10px] text-rose-500 mt-1 max-w-xs line-clamp-1" title={(c as any).rejectionReason}>
                            Reason: {(c as any).rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                        {(c.enrolledStudents || c.enrolledStudentsCount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                        {c.lessonsCount !== undefined ? c.lessonsCount : c.totalModules || 0} Lessons
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                        {c.assessmentsCount || 0} Quizzes
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {c.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/courses/${cid}`}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400"
                            title="View Course Details & Preview Syllabus"
                          >
                            View
                          </Link>
                          <Link
                            to={`/courses/${cid}/builder`}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                          >
                            Edit
                          </Link>
                          {(c.status === 'draft' || c.status === 'rejected') && (
                            <button
                              type="button"
                              onClick={() => {
                                submitReviewMutation.mutate(cid, {
                                  onSuccess: () => toast.success('Course submitted for Admin review!'),
                                  onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit course'),
                                });
                              }}
                              disabled={submitReviewMutation.isPending}
                              className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer"
                            >
                              Submit for Review
                            </button>
                          )}
                          {(c.status === 'pending_approval' || c.status === 'under_review') && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              In Review
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(cid)}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedCourses.map((c) => {
                const cid = c.id || c._id || '';
                return (
                  <div
                    key={cid}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div className="relative">
                      <Link to={`/courses/${cid}`}>
                        <img
                          src={c.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
                          alt={c.title}
                          className="w-full h-36 object-cover hover:opacity-90 transition"
                        />
                      </Link>
                      <div className="absolute top-2 right-2">
                        <Badge color={c.status === 'published' ? 'success' : 'warning'}>
                          {c.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1">
                      <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        {c.category}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                        <Link to={`/courses/${cid}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                          {c.title}
                        </Link>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div>👥 {c.enrolledStudents || 0} Students</div>
                        <div>📖 {c.lessonsCount || c.totalModules || 0} Lessons</div>
                        <div>📝 {c.assessmentsCount || 0} Assessments</div>
                        <div>📅 {c.createdAt}</div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex flex-wrap items-center justify-between gap-1.5 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                      <Link
                        to={`/courses/${cid}`}
                        className="flex-1 py-1.5 px-2 text-xs font-semibold text-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400"
                        title="View Details"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/courses/${cid}/builder`}
                        className="flex-1 py-1.5 px-2 text-xs font-semibold text-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(c)}
                        className="flex-1 py-1.5 px-2 text-xs font-medium text-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {c.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cid)}
                        className="px-2 py-1.5 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages} ({coursesList.length} items total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
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
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Microservices Architecture"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (formErrors.title) setFormErrors({ ...formErrors, title: undefined });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white ${
                    formErrors.title ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 dark:border-gray-700 focus:ring-brand-500'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.title}</p>
                )}
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
                  placeholder="Comprehensive course description..."
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

              <div className="pt-1">
                <ThumbnailUploader
                  value={newThumbnail}
                  onChange={(url, file) => {
                    setNewThumbnail(url);
                    setNewThumbnailFile(file);
                  }}
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
