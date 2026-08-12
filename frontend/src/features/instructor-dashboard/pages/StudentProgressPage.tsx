import React, { useState, useMemo } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useStudentProgressList,
  useInstructorCourses,
  useCreateDiscussion,
} from '../hooks/useInstructorDashboard';
import { StudentProgressItem } from '../types';

type SortField = 'studentName' | 'courseName' | 'progressPercent' | 'avgScore' | 'lastActive';
type SortOrder = 'asc' | 'desc';

export const StudentProgressPage: React.FC = () => {
  const { data: students, isLoading, isError } = useStudentProgressList();
  const { data: courses } = useInstructorCourses();
  const sendMessageMutation = useCreateDiscussion();

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('lastActive');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressItem | null>(null);
  const [messagingStudent, setMessagingStudent] = useState<StudentProgressItem | null>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // ── Filter & Sort Logic ──────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    if (!students) return [];

    let result = students.filter((s) => {
      const matchesSearch =
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courseName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourseId === 'all' || s.courseId === selectedCourseId || s.courseName === selectedCourseId;

      return matchesSearch && matchesCourse;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'lastActive') {
        valA = new Date(a.lastActive).getTime();
        valB = new Date(b.lastActive).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, searchTerm, selectedCourseId, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };


  // ── Export CSV Handler ──────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!filteredAndSorted || filteredAndSorted.length === 0) return;

    const headers = ['Student Name', 'Student Email', 'Course Name', 'Modules Completed', 'Total Modules', 'Progress %', 'Avg Quiz Score %', 'Status', 'Last Active'];
    const rows = filteredAndSorted.map((s) => [
      `"${s.studentName}"`,
      `"${s.studentEmail}"`,
      `"${s.courseName}"`,
      s.completedModules,
      s.totalModules,
      `${s.progressPercent}%`,
      `${s.avgScore}%`,
      `"${s.status || 'active'}"`,
      `"${new Date(s.lastActive).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-roster-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Direct Message / Notification Handler ────────────────────────────────
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingStudent || !messageTitle || !messageContent) return;

    sendMessageMutation.mutate(
      {
        title: `[Direct Note to ${messagingStudent.studentName}] ${messageTitle}`,
        content: messageContent,
        courseName: messagingStudent.courseName,
      },
      {
        onSuccess: () => {
          setMessagingStudent(null);
          setMessageTitle('');
          setMessageContent('');
          alert('Notification/Message successfully dispatched to student!');
        },
      }
    );
  };

  return (
    <>
      <PageMeta
        title="Student Management & Progress | Instructor Portal"
        description="Track enrolled students, completion progress, quiz scores, and view detailed student timelines"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Enrolled Students Roster
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Strictly filtered to learners enrolled in your assigned courses. View progress metrics, quiz results, and activity timelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={!filteredAndSorted || filteredAndSorted.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
            >
              📥 Export Roster (CSV)
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm text-xs">
          {/* Search */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-500 dark:text-gray-400 mb-1">Search Students</label>
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Course Filter */}
          <div>
            <label className="block font-semibold text-gray-500 dark:text-gray-400 mb-1">Filter by Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Courses ({courses?.length || 0})</option>
              {courses?.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id || c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roster Table Card */}
        <ComponentCard
          title={`Enrolled Learners (${filteredAndSorted.length})`}
          desc="Authorized student data derived from MongoDB enrollment records"
        >
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading student roster...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load enrolled student records.</div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No student records match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                    <th
                      onClick={() => handleSort('studentName')}
                      className="py-3 px-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Student {sortField === 'studentName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('courseName')}
                      className="py-3 px-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Course {sortField === 'courseName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('progressPercent')}
                      className="py-3 px-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Completion Progress {sortField === 'progressPercent' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('avgScore')}
                      className="py-3 px-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Avg Quiz Score {sortField === 'avgScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4">Status</th>
                    <th
                      onClick={() => handleSort('lastActive')}
                      className="py-3 px-4 text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Last Active {sortField === 'lastActive' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filteredAndSorted.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        <img
                          src={item.avatar || '/images/user/owner.jpg'}
                          alt={item.studentName}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-xs">{item.studentName}</p>
                          <p className="text-2xs text-gray-400 font-normal">{item.studentEmail}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.courseName}
                      </td>

                      <td className="py-3 px-4 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progressPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-2xs font-bold text-gray-700 dark:text-gray-300 w-8 text-right">
                            {item.progressPercent}%
                          </span>
                        </div>
                        <p className="text-2xs text-gray-400 mt-1">
                          {item.completedModules} / {item.totalModules} Modules
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-extrabold ${
                            item.avgScore >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.avgScore >= 60
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.avgScore}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="solid"
                          color={item.status === 'completed' || item.progressPercent >= 100 ? 'success' : 'info'}
                        >
                          {item.status === 'completed' || item.progressPercent >= 100 ? 'Completed' : 'Active'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right text-2xs text-gray-400">
                        {new Date(item.lastActive).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedStudent(item)}
                          className="px-2.5 py-1 text-2xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-900/30 dark:text-brand-400"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setMessagingStudent(item)}
                          className="px-2.5 py-1 text-2xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400"
                        >
                          Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Modal: Detailed Student Profile & Progress Timeline */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.avatar || '/images/user/owner.jpg'}
                  alt={selectedStudent.studentName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-500"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedStudent.studentName}
                  </h3>
                  <p className="text-xs text-gray-400">{selectedStudent.studentEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 font-medium">Course Enrolled</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.courseName}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Progress</span>
                <p className="font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                  {selectedStudent.progressPercent}% ({selectedStudent.completedModules}/{selectedStudent.totalModules} Mods)
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Avg Quiz Score</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedStudent.avgScore}%</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Status</span>
                <div className="mt-0.5">
                  <Badge
                    variant="solid"
                    color={selectedStudent.status === 'completed' || selectedStudent.progressPercent >= 100 ? 'success' : 'info'}
                  >
                    {selectedStudent.status === 'completed' || selectedStudent.progressPercent >= 100 ? 'Completed' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quiz Performance Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Quiz & Assessment Performance</h4>
              {!selectedStudent.quizAttempts || selectedStudent.quizAttempts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No quiz attempts recorded for this course yet.</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedStudent.quizAttempts.map((qa) => (
                    <div
                      key={qa.id}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{qa.quizTitle}</p>
                        <p className="text-2xs text-gray-400">
                          Attempted: {new Date(qa.attemptDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{qa.percentage}%</span>
                        <Badge variant="solid" color={qa.passed ? 'success' : 'error'}>
                          {qa.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assignment Submissions Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Assignment Submissions</h4>
              {!selectedStudent.assignmentSubmissions || selectedStudent.assignmentSubmissions.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No assignment submissions submitted yet.</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedStudent.assignmentSubmissions.map((asub) => (
                    <div
                      key={asub.id}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{asub.assignmentTitle}</p>
                        {asub.fileUrl && (
                          <a
                            href={asub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xs text-brand-600 hover:underline font-semibold"
                          >
                            📁 {asub.fileName || 'Download Submission File'}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {asub.status === 'graded' ? `${asub.score} / ${asub.maxScore} pts` : 'Not Graded'}
                        </span>
                        <Badge variant="solid" color={asub.status === 'graded' ? 'success' : 'warning'}>
                          {asub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning Activity Timeline */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Progress & Activity Timeline</h4>
              <div className="border-l-2 border-brand-500/30 pl-4 space-y-3 text-xs">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                  <p className="font-semibold text-gray-900 dark:text-white">Enrolled in {selectedStudent.courseName}</p>
                  <p className="text-2xs text-gray-400">
                    {selectedStudent.enrolledAt ? new Date(selectedStudent.enrolledAt).toLocaleDateString() : 'Initial Date'}
                  </p>
                </div>

                {selectedStudent.quizAttempts?.map((qa) => (
                  <div key={`timeline-${qa.id}`} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Completed Quiz: {qa.quizTitle} ({qa.percentage}%)
                    </p>
                    <p className="text-2xs text-gray-400">{new Date(qa.attemptDate).toLocaleDateString()}</p>
                  </div>
                ))}

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Current Milestone: {selectedStudent.completedModules} / {selectedStudent.totalModules} Modules Completed ({selectedStudent.progressPercent}%)
                  </p>
                  <p className="text-2xs text-gray-400">Last active {new Date(selectedStudent.lastActive).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Direct Message / Notification Form */}
      {messagingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Send Direct Note — {messagingStudent.studentName}
            </h3>

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Feedback on Module 3 Assignment"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your note or guidance for the student..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMessagingStudent(null)}
                  className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                >
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentProgressPage;
