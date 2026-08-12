import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import { PageSkeleton } from '../components/SkeletonLoader';
import { learningPathService } from '../../../services/learningPath.service';
import type { LearningPath } from '../../../types/learningPath';

const levelColors: Record<string, string> = {
  beginner: 'text-emerald-600 dark:text-emerald-400',
  intermediate: 'text-amber-600 dark:text-amber-400',
  advanced: 'text-rose-600 dark:text-rose-400',
};

export const InstructorLearningPaths: React.FC = () => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructor', 'learning-paths', levelFilter, search],
    queryFn: () =>
      learningPathService
        .listLearningPaths({
          level: levelFilter === 'all' ? undefined : levelFilter,
          search: search || undefined,
          limit: 50,
        })
        .then((r) => r.data.data),
    staleTime: 30 * 1000,
  });

  const paths: LearningPath[] = (data as { paths?: LearningPath[] })?.paths ?? [];

  return (
    <>
      <PageMeta
        title="Learning Paths | Instructor Portal"
        description="View structured learning path sequences for your courses"
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Learning Paths
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Learning paths you authored, are assigned to, or are published across the platform.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
          <input
            type="text"
            placeholder="Search learning paths..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLevelFilter(level)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition ${
                  levelFilter === level
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {level === 'all' ? 'All' : level}
              </button>
            ))}
          </div>
        </div>

        <ComponentCard
          title="Curated Learning Pathways"
          desc={`${paths.length} learning path${paths.length === 1 ? '' : 's'} available`}
        >
          {isLoading ? (
            <PageSkeleton />
          ) : isError ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-rose-500">
                Failed to load learning paths: {(error as Error)?.message || 'Server error'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700"
              >
                Retry
              </button>
            </div>
          ) : paths.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              No learning paths found. Published platform paths and paths you are assigned to will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paths.map((lp) => (
                <div
                  key={lp._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xs font-bold uppercase tracking-wider ${levelColors[lp.level] || 'text-brand-600'}`}>
                        {lp.level}
                      </span>
                      <Badge color={lp.isPublished ? 'success' : 'warning'}>
                        {lp.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{lp.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {lp.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-gray-100 dark:border-gray-700/60 text-xs text-center">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{lp.courses?.length || 0}</div>
                      <div className="text-[10px] text-gray-400">Courses</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{lp.enrollmentCount || 0}</div>
                      <div className="text-[10px] text-gray-400">Enrollments</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Link
                      to={`/learning-paths/${lp._id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default InstructorLearningPaths;
