import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getMyCertificates, generateCertificate } from '../../../services/certificateService';
import { ShootingStarIcon, ArrowRightIcon } from '../../../icons';

interface CourseCertificateTabProps {
  courseId: string;
  courseTitle: string;
  progress: any;
  onNavigateTab: (tab: string) => void;
}

export const CourseCertificateTab: React.FC<CourseCertificateTabProps> = ({
  courseId,
  courseTitle,
  progress,
  onNavigateTab,
}) => {
  const queryClient = useQueryClient();
  const progressPct = progress?.progressPercentage || 0;
  const isCompleted = progressPct >= 100 || progress?.completed;

  // Fetch student certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', courseId],
    queryFn: async () => {
      return await getMyCertificates();
    },
  });

  const courseCert = certificates.find((c: any) => {
    const certCourseId = typeof c.courseId === 'object' ? c.courseId?._id : c.courseId;
    return certCourseId === courseId;
  });

  // Generate Certificate mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      return await generateCertificate(courseId);
    },
    onSuccess: () => {
      toast.success('Certificate generated successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Certificate generation failed');
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-xs text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShootingStarIcon className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {courseTitle} Certificate
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Official certificate of completion awarded upon 100% course requirement fulfillment.
          </p>
        </div>

        {courseCert ? (
          <div className="p-6 border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Certificate Verified & Issued!</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Verification Code: <strong className="text-purple-600 font-mono">{courseCert.verificationCode}</strong>
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <a
                href={courseCert.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Download / View Certificate
              </a>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="p-6 border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl space-y-4">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Congratulations! You have completed 100% of this course.
            </p>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {generateMutation.isPending ? 'Generating Certificate...' : 'Claim Official Certificate'}
            </button>
          </div>
        ) : (
          <div className="p-6 border border-amber-100 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl space-y-3">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Certificate Locked ({progressPct}% completed)
            </p>
            <p className="text-2xs text-gray-500">
              Complete all lessons and required assessments in this course to earn your verified certificate.
            </p>
            <button
              onClick={() => onNavigateTab('content')}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Continue Lessons</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
