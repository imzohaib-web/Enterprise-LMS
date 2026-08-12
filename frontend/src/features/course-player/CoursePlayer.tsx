import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageMeta from '../../components/common/PageMeta';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import type { FlatLesson } from './types';

import CourseHeader from './CourseHeader';
import CourseSidebar from './CourseSidebar';
import LessonViewer from './LessonViewer';
import LessonNavigation from './LessonNavigation';
import CoursePlayerSkeleton from './CoursePlayerSkeleton';
import CoursePlayerError from './CoursePlayerError';
import CourseOverviewPreview from './CourseOverviewPreview';

export const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const courseId = id || '';
  const urlLessonId = searchParams.get('lessonId');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 1. Fetch Course details
  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
    error: courseError,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ['courseDetail', courseId],
    queryFn: () => courseService.getCourseById(courseId).then((res) => res.data?.data?.course),
    enabled: Boolean(courseId),
  });

  // 2. Fetch My Enrollments to verify access
  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: () => courseService.getMyEnrollments().then((res) => res.data?.data?.enrollments || []),
  });

  const isEnrolled = useMemo(() => {
    return myEnrollments.some((e: any) => {
      const eCourseId = typeof e.course === 'object' ? e.course?._id : e.course;
      return eCourseId === courseId;
    });
  }, [myEnrollments, courseId]);

  // 3. Fetch Course Progress
  const { data: progress } = useQuery({
    queryKey: ['courseProgress', courseId],
    queryFn: () => progressService.getCourseProgress(courseId).then((res) => res.data?.data?.progress),
    enabled: Boolean(courseId) && isEnrolled,
  });

  // Completed lesson IDs Set
  const completedLessonIds = useMemo(() => {
    return new Set<string>(progress?.completedLessons || []);
  }, [progress]);

  // Flatten sections and lessons into an ordered array
  const flatLessons = useMemo<FlatLesson[]>(() => {
    if (!course?.sections) return [];
    const result: FlatLesson[] = [];
    let count = 0;

    course.sections.forEach((section, sIdx) => {
      section.lessons.forEach((lesson) => {
        result.push({
          ...lesson,
          sectionId: section._id,
          sectionTitle: section.title,
          sectionOrder: section.order ?? sIdx,
          flatIndex: count++,
        });
      });
    });

    return result;
  }, [course]);

  // Determine active lesson
  const activeLesson = useMemo<FlatLesson | null>(() => {
    if (flatLessons.length === 0) return null;
    if (urlLessonId) {
      const found = flatLessons.find((l) => l._id === urlLessonId);
      if (found) return found;
    }
    // Default: first uncompleted lesson, or the first lesson
    const firstUncompleted = flatLessons.find((l) => !completedLessonIds.has(l._id));
    return firstUncompleted || flatLessons[0];
  }, [flatLessons, urlLessonId, completedLessonIds]);

  const activeLessonIndex = activeLesson ? activeLesson.flatIndex : -1;

  // Keep URL search params synced when active lesson changes
  useEffect(() => {
    if (activeLesson && activeLesson._id !== urlLessonId) {
      setSearchParams({ lessonId: activeLesson._id }, { replace: true });
    }
  }, [activeLesson, urlLessonId, setSearchParams]);

  // Lesson Select Handler
  const handleSelectLesson = (lessonId: string) => {
    setSearchParams({ lessonId });
  };

  // Mark Lesson Complete Mutation
  const markCompleteMutation = useMutation({
    mutationFn: (lessonId: string) => progressService.markLessonComplete(courseId, lessonId),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Lesson marked as complete! 🎉');
      queryClient.invalidateQueries({ queryKey: ['courseProgress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['studentProgressPage'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
      queryClient.invalidateQueries({ queryKey: ['studentLearningActivity'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update lesson progress');
    },
  });

  // Periodically log active learning duration while viewing a lesson
  useEffect(() => {
    if (!activeLesson || !isEnrolled) return;

    const timeout = setTimeout(() => {
      progressService.logActivity({
        courseId,
        lessonId: activeLesson._id,
        durationMinutes: 1,
        type: activeLesson.type,
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['studentLearningActivity'] });
    }, 15000);

    const interval = setInterval(() => {
      progressService.logActivity({
        courseId,
        lessonId: activeLesson._id,
        durationMinutes: 1,
        type: activeLesson.type,
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['studentLearningActivity'] });
    }, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [activeLesson, isEnrolled, courseId, queryClient]);

  // Enroll Mutation for Preview page
  const enrollMutation = useMutation({
    mutationFn: () => courseService.enrollInCourse(courseId),
    onSuccess: () => {
      toast.success('Successfully enrolled in course!');
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courseProgress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Enrollment failed');
    },
  });

  // Navigation handlers
  const handleNextLesson = () => {
    if (activeLessonIndex >= 0 && activeLessonIndex < flatLessons.length - 1) {
      const nextLesson = flatLessons[activeLessonIndex + 1];
      handleSelectLesson(nextLesson._id);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      const prevLesson = flatLessons[activeLessonIndex - 1];
      handleSelectLesson(prevLesson._id);
    }
  };

  const handleMarkComplete = () => {
    if (!activeLesson) return;
    markCompleteMutation.mutate(activeLesson._id);
  };

  // Loading State
  if (isCourseLoading) {
    return <CoursePlayerSkeleton />;
  }

  // Error State (Invalid ID / 404 / 401 / 403 / Network Error)
  if (isCourseError || !course) {
    const status = (courseError as any)?.response?.status;
    let title = 'Course Not Found';
    let message = "The course you're looking for doesn't exist or is no longer available.";

    if (status === 401 || status === 403) {
      title = 'Access Denied';
      message = "You don't have permission to access this course. Enrollment may be required.";
    } else if (status && status !== 404) {
      title = 'Unable to Load Course';
      message = (courseError as any)?.response?.data?.message || (courseError as any)?.message || 'An error occurred while communicating with the server.';
    }

    return (
      <CoursePlayerError
        title={title}
        message={message}
        onRetry={() => refetchCourse()}
      />
    );
  }

  // Non-enrolled Preview Landing State
  if (!isEnrolled) {
    return (
      <>
        <PageMeta title={`${course.title} | Course Overview`} description={course.description} />
        <CourseOverviewPreview
          course={course}
          isEnrolling={enrollMutation.isPending}
          onEnroll={() => enrollMutation.mutate()}
        />
      </>
    );
  }

  const completedCount = completedLessonIds.size;
  const totalCount = flatLessons.length;
  const progressPercentage = progress?.progressPercentage ?? (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
  const isActiveLessonCompleted = activeLesson ? completedLessonIds.has(activeLesson._id) : false;

  return (
    <>
      <PageMeta
        title={`${activeLesson ? `${activeLesson.title} - ` : ''}${course.title} | Student Learning`}
        description={course.shortDesc || course.description}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans">
        {/* Top Header Bar */}
        <CourseHeader
          course={course}
          activeLesson={activeLesson}
          completedCount={completedCount}
          totalCount={totalCount}
          progressPercentage={progressPercentage}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Main Content & Curriculum Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
          {/* Left / Main Content & Navigation Column */}
          <main className="lg:col-span-8 xl:col-span-9 p-4 md:p-6 lg:p-8 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <LessonViewer lesson={activeLesson} />
            </div>

            {/* Bottom Lesson Navigation Bar */}
            {activeLesson && (
              <div className="pt-4">
                <LessonNavigation
                  isCompleted={isActiveLessonCompleted}
                  isFirstLesson={activeLessonIndex <= 0}
                  isLastLesson={activeLessonIndex === flatLessons.length - 1}
                  isMarkingComplete={markCompleteMutation.isPending}
                  onMarkComplete={handleMarkComplete}
                  onNext={handleNextLesson}
                  onPrev={handlePrevLesson}
                />
              </div>
            )}
          </main>

          {/* Desktop Right Curriculum Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 h-full overflow-hidden border-l border-gray-200 dark:border-gray-800">
            <CourseSidebar
              sections={course.sections || []}
              flatLessons={flatLessons}
              activeLessonId={activeLesson?._id}
              completedLessonIds={completedLessonIds}
              progressPercentage={progressPercentage}
              onSelectLesson={handleSelectLesson}
            />
          </div>

          {/* Mobile Curriculum Overlay Drawer */}
          {isMobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <div className="relative w-4/5 max-w-sm bg-white dark:bg-gray-900 h-full ml-auto shadow-2xl z-10">
                <CourseSidebar
                  sections={course.sections || []}
                  flatLessons={flatLessons}
                  activeLessonId={activeLesson?._id}
                  completedLessonIds={completedLessonIds}
                  progressPercentage={progressPercentage}
                  onSelectLesson={handleSelectLesson}
                  isMobile={true}
                  onCloseMobile={() => setIsMobileSidebarOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePlayer;
