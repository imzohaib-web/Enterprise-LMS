import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import SectionAccordion from '../../components/lms/SectionAccordion';
import type { CreateCoursePayload, CreateSectionPayload, CreateLessonPayload, Section, Lesson } from '../../types/course';

type Mode = 'create' | 'edit';

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const LESSON_TYPES = ['video', 'pdf', 'text', 'assignment'] as const;

const CourseBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const mode: Mode = id ? 'edit' : 'create';
  const navigate = useNavigate();
  const qc = useQueryClient();

  // ── Fetch existing course if editing ──────────────────────────────────
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id!).then((r) => r.data.data!.course),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.listCategories().then((r) => r.data.data!.categories),
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
    } : undefined,
  });

  const saveCourse = useMutation({
    mutationFn: (payload: CreateCoursePayload) =>
      mode === 'create'
        ? courseService.createCourse(payload).then((r) => r.data.data!.course)
        : courseService.updateCourse(id!, payload).then((r) => r.data.data!.course),
    onSuccess: (course) => {
      toast.success(`Course ${mode === 'create' ? 'created' : 'updated'} successfully`);
      qc.invalidateQueries({ queryKey: ['courses'] });
      if (mode === 'create') navigate(`/courses/${course._id}/builder`);
    },
    onError: () => toast.error('Failed to save course'),
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
    onSuccess: () => { toast.success('Section added'); qc.invalidateQueries({ queryKey: ['course', id] }); setSectionModal({ open: false }); },
    onError: () => toast.error('Failed to add section'),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => courseService.deleteSection(id!, sectionId),
    onSuccess: () => { toast.success('Section deleted'); qc.invalidateQueries({ queryKey: ['course', id] }); },
    onError: () => toast.error('Failed to delete section'),
  });

  const addLessonMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: CreateLessonPayload }) =>
      courseService.addLesson(id!, sectionId, payload),
    onSuccess: () => { toast.success('Lesson added'); qc.invalidateQueries({ queryKey: ['course', id] }); setLessonModal({ open: false }); setUploadedMedia(null); },
    onError: () => toast.error('Failed to add lesson'),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: ({ sectionId, lessonId }: { sectionId: string; lessonId: string }) =>
      courseService.deleteLesson(id!, sectionId, lessonId),
    onSuccess: () => { toast.success('Lesson deleted'); qc.invalidateQueries({ queryKey: ['course', id] }); },
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
      videoUrl: uploadedMedia?.url,
      videoPublicId: uploadedMedia?.publicId,
      duration: uploadedMedia?.duration ?? 0,
      documentUrl: lessonForm.type === 'pdf' ? uploadedMedia?.url : undefined,
      documentPublicId: lessonForm.type === 'pdf' ? uploadedMedia?.publicId : undefined,
    };
    addLessonMutation.mutate({ sectionId: lessonModal.sectionId, payload });
  };

  if (courseLoading && mode === 'edit') {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{mode === 'create' ? 'Create New Course' : 'Edit Course'}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{mode === 'create' ? 'Build your course step by step' : 'Update your course content'}</p>
      </div>

      {/* Course Details Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Course Details</h2>
        <form onSubmit={handleSubmit((d) => saveCourse.mutate(d))} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Title *</label>
            <input
              {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="e.g. Complete React Developer Course"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
            <textarea
              rows={4}
              {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              placeholder="What will students learn in this course?"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select {...register('status')} className="w-full sm:w-48 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting || saveCourse.isPending}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center gap-2">
              {(isSubmitting || saveCourse.isPending) && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {mode === 'create' ? 'Create Course' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Curriculum Builder — only when editing */}
      {mode === 'edit' && courseData && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Curriculum</h2>
          <SectionAccordion
            sections={courseData.sections}
            editable={true}
            onAddSection={() => { setSectionTitle(''); setSectionModal({ open: true }); }}
            onDeleteSection={(sid) => { if (confirm('Delete section?')) deleteSectionMutation.mutate(sid); }}
            onAddLesson={(sectionId) => { setLessonForm({ type: 'text' }); setUploadedMedia(null); setLessonModal({ open: true, sectionId }); }}
            onDeleteLesson={(sectionId, lessonId) => { if (confirm('Delete lesson?')) deleteLessonMutation.mutate({ sectionId, lessonId }); }}
          />
        </div>
      )}

      {/* Section Modal */}
      {sectionModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Add Section</h3>
            <input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Section title"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSectionModal({ open: false })} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
              <button
                onClick={() => { if (sectionTitle.trim()) addSectionMutation.mutate({ title: sectionTitle.trim() }); }}
                disabled={!sectionTitle.trim() || addSectionMutation.isPending}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {lessonModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Add Lesson</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <input
                  value={lessonForm.title || ''}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Lesson title"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {LESSON_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setLessonForm((f) => ({ ...f, type: t })); setUploadedMedia(null); }}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition capitalize ${
                        lessonForm.type === t
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Upload {lessonForm.type === 'video' ? 'Video' : 'PDF'}
                  </label>
                  {uploadedMedia ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm text-emerald-700 dark:text-emerald-400 truncate">Uploaded successfully</span>
                      <button onClick={() => setUploadedMedia(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
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
                      <label htmlFor="lesson-file-upload" className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-indigo-400 transition">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="text-sm text-gray-500">Click to upload {lessonForm.type === 'video' ? 'video' : 'PDF'}</span>
                      </label>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(lessonForm.type === 'text' || lessonForm.type === 'assignment') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
                  <textarea
                    rows={4}
                    value={lessonForm.content || ''}
                    onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder={lessonForm.type === 'assignment' ? 'Describe the assignment...' : 'Write lesson content...'}
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lessonForm.isPreview ?? false}
                  onChange={(e) => setLessonForm((f) => ({ ...f, isPreview: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Free preview lesson</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setLessonModal({ open: false }); setUploadedMedia(null); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
              <button
                onClick={onSubmitLesson}
                disabled={!lessonForm.title || addLessonMutation.isPending}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;
