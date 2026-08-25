import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';
import { FileIcon, TimeIcon } from '../../../icons';

interface CourseAssignmentsTabProps {
  courseId: string;
  courseTitle: string;
}

export const CourseAssignmentsTab: React.FC<CourseAssignmentsTabProps> = ({
  courseId,
  courseTitle,
}) => {
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [textSubmission, setTextSubmission] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch assignments for this specific course
  const { data: assignments = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/assignments/course/${courseId}`);
      return res.data?.data || [];
    },
    enabled: Boolean(courseId),
  });

  // Submit assignment mutation
  const submitMutation = useMutation({
    mutationFn: async ({ assignmentId, text, file }: { assignmentId: string; text: string; file: File | null }) => {
      const formData = new FormData();
      formData.append('textSubmission', text);
      if (file) {
        formData.append('file', file);
      }
      const res = await axiosInstance.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Assignment submitted successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
      setSelectedAssignment(null);
      setTextSubmission('');
      setSelectedFile(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Submission failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!textSubmission.trim() && !selectedFile) {
      toast.error('Please attach a file or type a text response.');
      return;
    }
    submitMutation.mutate({
      assignmentId: selectedAssignment.id || selectedAssignment._id,
      text: textSubmission,
      file: selectedFile,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {courseTitle} — Assignments
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Practical projects and submitted homework assignments for this course.
          </p>
        </div>
        <div className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-xl">
          {assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'} Total
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-3">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
            Failed to load assignments. {(error as any)?.message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Assignments List */}
      {!isLoading && !isError && (
        <>
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((asgn: any) => {
                const sub = asgn.studentSubmission;
                const isSubmitted = Boolean(sub);
                const isGraded = sub?.status === 'graded';

                return (
                  <div
                    key={asgn.id || asgn._id}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            {asgn.title}
                          </h4>
                          {isGraded ? (
                            <span className="px-2.5 py-0.5 text-2xs font-bold bg-emerald-100 text-emerald-700 rounded-full">
                              Graded: {sub.score} / {asgn.maxScore}
                            </span>
                          ) : isSubmitted ? (
                            <span className="px-2.5 py-0.5 text-2xs font-bold bg-blue-100 text-blue-700 rounded-full">
                              Submitted
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-2xs font-bold bg-amber-100 text-amber-700 rounded-full">
                              Pending Submission
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {asgn.description || asgn.instructions}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedAssignment(asgn);
                          setTextSubmission(sub?.textSubmission || '');
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                          isSubmitted
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {isSubmitted ? 'View Submission / Resubmit' : 'Submit Assignment'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1">
                        <TimeIcon className="w-3.5 h-3.5" />
                        <span>Due: {asgn.dueDate ? new Date(asgn.dueDate).toLocaleDateString() : 'No deadline'}</span>
                      </div>
                      <div>Max Marks: <strong>{asgn.maxScore}</strong></div>
                      {sub?.feedback && (
                        <div className="text-emerald-600 font-semibold">
                          Instructor Feedback: "{sub.feedback}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400 space-y-2">
              <FileIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                No assignments assigned for this course yet.
              </p>
            </div>
          )}
        </>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Submit: {selectedAssignment.title}
              </h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Text Response / Notes
                </label>
                <textarea
                  rows={4}
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Type your submission response or comments..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Upload File (PDF, DOCX, ZIP, Image, TXT)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
