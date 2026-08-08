import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import api from '../../../services/api';
import { getMyCertificates } from '../../../services/certificateService';
import { getCourseLearnRoute } from '../../../constants/routes';


export const StudentProgress: React.FC = () => {
  // 1. Fetch Real Student Progress records from MongoDB
  const { data: progressList = [], isLoading: isProgressLoading } = useQuery({
    queryKey: ['studentProgressPage'],
    queryFn: async () => {
      const res = await api.get('/progress/student');
      return res.data?.data?.progress || [];
    },
  });

  // 2. Fetch Earned Certificates
  const { data: certificates = [], isLoading: isCertificatesLoading } = useQuery({
    queryKey: ['studentCertificatesProgress'],
    queryFn: async () => {
      return await getMyCertificates();
    },
  });

  const isLoading = isProgressLoading || isCertificatesLoading;

  // Compute Metrics from Real Data
  const totalCourses = progressList.length;
  const completedCourses = progressList.filter((p: any) => p.completed || p.progressPercentage === 100).length;
  const activeCourses = totalCourses - completedCourses;

  const totalLessonsCompleted = progressList.reduce((acc: number, p: any) => acc + (p.completedLessons?.length || 0), 0);
  const totalQuizzesCompleted = progressList.reduce((acc: number, p: any) => acc + (p.completedQuizzes?.length || 0), 0);

  const avgCompletionPercentage =
    totalCourses > 0
      ? Math.round(progressList.reduce((acc: number, p: any) => acc + (p.progressPercentage || 0), 0) / totalCourses)
      : 0;

  const quizScores = progressList.flatMap((p: any) => p.quizScores || []);
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((acc: number, q: any) => acc + (q.percentage || 0), 0) / quizScores.length)
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Student Learning Progress | Enterprise LMS"
        description="Comprehensive analytics on overall completion rate, lesson progress, quiz scores, and certificates."
      />

      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-6 md:p-8 rounded-3xl text-white shadow-md">
          <h1 className="text-2xl md:text-3xl font-extrabold">Learning Analytics & Progress</h1>
          <p className="text-sm text-brand-100 mt-1 max-w-xl">
            Real-time synchronization of your course completion milestones, quiz scores, and verified achievements.
          </p>
        </div>

        {/* Core KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
            <span className="block text-3xl font-black text-brand-600 dark:text-brand-400">{avgCompletionPercentage}%</span>
            <span className="text-xs text-gray-500 font-semibold uppercase">Overall Completion</span>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${avgCompletionPercentage}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
            <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-400">{completedCourses} / {totalCourses}</span>
            <span className="text-xs text-gray-500 font-semibold uppercase">Completed Courses</span>
            <p className="text-xs text-gray-400 mt-2">{activeCourses} Active In Progress</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
            <span className="block text-3xl font-black text-purple-600 dark:text-purple-400">{totalLessonsCompleted}</span>
            <span className="text-xs text-gray-500 font-semibold uppercase">Lessons Completed</span>
            <p className="text-xs text-gray-400 mt-2">{totalQuizzesCompleted} Quizzes Attempted</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
            <span className="block text-3xl font-black text-amber-500">{certificates.length}</span>
            <span className="text-xs text-gray-500 font-semibold uppercase">Earned Certificates</span>
            <p className="text-xs text-gray-400 mt-2">Avg Quiz Score: {avgQuizScore}%</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Course Progress List */}
          <ComponentCard title="Course Progress Breakdown" desc="Individual course progress percentage">
            {progressList.length > 0 ? (
              <div className="space-y-4">
                {progressList.map((item: any, idx: number) => {
                  const courseObj = item.courseId;
                  const cId = typeof courseObj === 'object' ? courseObj?._id : courseObj;
                  const courseTitle = (typeof courseObj === 'object' ? courseObj?.title : null) || item.courseTitle || `Course Module #${idx + 1}`;
                  const pct = item.progressPercentage || 0;
                  return (
                    <div key={item.id || item._id || idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                        {cId ? (
                          <Link to={getCourseLearnRoute(cId)} className="truncate max-w-[240px] hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            {courseTitle}
                          </Link>
                        ) : (
                          <span className="truncate max-w-[240px]">{courseTitle}</span>
                        )}
                        <span className="text-brand-600 font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            pct === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-2xs text-gray-400">
                        <span>{item.completedLessons?.length || 0} lessons done</span>
                        {cId && (
                          <Link to={getCourseLearnRoute(cId)} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            {pct === 100 ? 'Review Course →' : 'Continue Learning →'}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                No active course progress recorded yet. Enroll in courses to start tracking progress.
              </div>
            )}
          </ComponentCard>

          {/* Activity Timeline */}
          <ComponentCard title="Recent Learning Activity" desc="Last recorded milestones">
            {progressList.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                {progressList.map((item: any, idx: number) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 border-brand-500 bg-white dark:bg-gray-900 group-hover:bg-brand-500 transition-colors" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {item.courseId?.title || 'Course Activity'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Progress updated to {item.progressPercentage}% &bull; {item.completedLessons?.length || 0} lessons completed
                    </p>
                    <span className="text-2xs text-gray-400 block mt-1">
                      {item.lastActivity ? new Date(item.lastActivity).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                No recent activity logged.
              </div>
            )}
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default StudentProgress;
