import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Lesson } from '../../types/course';
import VideoLesson from './VideoLesson';
import DocumentLesson from './DocumentLesson';
import TextLesson from './TextLesson';
import { assessmentApi } from '../assessments/api/assessmentApi';
import api from '../../services/api';

interface LessonViewerProps {
  lesson: Lesson | null;
  courseId?: string;
}

const QuizLessonView: React.FC<{ lesson: Lesson; courseId?: string }> = ({ lesson, courseId }) => {
  const navigate = useNavigate();
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['lessonQuizzes', courseId || lesson._id],
    queryFn: () => assessmentApi.getQuizzes(courseId),
  });

  const matchingQuiz = quizzes.find(
    (q) =>
      q.lessonId === lesson._id ||
      q._id === lesson._id ||
      q.id === lesson._id ||
      q.title.toLowerCase() === lesson.title.toLowerCase()
  ) || quizzes[0];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
            Knowledge Assessment
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{lesson.title}</h2>
        </div>
      </div>

      {lesson.content && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {lesson.content}
        </div>
      )}

      {isLoading ? (
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      ) : matchingQuiz ? (
        <div className="p-6 border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{matchingQuiz.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{matchingQuiz.description || 'Test your knowledge on this module.'}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-full w-fit">
              {matchingQuiz.questions?.length || 0} Questions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-amber-100 dark:border-amber-900/30">
            <div>⏱️ Time Limit: <strong>{matchingQuiz.timeLimitMinutes || 30} mins</strong></div>
            <div>🎯 Passing Score: <strong>{matchingQuiz.passingScore || 70}%</strong></div>
            <div>🔄 Attempts: <strong>Allowed</strong></div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate(`/student/assessments/${matchingQuiz._id || matchingQuiz.id}/take`)}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              Start Quiz Assessment &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl text-center space-y-3">
          <p className="text-xs text-gray-500">No specific quiz linked to this lesson yet.</p>
          <button
            onClick={() => navigate('/student/assessments')}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Browse Course Quizzes &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

const AssignmentLessonView: React.FC<{ lesson: Lesson; courseId?: string }> = ({ lesson, courseId }) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assignments = [], refetch } = useQuery({
    queryKey: ['courseAssignments', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const res = await api.get(`/assignments/course/${courseId}`);
      return res.data?.data || [];
    },
    enabled: Boolean(courseId),
  });

  const matchingAssignment = (assignments || []).find(
    (a: any) =>
      a.lessonId === lesson._id ||
      a.id === lesson._id ||
      (a.title && lesson.title && a.title.trim().toLowerCase() === lesson.title.trim().toLowerCase())
  ) || assignments[0];

  const studentSubmission = matchingAssignment?.studentSubmission;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile && !textAnswer.trim()) {
      toast.error('Please attach a file or enter text response to submit');
      return;
    }
    if (!matchingAssignment) {
      toast.error('Assignment target record not found for this lesson');
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (textAnswer) {
        formData.append('textSubmission', textAnswer);
      }
      await api.post(`/assignments/${matchingAssignment.id || matchingAssignment._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Assignment submitted successfully!');
      setSelectedFile(null);
      setTextAnswer('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['courseAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['studentProgress'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
            Practical Assignment
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{matchingAssignment?.title || lesson.title}</h2>
        </div>
      </div>

      <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Instructions & Prompt</h3>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {matchingAssignment?.instructions || matchingAssignment?.description || lesson.content || 'Complete the practical task as specified by your instructor and upload your completed document for grading.'}
        </p>
        {matchingAssignment?.dueDate && (
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold pt-1">
            📅 Due Date: {new Date(matchingAssignment.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {studentSubmission ? (
        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">✓</span>
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Assignment Submitted</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Status: <strong className="capitalize">{studentSubmission.status}</strong>
                </p>
              </div>
            </div>
            {studentSubmission.status === 'graded' && (
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Grade</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                  {studentSubmission.score} / {matchingAssignment?.maxScore || 100}
                </span>
              </div>
            )}
          </div>

          {studentSubmission.feedback && (
            <div className="p-3 bg-white dark:bg-gray-850 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-gray-700 dark:text-gray-300">
              <strong className="text-emerald-800 dark:text-emerald-400">Instructor Feedback:</strong> {studentSubmission.feedback}
            </div>
          )}

          {studentSubmission.fileUrl && (
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              📎 <span>Submitted File: {studentSubmission.fileName || 'Document'}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Submit Work</h3>
          
          <div className="space-y-3">
            <textarea
              rows={3}
              placeholder="Optional notes or text response for instructor..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip,.png,.txt"
                onChange={handleFileChange}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <button
                onClick={handleSubmitAssignment}
                disabled={isSubmitting || (!selectedFile && !textAnswer.trim())}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer flex-shrink-0"
              >
                {isSubmitting ? 'Uploading...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, courseId }) => {
  if (!lesson) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center text-gray-400 space-y-3">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl font-bold">
          📚
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Select a Lesson to Start Learning</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Choose a lesson module from the curriculum menu on the right to view videos, reading materials, documents, or quizzes.
        </p>
      </div>
    );
  }

  // Priority 1: Quiz Lesson
  if (lesson.type === 'quiz') {
    return <QuizLessonView lesson={lesson} courseId={courseId} />;
  }

  // Priority 2: Assignment Lesson
  if (lesson.type === 'assignment') {
    return <AssignmentLessonView lesson={lesson} courseId={courseId} />;
  }

  // Priority 3: Video Lesson
  if (lesson.type === 'video' || lesson.videoUrl || lesson.externalVideoUrl) {
    return <VideoLesson lesson={lesson} />;
  }

  // Priority 4: Document / PDF Lesson
  if (lesson.type === 'pdf' || lesson.documentUrl) {
    return <DocumentLesson lesson={lesson} />;
  }

  // Priority 5: Text / Article Lesson
  if (lesson.content) {
    return <TextLesson lesson={lesson} />;
  }

  // Fallback: Empty Lesson Content State
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center text-gray-400 space-y-3">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center mx-auto text-xl font-bold">
        📝
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        Lesson content is currently undergoing updates by the instructor.
      </p>
    </div>
  );
};

export default LessonViewer;

