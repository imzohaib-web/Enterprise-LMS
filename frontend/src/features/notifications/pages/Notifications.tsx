import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import toast from 'react-hot-toast';
import { selectCurrentUser } from '../../auth/authSlice';
import {
  useInstructorNotifications,
  useInstructorSentNotifications,
  useSendInstructorNotification,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useInstructorCourses,
  useStudentProgressList,
} from '../../instructor-dashboard/hooks/useInstructorDashboard';
import {
  useNotifications as useStudentNotifications,
  useMarkAsRead as useStudentMarkAsRead,
  useMarkAllRead as useStudentMarkAllRead,
} from '../hooks/useNotifications';

const NOTIFICATION_TYPES = [
  { value: 'announcement', label: 'General Announcement' },
  { value: 'course_update', label: 'Course Update' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'important', label: 'Important' },
  { value: 'reminder', label: 'Reminder' },
];

export const Notifications: React.FC = () => {
  const currentUser = useSelector(selectCurrentUser);
  const isInstructor =
    currentUser?.role === 'instructor' ||
    currentUser?.role === 'admin' ||
    window.location.pathname.includes('/instructor');

  // Active tab state for instructors: 'received' | 'sent'
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Composer Modal state
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [recipientScope, setRecipientScope] = useState<'all' | 'specific'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<string>('announcement');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Instructor Data Queries
  const { data: instructorAlerts, isLoading: isAlertsLoading, isError: isAlertsError } =
    useInstructorNotifications();
  const { data: sentHistory, isLoading: isSentLoading, isError: isSentError } =
    useInstructorSentNotifications();
  const { data: instructorCourses = [] } = useInstructorCourses();

  // Enrolled students for selected course in composer
  const { data: enrolledStudentsProgress = [], isLoading: isStudentsLoading } =
    useStudentProgressList(selectedCourseId || undefined);

  // Student Data Queries (for non-instructor student view)
  const { data: studentNotifResponse, isLoading: isStudentLoading } = useStudentNotifications();
  const studentNotifications = studentNotifResponse?.notifications || [];

  // Mutations
  const markInstructorReadMutation = useMarkNotificationRead();
  const markInstructorAllReadMutation = useMarkAllNotificationsRead();
  const sendNotificationMutation = useSendInstructorNotification();
  const studentMarkReadMutation = useStudentMarkAsRead();
  const studentMarkAllReadMutation = useStudentMarkAllRead();

  // Active notifications count
  const unreadCount = isInstructor
    ? instructorAlerts?.filter((n) => !n.isRead).length || 0
    : studentNotifications.filter((n) => !n.isRead).length || 0;

  // Deduplicate enrolled students list by studentId
  const uniqueEnrolledStudents = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string; avatar: string }>();
    enrolledStudentsProgress.forEach((p) => {
      if (p.studentId && !map.has(p.studentId)) {
        map.set(p.studentId, {
          id: p.studentId,
          name: p.studentName || 'Student',
          email: p.studentEmail || '',
          avatar: p.avatar || '',
        });
      }
    });
    return Array.from(map.values());
  }, [enrolledStudentsProgress]);

  // Filtered students by search term
  const filteredStudents = uniqueEnrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleOpenComposer = () => {
    setIsComposerOpen(true);
    setValidationError('');
    // Auto-select first course if available
    if (instructorCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(instructorCourses[0]._id || (instructorCourses[0] as any).id);
    }
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
    setValidationError('');
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedStudentIds([]);
    setValidationError('');
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
    setValidationError('');
  };

  const handleSelectAllStudents = () => {
    setSelectedStudentIds(uniqueEnrolledStudents.map((s) => s.id));
    setValidationError('');
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedCourseId) {
      setValidationError('Please select a course.');
      return;
    }

    if (!title.trim()) {
      setValidationError('Please enter a notification title.');
      return;
    }

    if (!message.trim()) {
      setValidationError('Please enter a notification message.');
      return;
    }

    if (recipientScope === 'specific' && selectedStudentIds.length === 0) {
      setValidationError('Please select at least one enrolled student to receive this notification.');
      return;
    }

    sendNotificationMutation.mutate(
      {
        courseId: selectedCourseId,
        recipientScope,
        recipientStudentIds: recipientScope === 'specific' ? selectedStudentIds : undefined,
        type: notificationType,
        title: title.trim(),
        message: message.trim(),
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || `Notification sent successfully to ${res.count || 0} student(s).`);
          // Reset form
          setTitle('');
          setMessage('');
          setSelectedStudentIds([]);
          setRecipientScope('all');
          setIsComposerOpen(false);
          setActiveTab('sent');
        },
        onError: (err: any) => {
          const errMsg = err?.response?.data?.message || 'Failed to send notification. Please check form details.';
          setValidationError(errMsg);
          toast.error(errMsg);
        },
      }
    );
  };

  const handleMarkRead = (id: string) => {
    if (isInstructor) {
      markInstructorReadMutation.mutate(id);
    } else {
      studentMarkReadMutation.mutate(id);
    }
  };

  const handleMarkAllRead = () => {
    if (isInstructor) {
      markInstructorAllReadMutation.mutate();
    } else {
      studentMarkAllReadMutation.mutate();
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'important':
        return 'error';
      case 'assessment':
      case 'assignment':
        return 'warning';
      case 'course_update':
      case 'update':
        return 'info';
      case 'reminder':
        return 'light';
      default:
        return 'success';
    }
  };

  return (
    <>
      <PageMeta
        title="Notification Center | Enterprise LMS"
        description="Course updates, system notifications, and direct announcements"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-brand-500 text-white">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isInstructor
                ? 'Manage system alerts, course notifications, and student announcements.'
                : 'Stay updated with your enrolled courses, assignments, and announcements.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markInstructorAllReadMutation.isPending || studentMarkAllReadMutation.isPending}
                className="px-4 py-2.5 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Mark All as Read
              </button>
            )}

            {isInstructor && (
              <button
                type="button"
                onClick={handleOpenComposer}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Send Notification
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation for Instructors */}
        {isInstructor && (
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Received Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Sent Notifications ({sentHistory?.length || 0})
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {isInstructor && activeTab === 'sent' ? (
          /* Sent Notifications History Tab */
          <ComponentCard title="Sent Notifications History" desc="Notifications composed and sent to course students">
            {isSentLoading ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading sent notifications...</div>
            ) : isSentError ? (
              <div className="py-12 text-center text-sm text-rose-500">Failed to load sent notifications history.</div>
            ) : sentHistory && sentHistory.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {sentHistory.map((item) => (
                  <div key={item.id} className="py-4 px-2 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          Course: {item.courseTitle}
                        </span>
                        <Badge color={getTypeBadgeColor(item.type)}>{item.type.replace('_', ' ')}</Badge>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        Sent: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recently'}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{item.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        Recipients ({item.recipientScope === 'all' ? 'All Students' : 'Specific Students'}): {item.totalRecipients} student(s)
                      </span>
                      {item.recipientNames && item.recipientNames.length > 0 && (
                        <span className="truncate max-w-md text-gray-400">
                          ({item.recipientNames.slice(0, 4).join(', ')}{item.recipientNames.length > 4 ? ` +${item.recipientNames.length - 4} more` : ''})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                You have not sent any course notifications yet. Click <strong>[ + Send Notification ]</strong> to send your first message.
              </div>
            )}
          </ComponentCard>
        ) : (
          /* Received Notifications Tab (for Instructors) or Student View */
          <ComponentCard
            title={isInstructor ? 'Recent Instructor Alerts' : 'Recent Notifications'}
            desc={isInstructor ? 'Synchronized system alerts & activity updates' : 'Official course updates and announcements'}
          >
            {(isInstructor ? isAlertsLoading : isStudentLoading) ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading notifications...</div>
            ) : (isInstructor ? isAlertsError : false) ? (
              <div className="py-12 text-center text-sm text-rose-500">Failed to load notifications.</div>
            ) : (isInstructor ? instructorAlerts : studentNotifications) &&
              (isInstructor ? instructorAlerts!.length > 0 : studentNotifications.length > 0) ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {(isInstructor ? instructorAlerts! : studentNotifications).map((n) => (
                  <div
                    key={n.id}
                    className={`py-4 px-2 flex items-start justify-between gap-4 transition-colors ${
                      !n.isRead ? 'bg-brand-50/30 dark:bg-brand-500/5 rounded-xl p-3' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{n.title}</h3>
                        <Badge color={getTypeBadgeColor(n.type)}>{n.type.replace('_', ' ')}</Badge>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{n.message}</p>
                      <p className="text-[11px] text-gray-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                You currently have no notifications.
              </div>
            )}
          </ComponentCard>
        )}
      </div>

      {/* Instructor Notification Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    Send Course Notification
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Compose and dispatch targeted updates to enrolled students.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseComposer}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSendNotification} className="p-6 space-y-5 overflow-y-auto flex-1">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  ⚠️ {validationError}
                </div>
              )}

              {/* 1. Course Selector */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Course *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="" disabled>
                    -- Select one of your taught courses --
                  </option>
                  {instructorCourses.map((c) => {
                    const cId = c._id || (c as any).id;
                    return (
                      <option key={cId} value={cId}>
                        {c.title} ({(c as any).level || 'course'})
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Only courses taught and owned by you are available.
                </p>
              </div>

              {/* 2. Recipient Scope */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                  Recipient Scope *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      recipientScope === 'all'
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipientScope"
                      value="all"
                      checked={recipientScope === 'all'}
                      onChange={() => {
                        setRecipientScope('all');
                        setValidationError('');
                      }}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                    <div>
                      <div className="text-xs font-bold">All students in selected course</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        Broadcast to every active student enrolled in this course ({uniqueEnrolledStudents.length})
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      recipientScope === 'specific'
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipientScope"
                      value="specific"
                      checked={recipientScope === 'specific'}
                      onChange={() => {
                        setRecipientScope('specific');
                        setValidationError('');
                      }}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                    <div>
                      <div className="text-xs font-bold">Specific student(s) in course</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        Select specific enrolled student recipients
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Specific Student Checkboxes */}
              {recipientScope === 'specific' && (
                <div className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Select Enrolled Students ({selectedStudentIds.length} of {uniqueEnrolledStudents.length} selected)
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllStudents}
                        className="text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllStudents}
                        className="text-gray-500 hover:underline font-medium cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Search input for students */}
                  {uniqueEnrolledStudents.length > 5 && (
                    <input
                      type="text"
                      placeholder="Search enrolled students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none"
                    />
                  )}

                  {/* Scrollable list */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 pr-1">
                    {isStudentsLoading ? (
                      <div className="py-6 text-center text-xs text-gray-400">Loading enrolled students...</div>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => {
                        const isChecked = selectedStudentIds.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className="flex items-center justify-between py-2 px-2 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleStudent(s.id)}
                                className="rounded text-brand-500 focus:ring-brand-500"
                              />
                              <div>
                                <div className="text-xs font-bold text-gray-900 dark:text-white">
                                  {s.name}
                                </div>
                                <div className="text-[11px] text-gray-400">{s.email}</div>
                              </div>
                            </div>
                            {isChecked && (
                              <span className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400">
                                Selected
                              </span>
                            )}
                          </label>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-xs text-gray-400">
                        {uniqueEnrolledStudents.length === 0
                          ? 'No students are currently enrolled in this course.'
                          : 'No enrolled students match your search.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Notification Type & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5">
                    Notification Type
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {NOTIFICATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="e.g. New Lecture Available"
                    required
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* 5. Message Content */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setValidationError('');
                  }}
                  rows={4}
                  placeholder="Enter detailed notification message for enrolled students..."
                  required
                  maxLength={2000}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                  <span>Enrolled students will receive instant in-app alerts.</span>
                  <span>{message.length} / 2000</span>
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseComposer}
                  className="px-5 py-2.5 text-xs font-extrabold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendNotificationMutation.isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {sendNotificationMutation.isPending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Notification'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
