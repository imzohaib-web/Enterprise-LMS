import React, { useState, useMemo } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useInstructorCertificates,
  useInstructorCourses,
} from '../hooks/useInstructorDashboard';
import { InstructorCertificate } from '../types';

export const InstructorCertificatesPage: React.FC = () => {
  const { data: certificates, isLoading, isError } = useInstructorCertificates();
  const { data: courses } = useInstructorCourses();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  // Preview Modal state
  const [previewCert, setPreviewCert] = useState<InstructorCertificate | null>(null);

  // Filter logic
  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];

    return certificates.filter((c) => {
      const matchesSearch =
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.verificationCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourseId === 'all' || c.courseId === selectedCourseId || c.courseTitle === selectedCourseId;

      return matchesSearch && matchesCourse;
    });
  }, [certificates, searchTerm, selectedCourseId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Verification code "${code}" copied to clipboard!`);
  };

  return (
    <>
      <PageMeta
        title="Issued Certificates | Instructor Portal"
        description="View and verify official certificates generated for students enrolled in your courses"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Course Completion Certificates
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Official certificates issued to students who completed your assigned courses. Search, inspect details, or verify authenticity codes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              🎓 {certificates?.length || 0} Total Certificates Issued
            </span>
          </div>
        </div>

        {/* Toolbar: Search & Course Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-500 dark:text-gray-400 mb-1">Search Certificates</label>
            <input
              type="text"
              placeholder="Search by student, email, course title, or verification code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-500 dark:text-gray-400 mb-1">Filter by Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Taught Courses ({courses?.length || 0})</option>
              {courses?.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id || c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Certificates Table Card */}
        <ComponentCard title={`Issued Certificates (${filteredCertificates.length})`} desc="Directly populated from MongoDB certificate records">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading issued certificates...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-rose-500">Failed to load certificates.</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No matching certificates found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Completed Course</th>
                    <th className="py-3 px-4">Verification Code</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        <img
                          src={cert.studentAvatar || '/images/user/owner.jpg'}
                          alt={cert.studentName}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-xs">{cert.studentName}</p>
                          <p className="text-2xs text-gray-400 font-normal">{cert.studentEmail}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-800 dark:text-gray-200">
                        {cert.courseTitle}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopyCode(cert.verificationCode)}
                          className="inline-flex items-center gap-1 font-mono text-2xs font-bold text-gray-800 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700"
                          title="Click to copy code"
                        >
                          📋 {cert.verificationCode}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="solid" color="success">
                          {cert.status || 'Valid'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="px-2.5 py-1.5 text-2xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-900/30 dark:text-brand-400"
                        >
                          Preview Details
                        </button>

                        {cert.certificateUrl && (
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-2xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400"
                          >
                            📄 Open PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Modal: Certificate Inspection & Verification Details */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Certificate Verification Details
              </h3>
              <button
                onClick={() => setPreviewCert(null)}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-3">
              <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                <img
                  src={previewCert.studentAvatar || '/images/user/owner.jpg'}
                  alt={previewCert.studentName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{previewCert.studentName}</p>
                  <p className="text-2xs text-gray-400">{previewCert.studentEmail}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-400">Course: </span>
                <span className="font-bold text-gray-900 dark:text-white">{previewCert.courseTitle}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-400">Verification Code: </span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {previewCert.verificationCode}
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-400">Issue Date: </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(previewCert.issuedAt).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-400">Status: </span>
                <Badge variant="solid" color="success">
                  Official Valid Certificate
                </Badge>
              </div>

              {previewCert.qrCode && (
                <div className="pt-2 flex flex-col items-center justify-center">
                  <p className="text-2xs font-semibold text-gray-400 mb-1">Verification QR Code</p>
                  <img src={previewCert.qrCode} alt="Verification QR Code" className="w-24 h-24 border rounded-lg bg-white p-1" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Close
              </button>
              {previewCert.certificateUrl && (
                <a
                  href={previewCert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  📄 View PDF Document
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorCertificatesPage;
