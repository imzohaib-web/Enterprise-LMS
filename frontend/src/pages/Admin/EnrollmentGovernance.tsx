import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { adminService } from '../../services/admin.service';

const EnrollmentGovernance: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal state for revoking an enrollment
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch enrollments query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'enrollments', page, statusFilter, debouncedSearch],
    queryFn: async () => {
      const res = await adminService.listEnrollments({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
      });
      return res.data;
    },
    retry: 1,
  });

  const enrollments = data?.data?.enrollments || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleRevokeConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;
    if (!revokeReason.trim()) {
      toast.error('Please specify a valid reason for revoking this enrollment');
      return;
    }

    setIsRevoking(true);
    try {
      await adminService.revokeEnrollment(selectedEnrollment._id, revokeReason.trim());
      toast.success('Enrollment revoked successfully!');
      setSelectedEnrollment(null);
      setRevokeReason('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revoke enrollment');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Enrollment Governance & Access Control" />

      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            System Enrollment Management
          </h2>
          <p className="text-xs text-gray-500">
            Monitor, inspect, and revoke course access across all student enrollments enterprise-wide.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
            Total Records: {meta.total}
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, or course title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'active', 'completed', 'dropped', 'revoked'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition capitalize ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">
            Loading system enrollment records...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-red-500">
            Failed to load enrollment records.{' '}
            <button onClick={() => refetch()} className="underline font-bold">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/50 uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5 text-left">Student Identity</th>
                  <th className="px-6 py-3.5 text-left">Target Course</th>
                  <th className="px-6 py-3.5 text-left">Enrollment Status</th>
                  <th className="px-6 py-3.5 text-left">Progress</th>
                  <th className="px-6 py-3.5 text-left">Enrolled Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {enrollments.map((item: any) => {
                  const student = item.student || {};
                  const course = item.course || {};
                  const progressPct = item.progressPercentage || 0;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                            {student.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {student.firstName ? `${student.firstName} ${student.lastName || ''}` : 'Unknown Student'}
                            </div>
                            <div className="text-[11px] text-gray-400">{student.email || '—'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-[220px]">
                          {course.title || 'Untitled Course'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {course.category?.name || 'General'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-full capitalize ${
                            item.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : item.status === 'completed'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                              : item.status === 'revoked'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.status === 'revoked' && item.revokeReason && (
                          <div className="text-[10px] text-rose-500 mt-1 italic line-clamp-1" title={item.revokeReason}>
                            Reason: {item.revokeReason}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-[80px] overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-gray-500">{progressPct}%</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                        {new Date(item.enrolledAt || item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {item.status !== 'revoked' && item.status !== 'dropped' ? (
                          <button
                            onClick={() => {
                              setSelectedEnrollment(item);
                              setRevokeReason('');
                            }}
                            className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 rounded-lg text-xs font-bold transition"
                          >
                            Revoke Access
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Revoked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No enrollment records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Revoke Student Enrollment
                </h3>
                <p className="text-xs text-gray-500">
                  This will immediately terminate access to course materials for this student.
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-1 text-xs">
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Student:</strong>{' '}
                {selectedEnrollment.student?.firstName
                  ? `${selectedEnrollment.student.firstName} ${selectedEnrollment.student.lastName || ''} (${selectedEnrollment.student.email})`
                  : 'Selected Student'}
              </div>
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Course:</strong>{' '}
                {selectedEnrollment.course?.title || 'Selected Course'}
              </div>
            </div>

            <form onSubmit={handleRevokeConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Revoke Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Provide an official administrative reason for revoking enrollment (e.g. refund issued, policy violation)..."
                  className="w-full p-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedEnrollment(null)}
                  className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRevoking}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {isRevoking ? 'Revoking Access...' : 'Confirm & Revoke Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentGovernance;
