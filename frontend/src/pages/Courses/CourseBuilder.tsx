import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import SectionAccordion from '../../components/lms/SectionAccordion';
import ThumbnailUploader from '../../components/lms/ThumbnailUploader';
import type { CreateCoursePayload, CreateSectionPayload, CreateLessonPayload, Section, Lesson, Resource } from '../../types/course';

type Mode = 'create' | 'edit';

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const LESSON_TYPES = ['video', 'pdf', 'text', 'article', 'assignment', 'quiz'] as const;

interface CourseBuilderProps {
  courseIdOverride?: string;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ courseIdOverride }) => {
  const { id: paramId } = useParams<{ id?: string }>();
  const id = courseIdOverride || paramId;
  const mode: Mode = id ? 'edit' : 'create';
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Thumbnail state
  const [thumbnailValue, setThumbnailValue] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | undefined>();

  // ── Fetch existing course if editing ──────────────────────────────────
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id!).then((r) => r.data.data!.course),
    enabled: !!id,
  });

  const { data: _categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.listCategories().then((r) => r.data.data!.categories || []),
  });

  // ── Course form ───────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateCoursePayload & { status?: string }>({
    values: courseData ? {
      title: courseData.title,
      description: courseData.description,
      shortDesc: courseData.shortDesc ?? '',
      level: courseData.level,
      price: courseData.price,
      isFree: courseData.isFree,
      status: courseData.status,
      thumbnail: courseData.thumbnail ?? '',
    } : undefined,
  });

  const saveCourse = useMutation({
    mutationFn: async (payload: CreateCoursePayload) => {
      const finalPayload = { ...payload, thumbnail: thumbnailValue || payload.thumbnail || courseData?.thumbnail };
      const savedCourse = mode === 'create'
        ? await courseService.createCourse(finalPayload).then((r) => r.data.data!.course)
        : await courseService.updateCourse(id!, finalPayload).then((r) => r.data.data!.course);

      // If a local image file was selected, upload it now
      if (thumbnailFile && savedCourse._id) {
        try {
          await courseService.uploadThumbnail(savedCourse._id, thumbnailFile);
        } catch {
          // File upload warning swallow
        }
      }
      return savedCourse;
    },
    onSuccess: (course) => {
      toast.success(`Course ${mode === 'create' ? 'created' : 'updated'} successfully`);
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['instructorCourses'] });
      qc.invalidateQueries({ queryKey: ['course', course._id] });
      if (mode === 'create') navigate(`/courses/${course._id}/builder`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to save course'),
  });

  // ── Section & Lesson Modal State ─────────────────────────────────────
  const [sectionModal, setSectionModal] = useState<{ open: boolean; section?: Section }>({ open: false });
  const [sectionForm, setSectionForm] = useState<{ title: string; description: string }>({ title: '', description: '' });

  const [lessonModal, setLessonModal] = useState<{ open: boolean; sectionId?: string; lesson?: Lesson }>({ open: false });
  const [lessonForm, setLessonForm] = useState<Partial<CreateLessonPayload>>({ type: 'video', isPublished: true, isPreview: false });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<{ url: string; publicId: string; duration?: number } | null>(null);
  
  const [resourceProgress, setResourceProgress] = useState(0);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [lessonResources, setLessonResources] = useState<Resource[]>([]);

  const addSectionMutation = useMutation({
    mutationFn: (payload: CreateSectionPayload) => courseService.addSection(id!, payload),
    onSuccess: () => {
      toast.success('Section added');
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['instructorCourses'] });
      setSectionModal({ open: false });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to add section'),
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: Partial<CreateSectionPayload> }) =>
      courseService.updateSection(id!, sectionId, payload),
    onSuccess: () => {
      toast.success('Section updated');
      qc.invalidateQueries({ queryKey: ['course', id] });
      setSectionModal({ open: false });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update section'),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => courseService.deleteSection(id!, sectionId),
    onSuccess: () => {
      toast.success('Section deleted');
      qc.invalidateQueries({ queryKey: ['course', id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete section'),
  });

  // ── Lesson Mutations ──────────────────────────────────────────────────
  const addLessonMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: CreateLessonPayload }) =>
      courseService.addLesson(id!, sectionId, payload),
    onSuccess: () => {
      toast.success('Lesson added');
      qc.invalidateQueries({ queryKey: ['course', id] });
      setLessonModal({ open: false });
      setUploadedVideo(null);
      setLessonResources([]);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to add lesson'),
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ sectionId, lessonId, payload }: { sectionId: string; lessonId: string; payload: Partial<CreateLessonPayload> }) =>
      courseService.updateLesson(id!, sectionId, lessonId, payload),
    onSuccess: () => {
      toast.success('Lesson updated');
      qc.invalidateQueries({ queryKey: ['course', id] });
      setLessonModal({ open: false });
      setUploadedVideo(null);
      setLessonResources([]);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update lesson'),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: ({ sectionId, lessonId }: { sectionId: string; lessonId: string }) =>
      courseService.deleteLesson(id!, sectionId, lessonId),
    onSuccess: () => {
      toast.success('Lesson deleted');
      qc.invalidateQueries({ queryKey: ['course', id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete lesson'),
  });

  const handleVideoUpload = async (file: File) => {
    setUploadProgress(1);
    try {
      const res = await courseService.uploadVideo(file, setUploadProgress);
      const data = res.data?.data;
      if (data) {
        setUploadedVideo({ url: data.url, publicId: data.publicId, duration: data.duration });
        if (data.duration && !lessonForm.duration) {
          setLessonForm((f) => ({ ...f, duration: Math.ceil(data.duration! / 60) }));
        }
        toast.success('Video uploaded successfully!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Video upload failed');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleResourceUpload = async (file: File) => {
    setIsUploadingResource(true);
    setResourceProgress(1);
    try {
      const res = await courseService.uploadResource(file, setResourceProgress);
      const data = res.data?.data;
      if (data) {
        setLessonResources((prev) => [
          ...prev,
          {
            name: data.name || file.name,
            url: data.url,
            publicId: data.publicId,
            type: data.type,
            size: data.size,
          },
        ]);
        toast.success('Resource file attached!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Resource upload failed');
    } finally {
      setIsUploadingResource(false);
      setResourceProgress(0);
    }
  };

  const handleRemoveResource = (index: number) => {
    setLessonResources((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitLesson = () => {
    if (!lessonModal.sectionId) return;
    const payload: CreateLessonPayload = {
      title: lessonForm.title || 'Untitled Lesson',
      type: lessonForm.type || 'video',
      description: lessonForm.description || '',
      content: lessonForm.content || '',
      videoUrl: uploadedVideo?.url || lessonForm.videoUrl || '',
      videoPublicId: uploadedVideo?.publicId || lessonForm.videoPublicId || '',
      externalVideoUrl: lessonForm.externalVideoUrl || '',
      duration: lessonForm.duration ? Number(lessonForm.duration) : (uploadedVideo?.duration || 0),
      documentUrl: lessonForm.documentUrl || '',
      documentPublicId: lessonForm.documentPublicId || '',
      isPreview: Boolean(lessonForm.isPreview),
      isPublished: lessonForm.isPublished !== false,
      resources: lessonResources || [],
    };

    if (lessonModal.lesson) {
      updateLessonMutation.mutate({ sectionId: lessonModal.sectionId, lessonId: lessonModal.lesson._id, payload });
    } else {
      addLessonMutation.mutate({ sectionId: lessonModal.sectionId, payload });
    }
  };

  if (courseLoading && mode === 'edit') {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Create New Course' : 'Edit Course Builder'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Build your course step by step'
              : 'Update your course details, thumbnail, sections, and lessons'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {mode === 'edit' && id && (
            <button
              type="button"
              onClick={() => navigate(`/courses/${id}`)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition shadow-xs w-fit cursor-pointer"
            >
              👁️ Preview Course
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/instructor/courses')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs w-fit cursor-pointer"
          >
            ← Back to Course Catalog
          </button>
        </div>
      </div>

      {/* Course Details Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Course Details</h2>
        <form onSubmit={handleSubmit((d) => saveCourse.mutate(d as any))} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Title *</label>
            <input
              {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="e.g. Complete React & TypeScript Developer Course"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
            <textarea
              rows={4}
              {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Min 10 characters' } })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              placeholder="What will students learn in this course?"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Thumbnail Uploader (Image URL or File Upload) */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <ThumbnailUploader
              value={thumbnailValue || courseData?.thumbnail || ''}
              courseId={id}
              onChange={(url, file) => {
                setThumbnailValue(url);
                setThumbnailFile(file);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level *</label>
              <select {...register('level')} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price ($)</label>
              <input type="number" min="0" step="0.01" {...register('price', { valueAsNumber: true, min: 0 })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isFree')} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free course</span>
              </label>
            </div>
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Publish Status</label>
              <select {...register('status')} className="w-full sm:w-48 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting || saveCourse.isPending}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center gap-2 cursor-pointer">
              {(isSubmitting || saveCourse.isPending) && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {mode === 'create' ? 'Create Course & Continue to Builder' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Curriculum Builder — only when editing */}
      {mode === 'edit' && courseData && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Curriculum Sections & Lessons</h2>
            <span className="text-xs text-gray-400 font-medium">
              {courseData.sections?.length || 0} Sections &bull; {courseData.sections?.reduce((acc, s) => acc + s.lessons.length, 0)} Lessons
            </span>
          </div>

          <SectionAccordion
            sections={courseData.sections || []}
            editable={true}
            onAddSection={() => { setSectionForm({ title: '', description: '' }); setSectionModal({ open: true }); }}
            onEditSection={(section) => { setSectionForm({ title: section.title, description: section.description || '' }); setSectionModal({ open: true, section }); }}
            onDeleteSection={(sid) => { if (confirm('Are you sure you want to delete this section?')) deleteSectionMutation.mutate(sid); }}
            onAddLesson={(sectionId) => {
              setLessonForm({ title: '', type: 'video', description: '', content: '', externalVideoUrl: '', duration: 0, isPreview: false, isPublished: true });
              setUploadedVideo(null);
              setLessonResources([]);
              setUploadProgress(0);
              setResourceProgress(0);
              setLessonModal({ open: true, sectionId });
            }}
            onEditLesson={(sectionId, lesson) => {
              setLessonForm({
                title: lesson.title,
                type: lesson.type || 'video',
                description: lesson.description || '',
                content: lesson.content || '',
                externalVideoUrl: lesson.externalVideoUrl || '',
                videoUrl: lesson.videoUrl || '',
                videoPublicId: lesson.videoPublicId || '',
                documentUrl: lesson.documentUrl || '',
                documentPublicId: lesson.documentPublicId || '',
                duration: lesson.duration || 0,
                isPreview: Boolean(lesson.isPreview),
                isPublished: lesson.isPublished !== false,
              });
              setUploadedVideo(lesson.videoUrl ? { url: lesson.videoUrl, publicId: lesson.videoPublicId || '', duration: lesson.duration } : null);
              setLessonResources(lesson.resources || []);
              setUploadProgress(0);
              setResourceProgress(0);
              setLessonModal({ open: true, sectionId, lesson });
            }}
            onDeleteLesson={(sectionId, lessonId) => { if (confirm('Are you sure you want to delete this lesson?')) deleteLessonMutation.mutate({ sectionId, lessonId }); }}
          />
        </div>
      )}

      {/* Section Modal (Create / Edit) */}
      {sectionModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {sectionModal.section ? 'Edit Section Details' : 'Add New Section'}
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                Section Title *
              </label>
              <input
                value={sectionForm.title}
                onChange={(e) => setSectionForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="e.g. Section 1: REST APIs & Core Concepts"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                Section Description (Optional)
              </label>
              <textarea
                rows={3}
                value={sectionForm.description}
                onChange={(e) => setSectionForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Briefly describe what topics are covered in this section..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setSectionModal({ open: false })} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 transition">Cancel</button>
              <button
                onClick={() => {
                  if (!sectionForm.title.trim()) return;
                  if (sectionModal.section) {
                    updateSectionMutation.mutate({
                      sectionId: sectionModal.section._id,
                      payload: { title: sectionForm.title.trim(), description: sectionForm.description.trim() },
                    });
                  } else {
                    addSectionMutation.mutate({
                      title: sectionForm.title.trim(),
                      description: sectionForm.description.trim(),
                    });
                  }
                }}
                disabled={!sectionForm.title.trim() || addSectionMutation.isPending || updateSectionMutation.isPending}
                className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {sectionModal.section ? 'Save Changes' : 'Add Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal (Create / Edit) */}
      {lessonModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {lessonModal.lesson ? 'Edit Lesson Content' : 'Create New Lesson'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure video lecture, lesson description, attached resources, and text instructions.
                </p>
              </div>
              <button
                onClick={() => { setLessonModal({ open: false }); setUploadedVideo(null); setLessonResources([]); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Lesson Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Lesson Title *
                </label>
                <input
                  value={lessonForm.title || ''}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Introduction to REST APIs & HTTP Protocol"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Lesson Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Lesson Short Summary / Overview
                </label>
                <textarea
                  rows={2}
                  value={lessonForm.description || ''}
                  onChange={(e) => setLessonForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief high-level summary of what students learn in this lesson..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              {/* Lesson Type selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Primary Lesson Type *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {LESSON_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLessonForm((f) => ({ ...f, type: t }))}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition capitalize cursor-pointer flex flex-col items-center gap-1 ${
                        lessonForm.type === t
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <span>{t === 'video' ? '🎥' : t === 'pdf' ? '📄' : t === 'text' ? '📝' : t === 'assignment' ? '📋' : t === 'article' ? '📰' : '💡'}</span>
                      <span className="truncate">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── VIDEO LECTURE SECTION ────────────────────────────────── */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    🎥 Video Lecture (MP4, WebM, MOV)
                  </h4>
                  {uploadedVideo && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ✓ Video Attached
                    </span>
                  )}
                </div>

                {uploadedVideo ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-800">
                      <video src={uploadedVideo.url} controls className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        File: {uploadedVideo.url}
                      </span>
                      <div className="flex items-center gap-2">
                        <label htmlFor="replace-video-upload" className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg cursor-pointer transition">
                          Replace
                        </label>
                        <input
                          id="replace-video-upload"
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/mov"
                          onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedVideo(null)}
                          className="px-3 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/mov"
                      onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                      className="hidden"
                      id="video-lecture-file-upload"
                    />
                    <label
                      htmlFor="video-lecture-file-upload"
                      className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-indigo-500 transition bg-white dark:bg-gray-900/60 text-center"
                    >
                      <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Click to upload video file
                      </span>
                      <span className="text-[11px] text-gray-400 mt-1">Supports MP4, WebM, MOV formats up to 500MB</span>
                    </label>

                    {uploadProgress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                          <span>Uploading video lecture...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Or External Video Embed URL (YouTube, Vimeo, MP4 link)
                      </label>
                      <input
                        type="url"
                        value={lessonForm.externalVideoUrl || ''}
                        onChange={(e) => setLessonForm((f) => ({ ...f, externalVideoUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── ATTACHED RESOURCES / LEARNING FILES SECTION ────────────────── */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    📄 Attached Learning Resources
                  </h4>
                  <span className="text-xs text-gray-400 font-semibold">{lessonResources.length} Attached</span>
                </div>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.csv,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => e.target.files?.[0] && handleResourceUpload(e.target.files[0])}
                    className="hidden"
                    id="resource-file-upload"
                  />
                  <label
                    htmlFor="resource-file-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 transition bg-white dark:bg-gray-900 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ${
                      isUploadingResource ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {isUploadingResource ? 'Uploading file...' : '+ Attach Resource File (PDF, DOCX, PPTX, ZIP, Image)'}
                  </label>

                  {resourceProgress > 0 && (
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${resourceProgress}%` }} />
                    </div>
                  )}

                  {lessonResources.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {lessonResources.map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm">📄</span>
                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{res.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={res.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                              Preview
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveResource(idx)}
                              className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── TEXT CONTENT / INSTRUCTIONS SECTION ────────────────── */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Detailed Lesson Instructions / Reading Content
                </label>
                <textarea
                  rows={4}
                  value={lessonForm.content || ''}
                  onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed resize-none"
                  placeholder="Provide detailed written explanation, code snippets, or study instructions..."
                />
              </div>

              {/* ── DURATION & SETTINGS ───────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lessonForm.duration || 0}
                    onChange={(e) => setLessonForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    placeholder="e.g. 15"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonForm.isPreview ?? false}
                      onChange={(e) => setLessonForm((f) => ({ ...f, isPreview: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Free Preview Lesson</span>
                  </label>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonForm.isPublished !== false}
                      onChange={(e) => setLessonForm((f) => ({ ...f, isPublished: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Published & Visible</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => { setLessonModal({ open: false }); setUploadedVideo(null); setLessonResources([]); }}
                className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmitLesson}
                disabled={!lessonForm.title || addLessonMutation.isPending || updateLessonMutation.isPending}
                className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-60 cursor-pointer shadow-md shadow-indigo-500/20"
              >
                {lessonModal.lesson ? 'Save Lesson Changes' : 'Add Lesson to Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;
