import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import SectionAccordion from '../../components/lms/SectionAccordion';
import ThumbnailUploader from '../../components/lms/ThumbnailUploader';
import type { CreateCoursePayload, CreateSectionPayload, CreateLessonPayload, Section, Lesson } from '../../types/course';

type Mode = 'create' | 'edit';

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const LESSON_TYPES = ['video', 'pdf', 'text', 'assignment'] as const;

const CourseBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
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

  const { data: categoriesData } = useQuery({
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

  // ── Section modals ────────────────────────────────────────────────────
  const [sectionModal, setSectionModal] = useState<{ open: boolean; section?: Section }>({ open: false });
  const [lessonModal, setLessonModal] = useState<{ open: boolean; sectionId?: string; lesson?: Lesson }>({ open: false });
  const [sectionTitle, setSectionTitle] = useState('');
  const [lessonForm, setLessonForm] = useState<Partial<CreateLessonPayload>>({ type: 'text' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<{ url: string; publicId: string; duration?: number } | null>(null);

  const addSectionMutation = useMutation({
    mutationFn: (payload: CreateSectionPayload) => courseService.addSection(id!, payload),
    onSuccess: () => {
      toast.success('Section added');
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['instructorCourses'] });
      setSectionModal({ open: false });
    },
    onError: () => toast.error('Failed to add section'),
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: Partial<CreateSectionPayload> }) =>
      courseService.updateSection(id!, sectionId, payload),
    onSuccess: () => {
      toast.success('Section updated');
      qc.invalidateQueries({ queryKey: ['course', id] });
      setSectionModal({ open: false });
    },
    onError: () => toast.error('Failed to update section'),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => courseService.deleteSection(id!, sectionId),
    onSuccess: () => {
      toast.success('Section deleted');
      qc.invalidateQueries({ queryKey: ['course', id] });
    },
    onError: () => toast.error('Failed to delete section'),
  });

  // ── Lesson Mutations ──────────────────────────────────────────────────
  const addLessonMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: CreateLessonPayload }) =>
      courseService.addLesson(id!, sectionId, payload),
    onSuccess: () => {
      toast.success('Lesson added');
      qc.invalidateQueries({ queryKey: ['course', id] });
      setLessonModal({ open: false });
      setUploadedMedia(null);
    },
    onError: () => toast.error('Failed to add lesson'),
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ sectionId, lessonId, payload }: { sectionId: string; lessonId: string; payload: Partial<CreateLessonPayload> }) =>
      courseService.updateLesson(id!, sectionId, lessonId, payload),
    onSuccess: () => {
      toast.success('Lesson updated');
      qc.invalidateQueries({ queryKey: ['course', id] });
      setLessonModal({ open: false });
      setUploadedMedia(null);
    },
    onError: () => toast.error('Failed to update lesson'),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: ({ sectionId, lessonId }: { sectionId: string; lessonId: string }) =>
      courseService.deleteLesson(id!, sectionId, lessonId),
    onSuccess: () => {
      toast.success('Lesson deleted');
      qc.invalidateQueries({ queryKey: ['course', id] });
    },
    onError: () => toast.error('Failed to delete lesson'),
  });

  const handleFileUpload = async (file: File) => {
    try {
      if (lessonForm.type === 'video') {
        const res = await courseService.uploadVideo(file, setUploadProgress);
        setUploadedMedia({ url: res.data.data!.url, publicId: res.data.data!.publicId, duration: res.data.data!.duration });
        toast.success('Video uploaded!');
      } else if (lessonForm.type === 'pdf') {
        const res = await courseService.uploadDocument(file);
        setUploadedMedia({ url: res.data.data!.url, publicId: res.data.data!.publicId });
        toast.success('Document uploaded!');
      }
    } catch {
      toast.error('Upload failed');
    }
  };

  const onSubmitLesson = () => {
    if (!lessonModal.sectionId) return;
    const payload: CreateLessonPayload = {
      title: lessonForm.title || 'Untitled Lesson',
      type: lessonForm.type || 'text',
      content: lessonForm.content,
      isPreview: lessonForm.isPreview ?? false,
      order: lessonForm.order ?? 0,
      videoUrl: uploadedMedia?.url || lessonForm.videoUrl,
      videoPublicId: uploadedMedia?.publicId || lessonForm.videoPublicId,
      duration: uploadedMedia?.duration ?? lessonForm.duration ?? 0,
      documentUrl: lessonForm.type === 'pdf' ? (uploadedMedia?.url || lessonForm.documentUrl) : undefined,
      documentPublicId: lessonForm.type === 'pdf' ? (uploadedMedia?.publicId || lessonForm.documentPublicId) : undefined,
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
        <button
          type="button"
          onClick={() => navigate('/instructor/courses')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs w-fit cursor-pointer"
        >
          ← Back to Course Catalog
        </button>
      </div>

      {/* Course Details Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Course Details</h2>
        <form onSubmit={handleSubmit((d) => saveCourse.mutate(d))} className="space-y-5">
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
            onAddSection={() => { setSectionTitle(''); setSectionModal({ open: true }); }}
            onEditSection={(section) => { setSectionTitle(section.title); setSectionModal({ open: true, section }); }}
            onDeleteSection={(sid) => { if (confirm('Are you sure you want to delete this section?')) deleteSectionMutation.mutate(sid); }}
            onAddLesson={(sectionId) => { setLessonForm({ type: 'text' }); setUploadedMedia(null); setLessonModal({ open: true, sectionId }); }}
            onEditLesson={(sectionId, lesson) => {
              setLessonForm({
                title: lesson.title,
                type: lesson.type,
                content: lesson.content,
                isPreview: lesson.isPreview,
                videoUrl: lesson.videoUrl,
                videoPublicId: lesson.videoPublicId,
                documentUrl: lesson.documentUrl,
                documentPublicId: lesson.documentPublicId,
                duration: lesson.duration,
              });
              setUploadedMedia(lesson.videoUrl ? { url: lesson.videoUrl, publicId: lesson.videoPublicId || '' } : null);
              setLessonModal({ open: true, sectionId, lesson });
            }}
            onDeleteLesson={(sectionId, lessonId) => { if (confirm('Are you sure you want to delete this lesson?')) deleteLessonMutation.mutate({ sectionId, lessonId }); }}
          />
        </div>
      )}

      {/* Section Modal (Create / Edit) */}
      {sectionModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {sectionModal.section ? 'Edit Section Title' : 'Add New Section'}
            </h3>
            <input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="e.g. Section 1: Fundamentals & Getting Started"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-sm"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSectionModal({ open: false })} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
              <button
                onClick={() => {
                  if (!sectionTitle.trim()) return;
                  if (sectionModal.section) {
                    updateSectionMutation.mutate({ sectionId: sectionModal.section._id, payload: { title: sectionTitle.trim() } });
                  } else {
                    addSectionMutation.mutate({ title: sectionTitle.trim() });
                  }
                }}
                disabled={!sectionTitle.trim() || addSectionMutation.isPending || updateSectionMutation.isPending}
                className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 cursor-pointer"
              >
                {sectionModal.section ? 'Save Section Title' : 'Add Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal (Create / Edit) */}
      {lessonModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {lessonModal.lesson ? 'Edit Lesson Content' : 'Add New Lesson'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Lesson Title *
                </label>
                <input
                  value={lessonForm.title || ''}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Introduction to Course Architecture"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Content Format / Type *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {LESSON_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setLessonForm((f) => ({ ...f, type: t })); setUploadedMedia(null); }}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition capitalize cursor-pointer ${
                        lessonForm.type === t
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {(lessonForm.type === 'video' || lessonForm.type === 'pdf') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Upload {lessonForm.type === 'video' ? 'Video File' : 'PDF Document'}
                  </label>
                  {uploadedMedia ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                        File uploaded: {uploadedMedia.url}
                      </span>
                      <button onClick={() => setUploadedMedia(null)} className="ml-auto text-emerald-500 hover:text-emerald-700 text-sm font-bold">×</button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept={lessonForm.type === 'video' ? 'video/*' : 'application/pdf'}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        id="lesson-file-upload"
                      />
                      <label htmlFor="lesson-file-upload" className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-indigo-400 transition bg-gray-50 dark:bg-gray-800/40">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Click to upload {lessonForm.type === 'video' ? 'video' : 'PDF document'}</span>
                      </label>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2 space-y-1">
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-[11px] text-gray-500 text-right">{uploadProgress}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(lessonForm.type === 'text' || lessonForm.type === 'assignment') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    {lessonForm.type === 'assignment' ? 'Assignment Details & Instructions' : 'Reading / Article Content'}
                  </label>
                  <textarea
                    rows={4}
                    value={lessonForm.content || ''}
                    onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                    placeholder={lessonForm.type === 'assignment' ? 'Provide clear instructions for student submission...' : 'Write lesson text content...'}
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={lessonForm.isPreview ?? false}
                  onChange={(e) => setLessonForm((f) => ({ ...f, isPreview: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Free preview lesson</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setLessonModal({ open: false }); setUploadedMedia(null); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
              <button
                onClick={onSubmitLesson}
                disabled={!lessonForm.title || addLessonMutation.isPending || updateLessonMutation.isPending}
                className="px-5 py-2.5 text-sm bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 cursor-pointer shadow-xs"
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
