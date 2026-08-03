import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { learningPathService } from '../../services/learningPath.service';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/auth/authSlice';
import type { LearningPath } from '../../types/learningPath';

const levelColors = {
  beginner:     { pill: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  intermediate: { pill: 'bg-amber-100 text-amber-700',   bar: 'bg-amber-500',   gradient: 'from-amber-500 to-orange-600' },
  advanced:     { pill: 'bg-rose-100 text-rose-700',     bar: 'bg-rose-500',     gradient: 'from-rose-500 to-pink-600' },
};

const LearningPathList: React.FC = () => {
  const userRole = useSelector(selectUserRole);
  const isAdmin = userRole === 'admin';
  const isStudent = userRole === 'student';
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['learning-paths', filter],
    queryFn: () =>
      learningPathService.listLearningPaths({ level: filter === 'all' ? undefined : filter }).then((r) => r.data.data),
  });

  const paths: LearningPath[] = (data as any)?.paths ?? [];

  const enrollMutation = useMutation({
    mutationFn: (id: string) => learningPathService.enrollInLearningPath(id),
    onSuccess: () => { toast.success('Enrolled in learning path!'); refetch(); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Enrollment failed'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Paths</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Structured roadmaps to master new skills</p>
        </div>
        {isAdmin && (
          <Link to="/learning-paths/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Path
          </Link>
        )}
      </div>

      {/* Level filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition capitalize ${
              filter === l
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            {l === 'all' ? 'All Paths' : l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" /></div>
      ) : paths.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No learning paths found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paths.map((path) => {
            const colors = levelColors[path.level];
            return (
              <div key={path._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${colors.gradient} p-5 text-white relative overflow-hidden`}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute -right-2 top-8 w-12 h-12 rounded-full bg-white/10" />
                  <span className="relative z-10 px-2.5 py-0.5 text-xs font-semibold bg-white/20 rounded-full capitalize">{path.level}</span>
                  <h3 className="relative z-10 mt-3 text-lg font-bold leading-snug">{path.title}</h3>
                  <p className="relative z-10 mt-1 text-sm text-white/80 line-clamp-2">{path.description}</p>
                </div>

                {/* Course list */}
                <div className="p-5">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                    {path.courses.length} Courses
                  </p>
                  <ol className="space-y-2">
                    {path.courses.slice(0, 4).map((pc, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${colors.bar}`}>
                          {pc.order + 1}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {typeof pc.course === 'object' ? pc.course.title : 'Course'}
                          {!pc.isRequired && <span className="ml-1 text-xs text-gray-400">(optional)</span>}
                        </span>
                      </li>
                    ))}
                    {path.courses.length > 4 && (
                      <li className="text-xs text-gray-400 pl-7">+{path.courses.length - 4} more courses</li>
                    )}
                  </ol>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{path.enrollmentCount} enrolled</span>
                    <div className="flex gap-2">
                      <Link to={`/learning-paths/${path._id}`} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        View
                      </Link>
                      {isStudent && (
                        <button
                          onClick={() => enrollMutation.mutate(path._id)}
                          disabled={enrollMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
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
