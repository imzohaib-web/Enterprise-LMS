import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadCrumb from '../../../components/common/PageBreadCrumb';
import { selectCurrentUser } from '../../auth/authSlice';
import { getMyCertificates } from '../../../services/certificateService';
import type { StudentCertificateItem } from '../../../services/certificateService';
import { STUDENT, getCourseLearnRoute } from '../../../constants/routes';

export const StudentCertificates: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const userId = user?._id || (user as any)?.id;

  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<StudentCertificateItem | null>(null);

  // 1. Fetch Student Certificates from Backend
  const {
    data: certificates = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentCertificatesPage', userId],
    queryFn: async () => await getMyCertificates(),
    enabled: !!userId,
  });

  // Filtered Certificates
  const filteredCertificates = certificates.filter((cert) => {
    const courseTitle =
      typeof cert.courseId === 'object' ? cert.courseId?.title : '';
    const code = cert.verificationCode || '';
    const searchLower = search.toLowerCase();

    return (
      courseTitle.toLowerCase().includes(searchLower) ||
      code.toLowerCase().includes(searchLower)
    );
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Verification code copied to clipboard!');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <PageMeta
        title="My Earned Certificates | Student Portal"
        description="View, download, and verify your official course completion certificates."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <PageBreadCrumb pageTitle="My Certificates" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Official verified credentials earned for course completions.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        {certificates.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs flex items-center gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search certificates by course title or verification code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
              Showing {filteredCertificates.length} of {certificates.length}
            </span>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="p-8 border border-rose-200 dark:border-rose-900/40 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Unable to Load Certificates</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {(error as any)?.message || 'An error occurred while fetching your certificates.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Retry Loading
            </button>
          </div>
        ) : certificates.length === 0 ? (
          /* Empty State */
          <div className="p-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-3xl font-bold shadow-xs">
              🎓
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">No Certificates Earned Yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Complete all lessons and required quizzes in an enrolled course to receive your official verified certificate of completion.
              </p>
            </div>
            <Link
              to={STUDENT.COURSES}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              <span>Browse Course Catalog</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 italic">
            No certificates match your search query "{search}".
          </div>
        ) : (
          /* Certificate Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => {
              const courseObj = typeof cert.courseId === 'object' ? cert.courseId : null;
              const courseTitle = courseObj?.title || 'Course Certificate';
              const courseIdStr = courseObj?._id || (typeof cert.courseId === 'string' ? cert.courseId : '');
              const studentName =
                typeof cert.studentId === 'object'
                  ? `${cert.studentId.firstName || ''} ${cert.studentId.lastName || ''}`.trim()
                  : `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

              return (
                <div
                  key={cert._id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Thumbnail / Card Header */}
                  <div className="relative p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ✓ Verified Credential
                      </span>
                      <span className="text-[10px] text-indigo-200 font-mono">
                        {formatDate(cert.issuedAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold line-clamp-2 leading-snug">
                      {courseTitle}
                    </h3>

                    <p className="text-xs text-indigo-200">
                      Issued to: <span className="font-bold text-white">{studentName}</span>
                    </p>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    {/* Verification Code Box */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Verification Code</span>
                        <span className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate block">
                          {cert.verificationCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(cert.verificationCode)}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition flex-shrink-0"
                        title="Copy Verification Code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCert(cert)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition text-center shadow-2xs"
                        >
                          Preview
                        </button>
                        {cert.certificateUrl ? (
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition text-center shadow-2xs inline-flex items-center justify-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                          </a>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl text-center cursor-not-allowed"
                          >
                            PDF Pending
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <Link
                          to={`/verify/${encodeURIComponent(cert.verificationCode)}`}
                          target="_blank"
                          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>Public Verification</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>

                        {courseIdStr && (
                          <Link
                            to={getCourseLearnRoute(courseIdStr)}
                            className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium"
                          >
                            View Course &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certificate Preview Modal */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setSelectedCert(null)}
            />
            <div className="relative max-w-3xl w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Certificate Preview</h3>
                  <p className="text-xs text-gray-400">Code: {selectedCert.verificationCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body / Viewer */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Certificate Banner Simulation / Viewer */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white text-center space-y-4 border-4 border-amber-500/40 shadow-inner relative overflow-hidden">
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-amber-400 uppercase tracking-widest border border-amber-500/30 px-2 py-0.5 rounded">
                    Official Credential
                  </div>

                  <div className="py-4 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 block">Certificate of Completion</span>
                    <h2 className="text-2xl font-black text-white">
                      {typeof selectedCert.courseId === 'object' ? selectedCert.courseId?.title : 'Course Module'}
                    </h2>
                    <p className="text-xs text-gray-300">
                      This is proudly presented to <strong className="text-amber-400 text-sm block mt-1">{user?.firstName} {user?.lastName}</strong>
                    </p>
                    <p className="text-[11px] text-gray-400">Issued on {formatDate(selectedCert.issuedAt)}</p>
                  </div>

                  {/* QR Code image if present */}
                  {selectedCert.qrCode && (
                    <div className="inline-block p-2 bg-white rounded-xl mx-auto shadow-md">
                      <img src={selectedCert.qrCode} alt="QR Verification" className="w-20 h-20" />
                    </div>
                  )}
                </div>

                {/* PDF Embedded View */}
                {selectedCert.certificateUrl && (
                  <div className="w-full h-80 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100">
                    <iframe
                      src={selectedCert.certificateUrl}
                      title="Certificate PDF"
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <Link
                  to={`/verify/${encodeURIComponent(selectedCert.verificationCode)}`}
                  target="_blank"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open Verification Page &rarr;
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCert(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    Close
                  </button>
                  {selectedCert.certificateUrl && (
                    <a
                      href={selectedCert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentCertificates;
