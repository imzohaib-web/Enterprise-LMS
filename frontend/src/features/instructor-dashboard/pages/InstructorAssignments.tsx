import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import { TableSkeleton } from '../components/SkeletonLoader';
import {
  useInstructorAssignments,
  useInstructorCourses,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useAssignmentSubmissions,
  useGradeSubmission,
} from '../hooks/useInstructorDashboard';
import { InstructorAssignment, AssignmentSubmissionItem } from '../types';

export const InstructorAssignmentsPage: React.FC = () => {
  const { data: assignments, isLoading, isError } = useInstructorAssignments();
  const { data: courses } = useInstructorCourses();
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<InstructorAssignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmissionItem | null>(null);

  // Bulk state & validation state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ title?: string; courseId?: string }>({});

  const toggleSelectAll = () => {
    if (!assignments) return;
    if (selectedIds.length === assignments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assignments.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected assignment(s)?`)) {
      selectedIds.forEach((id) => deleteMutation.mutate(id));
      setSelectedIds([]);
    }
  };

  // Form state for creating/editing assignment
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  // Grade form state
  const [gradeScore, setGradeScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Fetch submissions for selected assignment
  const {
    data: submissions,
    isLoading: isSubmissionsLoading,
  } = useAssignmentSubmissions(selectedAssignmentForSubmissions ? selectedAssignmentForSubmissions.id : null);

  const gradeMutation = useGradeSubmission();

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setInstructions('');
    setStatus('published');
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setMaxScore(100);
    if (courses && courses.length > 0) {
      setCourseId(courses[0].id || courses[0]._id || '');
    }
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (item: InstructorAssignment) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCourseId(item.courseId);
    setDescription(item.description || '');
    setInstructions(item.instructions || '');
    setStatus((item.status === 'archived' ? 'archived' : item.status === 'draft' ? 'draft' : 'published'));
    setDueDate(new Date(item.dueDate).toISOString().split('T')[0]);
    setMaxScore(item.maxScore || 100);
    setIsCreateOpen(true);
  };

  const handleToggleStatus = (item: InstructorAssignment) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    updateMutation.mutate({ id: item.id, assignmentData: { status: nextStatus } });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; courseId?: string } = {};

    if (!title.trim()) {
      errors.title = 'Assignment title is required';
    }
    if (!courseId) {
      errors.courseId = 'Please select a course for this assignment';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    if (editingId) {
      updateMutation.mutate(
        {
          id: editingId,
          assignmentData: {
            title,
            courseId,
            description,
            instructions,
            dueDate: new Date(dueDate).toISOString(),
            maxScore,
            status,
          },
        },
        {
          onSuccess: () => {
            setIsCreateOpen(false);
            setEditingId(null);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          title,
          courseId,
          description,
          instructions,
          dueDate: new Date(dueDate).toISOString(),
          maxScore,
          status,
        },
        {
          onSuccess: () => {
            setIsCreateOpen(false);
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment? All student submissions will be permanently deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenGrading = (sub: AssignmentSubmissionItem) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score || 0);
    setGradeFeedback(sub.feedback || '');
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    gradeMutation.mutate(
      {
        submissionId: gradingSubmission.id,
        gradeData: {
          score: gradeScore,
          feedback: gradeFeedback,
        },
      },
      {
        onSuccess: () => {
          setGradingSubmission(null);
        },
      }
    );
  };

  return (
    <>
      <PageMeta
        title="Instructor Assignments | Enterprise LMS"
        description="Manage course assignments, view student submissions, and perform manual evaluation"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Assignment & Project Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create homework assignments, review student file submissions, and provide manual grading & feedback.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-xs"
          >
            + Create New Assignment
          </button>
        </div>

        {/* Assignments Table / Card */}
        <ComponentCard title="Active Course Assignments" desc="All homework and project submissions assigned to your enrolled learners">
          {/* Floating Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="mb-4 p-3 bg-brand-500 text-white rounded-xl flex items-center justify-between shadow-md">
              <div className="text-xs font-semibold">
                {selectedIds.length} assignment(s) selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Delete Selected ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load assignments.</div>
          ) : !assignments || assignments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No assignments created yet.</p>
              <button
                onClick={handleOpenCreate}
                className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                + Create your first course assignment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(assignments && assignments.length > 0 && selectedIds.length === assignments.length)}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Title & Course</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Max Score</th>
                    <th className="py-3 px-4">Submissions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {assignments.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-brand-50/40 dark:bg-brand-900/10' : ''}`}>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(item.id)}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</div>
                        <div className="text-2xs text-gray-400 mt-0.5">{item.courseTitle}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {item.maxScore} pts
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {item.submissionCount || 0} Submissions ({item.gradedCount || 0} Graded)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          title="Click to toggle Published / Draft status"
                          className="focus:outline-none"
                        >
                          <Badge variant="solid" color={item.status === 'published' ? 'success' : 'warning'}>
                            {item.status || 'published'}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedAssignmentForSubmissions(item)}
                          className="px-3 py-1.5 text-2xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-900/30 dark:text-brand-400"
                        >
                          View Submissions ({item.submissionCount || 0})
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1.5 text-2xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1.5 text-2xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-900/30"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Modal: Create or Edit Assignment */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Target Course *</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    if (formErrors.courseId) setFormErrors({ ...formErrors, courseId: undefined });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    formErrors.courseId ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">Select a course</option>
                  {courses?.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {formErrors.courseId && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.courseId}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build a RESTful API with Node.js & MongoDB"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formErrors.title) setFormErrors({ ...formErrors, title: undefined });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    formErrors.title ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Max Score (pts) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of the project goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions & Guidelines</label>
                <textarea
                  rows={3}
                  placeholder="Detailed requirements, file submission formats, grading rubric..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update Assignment'
                    : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Submissions for Assignment */}
      {selectedAssignmentForSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Student Submissions — {selectedAssignmentForSubmissions.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Course: {selectedAssignmentForSubmissions.courseTitle} | Max Score: {selectedAssignmentForSubmissions.maxScore} pts
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmissions(null)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold"
              >
                ✕
              </button>
            </div>

            {isSubmissionsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading student submissions...</div>
            ) : !submissions || submissions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <p className="text-xs text-gray-400">No student submissions received for this assignment yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Submitted File</th>
                      <th className="py-2.5 px-3">Submission Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Score / Grade</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                          {sub.studentName}
                          <div className="text-2xs text-gray-400 font-normal">{sub.studentEmail}</div>
                        </td>
                        <td className="py-3 px-3">
                          {sub.fileUrl ? (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                            >
                              📁 {sub.fileName || 'Open File'}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">No File Uploaded</span>
                          )}
                          {sub.textSubmission && (
                            <p className="text-2xs text-gray-500 mt-1 line-clamp-1 italic">"{sub.textSubmission}"</p>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="solid" color={sub.status === 'graded' ? 'success' : 'warning'}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                          {sub.status === 'graded' ? `${sub.score} / ${sub.maxScore}` : 'Not Graded'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenGrading(sub)}
                            className="px-3 py-1 text-2xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-xs"
                          >
                            {sub.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Manual Grading & Feedback Form */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Grade Submission — {gradingSubmission.studentName}
            </h3>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
              <div>
                <span className="font-semibold text-gray-400">Assignment: </span>
                <span className="font-bold text-gray-900 dark:text-white">{gradingSubmission.assignmentTitle}</span>
              </div>
              {gradingSubmission.fileUrl && (
                <div>
                  <span className="font-semibold text-gray-400">Submitted File: </span>
                  <a href={gradingSubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline font-semibold">
                    {gradingSubmission.fileName || 'Download Submission'}
                  </a>
                </div>
              )}
              {gradingSubmission.textSubmission && (
                <div>
                  <span className="font-semibold text-gray-400">Submitted Text Response: </span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">{gradingSubmission.textSubmission}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign Score (Max {gradingSubmission.maxScore} pts) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={gradingSubmission.maxScore}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor Feedback & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide constructive feedback for the student..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradeMutation.isPending}
                  className="px-4 py-2 font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl disabled:opacity-50"
                >
                  {gradeMutation.isPending ? 'Saving Grade...' : 'Save Score & Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorAssignmentsPage;
