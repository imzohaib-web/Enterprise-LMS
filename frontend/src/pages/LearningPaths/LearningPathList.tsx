import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { learningPathService } from '../../services/learningPath.service';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/auth/authSlice';
import type { LearningPath } from '../../types/learningPath';

const levelColors = {
  beginner:     { pill: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500', gradient: 'from-emerald-600 to-teal-700' },
  intermediate: { pill: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',   bar: 'bg-amber-500',   gradient: 'from-amber-600 to-orange-700' },
  advanced:     { pill: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',     bar: 'bg-rose-500',     gradient: 'from-rose-600 to-pink-700' },
};

const LearningPathList: React.FC = () => {
  const queryClient = useQueryClient();
  const userRole = useSelector(selectUserRole);
  const isAdmin = userRole === 'admin';
  const isInstructor = userRole === 'instructor';
  const isStudent = userRole === 'student';
  const canCreate = isAdmin || isInstructor;

  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['learning-paths', filter, search, userRole],
    queryFn: () =>
      learningPathService
        .listLearningPaths({
          level: filter === 'all' ? undefined : filter,
          search: search || undefined,
        })
        .then((r) => r.data.data),
    staleTime: 30 * 1000,
  });

  const paths: LearningPath[] = (data as any)?.paths ?? [];

  const enrollMutation = useMutation({
    mutationFn: (id: string) => learningPathService.enrollInLearningPath(id),
    onSuccess: () => {
      toast.success('Enrolled in learning path!');
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Enrollment failed'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Paths</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Structured curriculum roadmaps synchronized live with MongoDB.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/learning-paths/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Learning Path
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search path title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition"
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

        {/* Level filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition capitalize ${
                filter === l
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {l === 'all' ? 'All Paths' : l}
            </button>
          ))}
        </div>
      </div>

      {/* Content States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading learning paths from database...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 p-8 border border-rose-200 dark:border-rose-900/50 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
          <p className="text-base font-semibold text-rose-600 dark:text-rose-400">
            Failed to load learning paths: {(error as any)?.message || 'Server error'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition"
          >
            Retry Loading
          </button>
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-16 p-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold">
            🗺️
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Learning Paths Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            There are currently no learning paths matching your query. Paths created by Admins or assigned to your portal will appear here.
          </p>
          {canCreate && (
            <Link
              to="/learning-paths/new"
              className="inline-block px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              + Create First Learning Path
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paths.map((path) => {
            const colors = levelColors[path.level] || levelColors.intermediate;
            const createdDateStr = path.createdAt
              ? new Date(path.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'N/A';

            return (
              <div
                key={path._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Header Image or Gradient */}
                <div className="relative">
                  {path.thumbnail ? (
                    <img
                      src={path.thumbnail}
                      alt={path.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className={`bg-gradient-to-r ${colors.gradient} h-40 p-5 text-white relative overflow-hidden flex flex-col justify-between`}>
                      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                      <div className="absolute -right-2 top-8 w-12 h-12 rounded-full bg-white/10" />
                    </div>
                  )}

                  {/* Level Pill & Status Badge overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${colors.pill}`}>
                      {path.level}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      path.isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {path.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3 flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{path.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{path.description}</p>
                  </div>

                  {/* Course List */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                      <span>Assigned Courses</span>
                      <span>{path.courses?.length || 0} Total</span>
                    </div>
                    <ol className="space-y-1.5">
                      {path.courses && path.courses.length > 0 ? (
                        path.courses.slice(0, 3).map((pc, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${colors.bar}`}>
                              {pc.order + 1}
                            </span>
                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                              {typeof pc.course === 'object' && pc.course ? pc.course.title : 'Assigned Course'}
                              {!pc.isRequired && <span className="ml-1 text-[10px] text-gray-400">(optional)</span>}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-gray-400 italic">No courses assigned yet.</li>
                      )}
                      {path.courses && path.courses.length > 3 && (
                        <li className="text-[11px] text-gray-400 pl-6">+{path.courses.length - 3} additional courses</li>
                      )}
                    </ol>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div>{path.enrollmentCount || 0} enrolled</div>
                    <div className="text-[10px] text-gray-400">Created {createdDateStr}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/learning-paths/${path._id}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      View Path
                    </Link>
                    {isStudent && (
                      <button
                        onClick={() => enrollMutation.mutate(path._id)}
                        disabled={enrollMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningPathList;
