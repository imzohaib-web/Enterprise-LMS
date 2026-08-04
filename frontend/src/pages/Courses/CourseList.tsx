import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/course.service';
import CourseCard from '../../components/lms/CourseCard';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/auth/authSlice';

const LEVELS = ['', 'beginner', 'intermediate', 'advanced'];

const CourseList: React.FC = () => {
  const userRole = useSelector(selectUserRole);
  const isAdmin = userRole === 'admin';
  const isInstructor = userRole === 'instructor';
  const canCreate = isAdmin || isInstructor;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['courses', page, search, level, userRole],
    queryFn: () =>
      courseService.listCourses({
        page, limit: 12, search: search || undefined, level: level || undefined,
        status: canCreate ? undefined : 'published',
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: _categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.listCategories().then((r) => r.data),
  });

  const courses = (data?.data as any)?.courses ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meta?.total ?? 0} courses available</p>
        </div>
        {canCreate && (
          <Link
            to="/courses/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Course
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <select
          value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          {LEVELS.map((l) => <option key={l} value={l}>{l ? l.charAt(0).toUpperCase() + l.slice(1) : 'All Levels'}</option>)}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No courses found. {canCreate && <Link to="/courses/new" className="text-indigo-500 hover:underline">Create the first one!</Link>}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course: any) => (
            <CourseCard key={course._id} course={course} showActions={canCreate} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta.hasPrevPage}
            className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Prev
          </button>
          <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNextPage}
            className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseList;
