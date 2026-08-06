import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { adminService } from '../../services/admin.service';
import type { AuditLogItem } from '../../services/admin.service';

const categoryBadgeStyle: Record<string, string> = {
  auth: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  user: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  course: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  certificate: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  report: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  system: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const severityDotStyle: Record<string, string> = {
  info: 'bg-indigo-500',
  warning: 'bg-amber-500 animate-pulse',
  critical: 'bg-rose-500 animate-ping',
};

const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // ── Fetch Audit Logs Query ──────────────────────────────────────────────────
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-audit-logs', page, limit, search, categoryFilter, severityFilter],
    queryFn: async () => {
      const res = await adminService.getAuditLogs({
        page,
        limit,
        search: search.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
      });
      return res.data;
    },
    refetchInterval: 30000,
    retry: 2,
  });

  const rawLogs = (data?.data as any)?.logs ?? (data as any)?.logs;
  const logs: AuditLogItem[] = Array.isArray(rawLogs) ? rawLogs : [];
  const meta = data?.meta ?? { total: logs.length, page: 1, totalPages: 1 };

  // ── CSV Exporter ──────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No audit log entries available to export');
      return;
    }
    const headers = 'Log ID,Action,Category,Severity,Performed By Name,Performed By Email,Affected Resource,IP Address,Timestamp\n';
    const rows = logs
      .map(
        (l) =>
          `"${l._id}","${l.action}","${l.category}","${l.severity}","${l.performedBy?.firstName || l.performedByName || 'System'}","${
            l.performedBy?.email || l.performedByEmail || 'N/A'
          }","${l.affectedResource}","${l.ipAddress}","${new Date(l.createdAt).toISOString()}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${logs.length} audit log entries to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <PageBreadcrumb pageTitle="Platform Audit Logs & Security Telemetry" />
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-xs -mt-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export Audit Logs (CSV)
        </button>
      </div>

      {/* Security Telemetry KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Event Entries</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{meta.total}</div>
          <span className="text-[11px] text-gray-400 font-medium">Recorded System Operations</span>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Authentication Events</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {logs.filter((l) => l.category === 'auth').length}
          </div>
          <span className="text-[11px] text-indigo-500 font-medium">Logins, Logouts & Sessions</span>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Admin & Role Mutations</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {logs.filter((l) => l.severity === 'warning' || l.action.includes('ROLE')).length}
          </div>
          <span className="text-[11px] text-amber-500 font-medium">Elevated Privilege Changes</span>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">Security Alerts</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {logs.filter((l) => l.severity === 'critical').length}
          </div>
          <span className="text-[11px] text-rose-500 font-medium">Critical Administrative Events</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3 shadow-sm items-center">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by action, user name, email, or IP address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
        >
          <option value="all">All Event Categories</option>
          <option value="auth">Authentication (Login/Logout)</option>
          <option value="user">User Management & Roles</option>
          <option value="course">Course & Moderation</option>
          <option value="certificate">Certificates</option>
          <option value="report">Reports & Exports</option>
          <option value="system">System & Settings</option>
        </select>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
        >
          <option value="all">All Severities</option>
          <option value="info">Info Level</option>
          <option value="warning">Warning Level</option>
          <option value="critical">Critical Level</option>
        </select>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            <p className="text-xs text-gray-400 font-medium">Fetching audit logs...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            Failed to load audit logs. <button onClick={() => refetch()} className="underline ml-2">Retry</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {['Event / Action', 'Performed By', 'Affected Resource', 'IP Address', 'Timestamp', 'Inspect'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {logs.map((log) => {
                    const performerName = log.performedBy ? `${log.performedBy.firstName || ''} ${log.performedBy.lastName || ''}`.trim() : log.performedByName || 'System Auto Engine';
                    const performerEmail = log.performedBy?.email || log.performedByEmail || 'system@lms.local';
                    return (
                      <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDotStyle[log.severity] || 'bg-gray-400'}`} />
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white font-mono tracking-tight">{log.action}</span>
                              <div className="mt-0.5">
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full capitalize ${categoryBadgeStyle[log.category] || 'bg-gray-100 text-gray-700'}`}>
                                  {log.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{performerName}</div>
                          <div className="text-[11px] text-gray-400">{performerEmail}</div>
                        </td>

                        <td className="px-6 py-4 font-mono font-medium text-gray-800 dark:text-gray-200">
                          {log.affectedResource}
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-[11px] text-gray-700 dark:text-gray-300">
                            {log.ipAddress}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500 font-mono text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No audit log events found matching search or category filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 gap-4">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Showing Page {meta.page} of {meta.totalPages || 1} ({meta.total} audit logs)</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={15}>15 per page</option>
                  <option value={30}>30 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-3.5 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNextPage}
                  className="px-3.5 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── AUDIT LOG INSPECTOR DRAWER ────────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg h-full shadow-2xl p-6 flex flex-col justify-between space-y-4 border-l border-gray-100 dark:border-gray-800 overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Audit Event Inspector</h3>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${severityDotStyle[selectedLog.severity]}`} />
                  <span className="font-mono text-lg font-black text-gray-900 dark:text-white">{selectedLog.action}</span>
                </div>
                <div className="mt-1">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${categoryBadgeStyle[selectedLog.category]}`}>
                    {selectedLog.category} • Severity: {selectedLog.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Log ID</span>
                  <span className="font-mono text-gray-900 dark:text-white">{selectedLog._id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Timestamp</span>
                  <span className="font-mono text-gray-900 dark:text-white">{new Date(selectedLog.createdAt).toUTCString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Performed By</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedLog.performedBy ? `${selectedLog.performedBy.firstName} ${selectedLog.performedBy.lastName}` : selectedLog.performedByName || 'System Engine'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Affected Resource</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedLog.affectedResource}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-gray-500 font-medium">Origin IP Address</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{selectedLog.ipAddress}</span>
                </div>
              </div>

              {selectedLog.userAgent && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500">User Agent String</span>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {selectedLog.details && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500">Event Details Payload</span>
                  <pre className="p-3 bg-gray-900 text-indigo-300 rounded-xl text-[11px] font-mono overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
