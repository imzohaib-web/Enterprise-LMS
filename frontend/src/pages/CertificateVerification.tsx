import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Search,
  ShieldCheck,
  User,
  BookOpen,
  Calendar,
  UserCheck,
  Download,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

import {
  verifyCertificate,
  VerifiedCertificateData,
} from '../services/certificateService';

export const CertificateVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const routeParams = useParams<{ verificationCode?: string }>();

  const [inputCode, setInputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<VerifiedCertificateData | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [searchedCode, setSearchedCode] = useState<string | null>(null);

  // Read verification code from URL (route param, search query param, or window location)
  useEffect(() => {
    const codeFromQuery = searchParams.get('code') || searchParams.get('verificationCode');
    const codeFromPath = routeParams.verificationCode;
    const initialCode = codeFromPath || codeFromQuery || '';

    if (initialCode) {
      setInputCode(initialCode);
      handleVerification(initialCode);
    }
  }, [searchParams, routeParams]);

  const handleVerification = async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim();
    if (!cleanCode) return;

    setLoading(true);
    setErrorState(null);
    setCertificateData(null);
    setSearchedCode(cleanCode);

    try {
      const data = await verifyCertificate(cleanCode);
      setCertificateData(data);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        'Certificate Invalid. The code provided could not be verified in our registry.';
      setErrorState(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      handleVerification(inputCode.trim());
    }
  };

  const handleReset = () => {
    setInputCode('');
    setCertificateData(null);
    setErrorState(null);
    setSearchedCode(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-bodydark py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header / TailAdmin Brand Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 text-primary dark:text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>EZITECH LMS OFFICIAL VERIFICATION PORTAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Verify Certificate Authenticity
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
            Enter the unique certificate verification code below or scan the QR code to verify the validity of credentials issued by Ezitech LMS.
          </p>
        </div>

        {/* Verification Input Form Card */}
        <div className="rounded-sm border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-6 sm:p-8 shadow-default">
          <form onSubmit={onSubmitForm} className="space-y-4">
            <label
              htmlFor="verificationCodeInput"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Verification Code
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  id="verificationCodeInput"
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. EZT-CERT-880CEA-3ZTX"
                  className="w-full rounded-sm border border-stroke dark:border-strokedark bg-slate-50 dark:bg-slate-800/50 pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm sm:text-base tracking-wider uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !inputCode.trim()}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Verify Code
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="rounded-sm border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-12 text-center shadow-default">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Checking Ezitech LMS Registry for code <span className="font-mono text-primary">{searchedCode}</span>...
            </p>
          </div>
        )}

        {/* Certificate Details Card (Success State) */}
        {!loading && certificateData && (
          <div className="rounded-sm border-2 border-emerald-500 bg-white dark:bg-boxdark shadow-lg overflow-hidden transition-all">
            {/* Valid Status Header Banner */}
            <div className="bg-emerald-600 text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <CheckCircle2 className="w-10 h-10 flex-shrink-0 text-white" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
                    Certificate Valid & Authentic
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    Verified record found in official Ezitech LMS Registry.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-emerald-800 tracking-wider uppercase shadow-xs">
                Official Credential
              </span>
            </div>

            {/* Details Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Student Name */}
                <div className="flex items-start space-x-3 p-4 rounded-sm bg-slate-50 dark:bg-slate-800/40 border border-stroke dark:border-strokedark">
                  <User className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Student Name
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {certificateData.studentName}
                    </p>
                  </div>
                </div>

                {/* Course Name */}
                <div className="flex items-start space-x-3 p-4 rounded-sm bg-slate-50 dark:bg-slate-800/40 border border-stroke dark:border-strokedark">
                  <BookOpen className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Course Name
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {certificateData.courseName}
                    </p>
                  </div>
                </div>

                {/* Issue Date */}
                <div className="flex items-start space-x-3 p-4 rounded-sm bg-slate-50 dark:bg-slate-800/40 border border-stroke dark:border-strokedark">
                  <Calendar className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Issue Date
                    </span>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {new Date(certificateData.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-start space-x-3 p-4 rounded-sm bg-slate-50 dark:bg-slate-800/40 border border-stroke dark:border-strokedark">
                  <UserCheck className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Instructor
                    </span>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {certificateData.instructor}
                    </p>
                  </div>
                </div>

              </div>

              {/* Status and Verification Code Row */}
              <div className="p-4 rounded-sm bg-slate-100 dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 border border-stroke dark:border-strokedark">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Certificate Status
                  </span>
                  <span className="inline-flex items-center mt-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {certificateData.certificateStatus}
                  </span>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Verification Code
                  </span>
                  <span className="font-mono text-sm font-bold text-primary dark:text-white tracking-widest mt-1 block">
                    {certificateData.verificationCode}
                  </span>
                </div>
              </div>

              {/* PDF Download Button if URL is available */}
              {certificateData.certificateUrl && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={certificateData.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 rounded-sm bg-primary text-white font-medium hover:bg-opacity-90 transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View / Download Official PDF
                    <ExternalLink className="w-4 h-4 ml-2 opacity-75" />
                  </a>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Certificate Invalid Card (Error State) */}
        {!loading && errorState && (
          <div className="rounded-sm border-2 border-rose-500 bg-white dark:bg-boxdark p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex items-start space-x-4">
              <XCircle className="w-12 h-12 text-rose-500 flex-shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                  Certificate Invalid
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-base">
                  {errorState}
                </p>
                {searchedCode && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 font-mono">
                    Queried Code: <span className="font-bold">{searchedCode}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-sm bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-sm text-rose-800 dark:text-rose-300">
              <p className="font-medium">Why might a code be invalid?</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                <li>The verification code contains a typo or formatting error.</li>
                <li>The certificate was not issued by Ezitech LMS.</li>
                <li>The code has been revoked or expired.</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 rounded-sm border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
              >
                Try Another Code
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CertificateVerification;
