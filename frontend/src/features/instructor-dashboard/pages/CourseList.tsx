import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import { useInstructorCourses } from '../hooks/useInstructorDashboard';

export const CourseList: React.FC = () => {
  const { data: courses, isLoading, isError } = useInstructorCourses();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filteredCourses = courses?.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageMeta title="Course List | Instructor Dashboard" description="Manage instructor courses" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Course List
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View, filter, and manage all your authored course modules and curriculum content.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
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
              placeholder="Search courses or category..."
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
              Published ({courses?.filter(c => c.status === 'published').length || 0})
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
              Drafts ({courses?.filter(c => c.status === 'draft').length || 0})
            </button>
          </div>
        </div>

        {/* Courses Table / Grid */}
        <ComponentCard title="Authored Courses" desc="List of active curriculum modules">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading courses...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load courses.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Modules</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filteredCourses && filteredCourses.length > 0 ? (
                    filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                          {c.title}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge color={c.status === 'published' ? 'success' : 'warning'}>
                            {c.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                          {c.totalModules} Modules
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          {c.enrolledStudents.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-400">
                          {c.createdAt}
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
    </>
  );
};

export default CourseList;
