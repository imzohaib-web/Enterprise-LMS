import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const reports: ReportConfig[] = [
  {
    id: 'students',
    title: 'Student Report',
    description: 'Export all registered students with their account status and registration date.',
    color: 'from-indigo-500 to-purple-600',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'courses',
    title: 'Course Report',
    description: 'Export all courses with enrollment counts, completion rates, and instructor info.',
    color: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'progress',
    title: 'Progress Report',
    description: 'Export all student enrollment records with progress percentages and completion status.',
    color: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const download = async (type: 'students' | 'courses' | 'progress', format: 'csv' | 'pdf') => {
    const key = `${type}-${format}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await adminService.exportReport(type, format);
      const blob = new Blob([res.data as BlobPart], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`${type} report downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to download report');
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Export platform data in CSV or PDF format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header gradient */}
            <div className={`bg-gradient-to-r ${report.color} p-6 text-white`}>
              <div className="mb-3">{report.icon}</div>
              <h3 className="text-lg font-semibold">{report.title}</h3>
              <p className="text-sm text-white/80 mt-1">{report.description}</p>
            </div>

            {/* Actions */}
            <div className="p-5 flex gap-3">
              <button
                id={`export-${report.id}-csv`}
                onClick={() => download(report.id as any, 'csv')}
                disabled={loading[`${report.id}-csv`]}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-60"
              >
                {loading[`${report.id}-csv`] ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : <DownloadIcon />}
                CSV
              </button>
              <button
                id={`export-${report.id}-pdf`}
                onClick={() => download(report.id as any, 'pdf')}
                disabled={loading[`${report.id}-pdf`]}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition disabled:opacity-60"
              >
                {loading[`${report.id}-pdf`] ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : <DownloadIcon />}
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
