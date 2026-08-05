import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageMeta from '../../components/common/PageMeta';
import { learningPathService } from '../../services/learningPath.service';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/auth/authSlice';

export const LearningPathDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const userRole = useSelector(selectUserRole);
  const isStudent = userRole === 'student';

  const pathId = id || '';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['learning-path-detail', pathId],
    queryFn: () => learningPathService.getLearningPathById(pathId).then((r) => r.data?.data?.path),
    enabled: Boolean(pathId),
  });

  const enrollMutation = useMutation({
    mutationFn: () => learningPathService.enrollInLearningPath(id!),
    onSuccess: () => {
      toast.success('Successfully enrolled in learning path!');
      queryClient.invalidateQueries({ queryKey: ['learning-path-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Enrollment failed');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-rose-50 dark:bg-rose-950/30 rounded-3xl border border-rose-200">
        <h2 className="text-lg font-bold text-rose-700">Learning Path Not Found</h2>
        <p className="text-xs text-rose-600 mt-1">{error?.message || 'The requested learning path does not exist.'}</p>
        <Link to="/learning-paths" className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl">
          Back to Learning Paths
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`${data.title} | Learning Path`} description={data.description || ''} />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation back */}
        <Link to="/learning-paths" className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to All Learning Paths
        </Link>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
          <div className="relative z-10 space-y-3">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/20 rounded-full backdrop-blur-xs">
              {data.level} Level Roadmap
            </span>
            <h1 className="text-3xl font-extrabold">{data.title}</h1>
            <p className="text-sm text-indigo-100 leading-relaxed max-w-2xl">{data.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg font-semibold">{data.courses?.length || 0} Courses Included</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg font-semibold">{data.estimatedHours || 20} Hours Total</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg font-semibold">{data.enrollmentCount || 0} Students Enrolled</span>
            </div>
          </div>
        </div>

        {/* Course Sequence List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Curriculum Roadmap</h2>
            {isStudent && (
              <button
                type="button"
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
              >
                {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Path'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {data.courses?.map((item: any, index: number) => {
              const course = typeof item.course === 'object' ? item.course : null;
              return (
                <div key={index} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {course?.title || 'Course Module'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {course?.shortDesc || course?.description || 'Comprehensive module included in learning path.'}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <span className="capitalize bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-semibold">{course?.level || 'Intermediate'}</span>
                      {item.isRequired ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">Required Module</span>
                      ) : (
                        <span className="text-gray-400 font-medium">Optional Elective</span>
                      )}
                    </div>
                  </div>
                  {course && (
                    <Link
                      to={`/courses/${course._id}`}
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Course
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningPathDetail;
