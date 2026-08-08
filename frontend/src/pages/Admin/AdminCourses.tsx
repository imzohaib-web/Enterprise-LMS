import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { courseService } from '../../services/course.service';
import type { Course, CourseStatus } from '../../types/course';

const STATUS_TABS: { label: string; value: string; badgeColor: string }[] = [
  { label: 'All Courses', value: 'all', badgeColor: 'bg-gray-100 text-gray-700' },
  { label: 'Pending Approval', value: 'pending_approval', badgeColor: 'bg-amber-100 text-amber-800' },
  { label: 'Published', value: 'published', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { label: 'Drafts', value: 'draft', badgeColor: 'bg-gray-100 text-gray-800' },
  { label: 'Archived', value: 'archived', badgeColor: 'bg-rose-100 text-rose-800' },
  { label: 'Featured Only', value: 'featured', badgeColor: 'bg-purple-100 text-purple-800' },
];

const statusBadgeStyle: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  archived: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
};

const AdminCourses: React.FC = () => {
  const queryClient = useQueryClient();

  // ── Filters & Pagination State ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  // ── Modal & Drawer States ──────────────────────────────────────────────────
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [rejectingCourse, setRejectingCourse] = useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // ── 1. Fetch Categories for Dropdown ───────────────────────────────────────
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.listCategories().then((r) => r.data),
  });
  const categoriesList = (categoriesRes?.data as any)?.categories ?? [];

  // ── 2. Fetch Courses Query ──────────────────────────────────────────────────
  const isFeaturedFilter = activeTab === 'featured' ? true : undefined;
  const statusParam = activeTab === 'featured' || activeTab === 'all' ? 'all' : activeTab;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-courses', page, limit, search, levelFilter, categoryFilter, activeTab, sortBy],
    queryFn: () =>
      courseService
        .listCourses({
          page,
          limit,
          search: search.trim() || undefined,
          level: levelFilter || undefined,
          category: categoryFilter || undefined,
          status: statusParam,
          isFeatured: isFeaturedFilter,
          sortBy: sortBy as any,
          order: 'desc',
        } as any)
        .then((r) => r.data),
  });

  const rawCourses = (data?.data as any)?.courses ?? [];
  const courses: Course[] = Array.isArray(rawCourses) ? rawCourses : [];
  const meta = data?.meta ?? { total: courses.length, page: 1, totalPages: 1 };

  // ── 3. Mutations for Moderation Actions ───────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, isFeatured }: { id: string; status?: CourseStatus; isFeatured?: boolean }) =>
      courseService.updateCourse(id, { status, isFeatured } as any),
    onSuccess: (_, vars) => {
      if (vars.status) toast.success(`Course status updated to ${vars.status.replace('_', ' ').toUpperCase()}`);
      if (typeof vars.isFeatured === 'boolean') toast.success(`Course ${vars.isFeatured ? 'marked as Featured ⭐' : 'unfeatured'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => toast.error('Failed to update course moderation status'),
  });

  const duplicateCourseMutation = useMutation({
    mutationFn: async (course: Course) => {
      const payload = {
        title: `Copy of ${course.title}`,
        description: course.description,
        shortDesc: course.shortDesc,
        level: course.level,
        language: course.language,
        price: course.price,
        isFree: course.isFree,
        tags: course.tags,
        learningOutcomes: course.learningOutcomes,
        requirements: course.requirements,
      };
      const res = await courseService.createCourse(payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Course duplicated as draft copy');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: () => toast.error('Failed to duplicate course'),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      toast.success('Course deleted permanently');
      setDeletingCourse(null);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: () => toast.error('Failed to delete course'),
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'published' });
  };

  const handleConfirmReject = () => {
    if (!rejectingCourse) return;
    updateStatusMutation.mutate({ id: rejectingCourse._id, status: 'rejected' });
    toast.success(`Course "${rejectingCourse.title}" rejected`);
    setRejectingCourse(null);
    setRejectionReason('');
  };

  const handleToggleFeatured = (course: Course) => {
    updateStatusMutation.mutate({ id: course._id, isFeatured: !course.isFeatured });
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <PageBreadcrumb pageTitle="Admin Course Moderation & Management" />
        </div>
        <Link
          to="/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-xs -mt-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create New Course
        </Link>
      </div>

      {/* Moderation Workflow Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setPage(1); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3 shadow-sm items-center">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by course title or keywords..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>

        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
        >
          <option value="">All Difficulty Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
        >
          <option value="">All Categories</option>
          {categoriesList.map((cat: any) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
        >
          <option value="createdAt">Newest First</option>
          <option value="enrollmentCount">Highest Enrollments</option>
          <option value="averageRating">Highest Rated</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* Main Course Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            <p className="text-xs text-gray-400 font-medium">Loading course registry...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            Failed to load courses. <button onClick={() => refetch()} className="underline ml-2">Retry</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {['Course Details', 'Instructor', 'Category / Level', 'Status', 'Enrollments', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              LMS
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setDetailCourse(course)}
                                className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 text-left transition"
                              >
                                {course.title}
                              </button>
                              {course.isFeatured && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-full">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{course.isFree ? 'Free Course' : `$${course.price}`}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {course.instructor ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}` : 'Unassigned'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {course.category?.name || 'Uncategorized'}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">{course.level}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusBadgeStyle[course.status] || ''}`}>
                          {course.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {course.enrollmentCount ?? 0} enrolled
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {course.status === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => handleApprove(course._id)}
                                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingCourse(course)}
                                className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {course.status === 'draft' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: course._id, status: 'published' })}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                            >
                              Publish
                            </button>
                          )}

                          {course.status === 'published' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: course._id, status: 'draft' })}
                              className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"
                            >
                              Unpublish
                            </button>
                          )}

                          {course.status !== 'archived' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: course._id, status: 'archived' })}
                              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition"
                            >
                              Archive
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleFeatured(course)}
                            title="Toggle Featured status"
                            className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
                              course.isFeatured ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            ⭐
                          </button>

                          <button
                            onClick={() => duplicateCourseMutation.mutate(course)}
                            title="Duplicate Course"
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition"
                          >
                            📋
                          </button>

                          <Link
                            to={`/courses/${course._id}/builder`}
                            className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                          >
                            Builder
                          </Link>

                          <button
                            onClick={() => setDeletingCourse(course)}
                            className="px-2 py-1 text-xs font-medium bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No courses found matching selected tab or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 gap-4">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Showing Page {meta.page} of {meta.totalPages || 1} ({meta.total} courses)</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={30}>30 per page</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="px-3.5 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="px-3.5 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── COURSE DETAILS DRAWER ────────────────────────────────────────────── */}
      {detailCourse && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg h-full shadow-2xl p-6 flex flex-col justify-between space-y-4 border-l border-gray-100 dark:border-gray-800 overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Course Overview & Moderation</h3>
                <button onClick={() => setDetailCourse(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
              </div>
              <div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${statusBadgeStyle[detailCourse.status]}`}>
                  {detailCourse.status.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{detailCourse.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{detailCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-400 block">Instructor</span>
                  <span className="font-bold text-gray-900 dark:text-white">{detailCourse.instructor?.firstName} {detailCourse.instructor?.lastName}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-400 block">Enrollments</span>
                  <span className="font-bold text-indigo-600">{detailCourse.enrollmentCount || 0} students</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-400 block">Pricing</span>
                  <span className="font-bold text-gray-900 dark:text-white">{detailCourse.isFree ? 'Free' : `$${detailCourse.price}`}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-400 block">Difficulty Level</span>
                  <span className="font-bold text-gray-900 dark:text-white capitalize">{detailCourse.level}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <Link to={`/courses/${detailCourse._id}/builder`} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl">
                Open Course Builder
              </Link>
              <button onClick={() => setDetailCourse(null)} className="px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT COURSE MODAL ──────────────────────────────────────────────── */}
      {rejectingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Reject Course Submission</h3>
            <p className="text-xs text-gray-500">Provide feedback for instructor regarding why "{rejectingCourse.title}" is rejected.</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete video lessons or missing assessment quizzes..."
              className="w-full p-3 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectingCourse(null)} className="px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl">Cancel</button>
              <button onClick={handleConfirmReject} className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE COURSE MODAL ──────────────────────────────────────────────── */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Course Permanently</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete course <strong className="text-gray-800 dark:text-gray-200">{deletingCourse.title}</strong>? All sections, lessons, and enrollment records will be permanently removed.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setDeletingCourse(null)} className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl">Cancel</button>
              <button onClick={() => deleteCourseMutation.mutate(deletingCourse._id)} disabled={deleteCourseMutation.isPending} className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition">
                {deleteCourseMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
