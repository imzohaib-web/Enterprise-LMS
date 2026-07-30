import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import { ShootingStarIcon, CheckCircleIcon, ErrorIcon } from '../../../icons';

type VerificationState = 'WAITING' | 'SUCCESS' | 'INVALID';

interface VerifiedCertDetails {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  code: string;
  grade: string;
  instructor: string;
}

export const PublicVerifyCertificatePage: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [inputCode, setInputCode] = useState(urlCode || '');
  const [status, setStatus] = useState<VerificationState>(urlCode ? 'SUCCESS' : 'WAITING');
  const [certData, setCertData] = useState<VerifiedCertDetails | null>(
    urlCode
      ? {
          studentName: 'Alex Student',
          courseTitle: 'Full Stack React + Node Architecture',
          issueDate: 'July 15, 2026',
          code: urlCode.toUpperCase(),
          grade: '95% (Distinction)',
          instructor: 'Dr. Elena Rostova',
        }
      : null
  );

  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
      handleVerifyCode(urlCode);
    }
  }, [urlCode]);

  const handleVerifyCode = (targetCode: string) => {
    const cleanCode = targetCode.trim().toUpperCase();
    if (!cleanCode) {
      setStatus('WAITING');
      setCertData(null);
      return;
    }

    // Dummy client-side verification lookup state
    if (cleanCode.startsWith('INVALID') || cleanCode === '0000') {
      setStatus('INVALID');
      setCertData(null);
    } else {
      setStatus('SUCCESS');
      setCertData({
        studentName: 'Alex Student',
        courseTitle: 'Full Stack React + Node Architecture',
        issueDate: 'July 15, 2026',
        code: cleanCode.startsWith('LMS-') ? cleanCode : `LMS-CERT-${cleanCode}`,
        grade: '95% (Distinction)',
        instructor: 'Dr. Elena Rostova',
      });
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode(inputCode);
  };

  return (
    <>
      <PageMeta
        title="Verify Certificate | Enterprise LMS"
        description="Verify official software development and engineering credentials issued by Enterprise LMS."
      />

      <div className="py-12 lg:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3.5 py-1.5 rounded-full">
              Official Credential Validation
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Verify Certificate Authenticity
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the unique verification code printed on the certificate or URL to validate student achievement.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-lg">
            <form onSubmit={onSubmitForm} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Certificate Verification Code
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. LMS-CERT-8842"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 px-4 py-3 text-base bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl font-mono text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 uppercase tracking-wider"
                />
                <button
                  type="submit"
                  className="px-8 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-xs transition-colors whitespace-nowrap"
                >
                  Verify Credential
                </button>
              </div>
              <p className="text-2xs text-gray-500">
                Sample valid codes: <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded font-mono">LMS-CERT-8842</code>, <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded font-mono">LMS-REACT-2026</code>. Enter <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded font-mono">INVALID</code> to test error state.
              </p>
            </form>
          </div>

          {/* Result Card State Machine */}
          <div>
            {status === 'WAITING' && (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-gray-800/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center">
                  <ShootingStarIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Awaiting Verification Request
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Enter a valid certificate code above to load the verified record, course details, and issuing authority.
                </p>
              </div>
            )}

            {status === 'SUCCESS' && certData && (
              <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border-2 border-emerald-500/50 dark:border-emerald-500/30 shadow-xl space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-2xl">
                      <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 text-2xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full">
                        Official & Valid
                      </span>
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                        Certificate Verified
                      </h2>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider block">Verification ID</span>
                    <span className="text-sm font-mono font-bold text-brand-500">{certData.code}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Student Name</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{certData.studentName}</span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Course Completed</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{certData.courseTitle}</span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Issue Date</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{certData.issueDate}</span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Final Score / Grade</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{certData.grade}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500">
                  <span>Issued By: <strong>{certData.instructor}</strong></span>
                  <span className="text-emerald-600 font-semibold">✓ Cryptographically Signed</span>
                </div>
              </div>
            )}

            {status === 'INVALID' && (
              <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border-2 border-rose-500/50 dark:border-rose-500/30 shadow-xl space-y-4 animate-fadeIn text-center">
                <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                  <ErrorIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Invalid Verification Code
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  No certificate record was found matching code <code className="font-mono text-rose-500 font-bold">{inputCode}</code>. Please verify the code on your credential or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicVerifyCertificatePage;
