import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useInstructorAssessments,
  useInstructorCourses,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
} from '../hooks/useInstructorDashboard';

interface QuestionForm {
  question: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation: string;
}

interface InstructorAssessmentsProps {
  courseId?: string;
}

export const InstructorAssessments: React.FC<InstructorAssessmentsProps> = ({ courseId: propCourseId }) => {
  const { data: assessments, isLoading, isError, error, refetch } = useInstructorAssessments(propCourseId);
  const { data: courses } = useInstructorCourses();

  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();
  const deleteMutation = useDeleteAssessment();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState(propCourseId || '');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [duration, setDuration] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [attemptsAllowed, setAttemptsAllowed] = useState(3);
  const [dueDate, setDueDate] = useState('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Question Builder
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      question: 'Sample Question',
      type: 'mcq',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      marks: 25,
      explanation: '',
    },
  ]);

  const courseList = Array.isArray(courses) ? courses : (courses as any)?.courses || [];

  const handleOpenCreateModal = () => {
    setEditingAssessment(null);
    setTitle('');
    setDescription('');
    setCourseId(courseList[0]?.id || courseList[0]?._id || '');
    setStatus('published');
    setDuration(30);
    setPassingScore(70);
    setAttemptsAllowed(3);
    setDueDate('');
    setShuffleQuestions(false);
    setQuestions([
      {
        question: '',
        type: 'mcq',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        marks: 25,
        explanation: '',
      },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (assessment: any) => {
    setEditingAssessment(assessment);
    setTitle(assessment.title || '');
    setDescription(assessment.description || '');
    setCourseId(assessment.courseId || '');
    setStatus(assessment.status || 'published');
    setDuration(assessment.timeLimitMinutes || assessment.duration || 30);
    setPassingScore(assessment.passingScore || 70);
    setAttemptsAllowed(assessment.attemptsAllowed || 3);
    setDueDate(assessment.dueDate ? assessment.dueDate.slice(0, 10) : '');
    setShuffleQuestions(Boolean(assessment.shuffleQuestions));
    setQuestions(
      assessment.questions && assessment.questions.length > 0
        ? assessment.questions.map((q: any) => ({
            question: q.question,
            type: q.type || 'mcq',
            options: q.options ? q.options.map((o: any) => (typeof o === 'object' ? o.text : o)) : ['True', 'False'],
            correctAnswer: q.correctAnswer || '',
            marks: q.marks || 25,
            explanation: q.explanation || '',
          }))
        : [
            {
              question: '',
              type: 'mcq',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A',
              marks: 25,
              explanation: '',
            },
          ]
    );
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'mcq',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        marks: 25,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedQuestions = questions.map((q) => {
      if (q.type === 'mcq') {
        return {
          question: q.question,
          type: 'mcq',
          options: q.options.map((text, i) => ({ id: String(i + 1), text })),
          correctAnswer: q.correctAnswer,
          marks: Number(q.marks) || 25,
          explanation: q.explanation,
        };
      }
      if (q.type === 'true_false') {
        return {
          question: q.question,
          type: 'true_false',
          options: [
            { id: '1', text: 'True' },
            { id: '2', text: 'False' },
          ],
          correctAnswer: q.correctAnswer || 'True',
          marks: Number(q.marks) || 25,
          explanation: q.explanation,
        };
      }
      return {
        question: q.question,
        type: 'short_answer',
        correctAnswer: q.correctAnswer,
        marks: Number(q.marks) || 25,
        explanation: q.explanation,
      };
    });

    const payload = {
      title,
      description,
      courseId: courseId || undefined,
      status,
      timeLimitMinutes: Number(duration),
      passingScore: Number(passingScore),
      attemptsAllowed: Number(attemptsAllowed),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      shuffleQuestions,
      questions: formattedQuestions,
    };

    if (editingAssessment) {
      updateMutation.mutate(
        { id: editingAssessment.id || editingAssessment._id, assessmentData: payload },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleTogglePublish = (assessment: any) => {
    const targetStatus = assessment.status === 'published' ? 'draft' : 'published';
    updateMutation.mutate({
      id: assessment.id || assessment._id,
      assessmentData: { status: targetStatus },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assessment from MongoDB?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredAssessments = (assessments || []).filter((a: any) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.courseName && a.courseName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageMeta title="Assessment Management | Instructor Portal" description="Manage course quizzes and exams" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Assessment Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create, edit, schedule, publish, and evaluate quizzes & assessments connected to MongoDB.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              + Create Assessment
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search assessment title or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              All ({assessments?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              Published ({assessments?.filter((a: any) => a.status === 'published').length || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              Drafts ({assessments?.filter((a: any) => a.status === 'draft').length || 0})
            </button>
          </div>
        </div>

        {/* Content Section */}
        <ComponentCard title="Course Quizzes & Exams" desc="Synchronized with MongoDB database">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading assessments from MongoDB...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                Failed to load assessments: {(error as any)?.message || 'Server error'}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="py-16 text-center space-y-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto text-xl font-bold">
                📝
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No Assessments Found</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  No quizzes or assessments match your query. Create a new assessment to test student knowledge.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                + Create Assessment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Title & Details</th>
                    <th className="py-3 px-4">Assigned Course</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Passing Score</th>
                    <th className="py-3 px-4">Student Attempts</th>
                    <th className="py-3 px-4">Avg Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filteredAssessments.map((a: any) => (
                    <tr key={a.id || a._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{a.title}</div>
                        <div className="text-xs text-gray-400">Created: {a.createdAt} • Attempts limit: {a.attemptsAllowed}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                        {a.courseName}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge color={a.status === 'published' ? 'success' : 'warning'}>
                          {a.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                        {a.questionsCount || (a.questions ? a.questions.length : 0)} Qs
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                        {a.timeLimitMinutes || a.duration || 30} mins
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                        {a.passingScore}%
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                        {a.studentAttempts || 0} attempts
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {a.averageScore || 0}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(a)}
                            className="px-2 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {a.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(a)}
                            className="px-2 py-1 text-xs font-medium rounded-md border border-brand-300 text-brand-600 hover:bg-brand-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id || a._id)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Create / Edit Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-3xl rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto my-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Node.js Event Loop & Microservices Architecture"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description for students..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Course</label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="">General (No specific course)</option>
                      {courseList.map((c: any) => (
                        <option key={c.id || c._id} value={c.id || c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Marks (%)</label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attempts Allowed</label>
                    <input
                      type="number"
                      value={attemptsAllowed}
                      onChange={(e) => setAttemptsAllowed(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="shuffleQuestions"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="shuffleQuestions" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Shuffle question order during student attempts
                  </label>
                </div>
              </div>

              {/* Question Management */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Question Builder ({questions.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1 bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-bold rounded-lg"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Question #{idx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Question text..."
                          value={q.question}
                          onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white"
                        >
                          <option value="mcq">MCQ</option>
                          <option value="true_false">True / False</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>
                    </div>

                    {q.type === 'mcq' && (
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => {
                              const opts = [...q.options];
                              opts[optIdx] = e.target.value;
                              handleQuestionChange(idx, 'options', opts);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                          />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Correct Answer</label>
                        {q.type === 'true_false' ? (
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                          >
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Exact correct answer"
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Marks</label>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleQuestionChange(idx, 'marks', Number(e.target.value))}
                          className="w-full px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Assessment to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorAssessments;
