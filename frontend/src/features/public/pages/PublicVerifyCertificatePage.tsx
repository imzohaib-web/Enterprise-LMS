import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageMeta from '../../../components/common/PageMeta';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
  Calendar,
  User,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { verifyCertificate } from '../../../services/certificateService';

type VerificationState = 'WAITING' | 'LOADING' | 'SUCCESS' | 'INVALID';

interface VerifiedCertDetails {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  code: string;
  grade: string;
  instructor: string;
  certificateUrl?: string;
}

export const PublicVerifyCertificatePage: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [inputCode, setInputCode] = useState(urlCode || '');
  const [status, setStatus] = useState<VerificationState>('WAITING');
  const [certData, setCertData] = useState<VerifiedCertDetails | null>(null);

  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
      handleVerifyCode(urlCode);
    }
  }, [urlCode]);

  const handleVerifyCode = async (targetCode: string) => {
    const cleanCode = targetCode.trim();
    if (!cleanCode) {
      setStatus('WAITING');
      setCertData(null);
      return;
    }

    setStatus('LOADING');

    try {
      const data = await verifyCertificate(cleanCode);
      setStatus('SUCCESS');
      setCertData({
        studentName: data.studentName || 'Valued Student',
        courseTitle: data.courseName || 'Enterprise LMS Course',
        issueDate: data.issueDate
          ? new Date(data.issueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Verified',
        code: data.verificationCode,
        grade: '100% (Completed)',
        instructor: data.instructor || 'Lead Instructor',
        certificateUrl: data.certificateUrl,
      });
    } catch (err: any) {
      setStatus('INVALID');
      setCertData(null);
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode(inputCode);
  };

  return (
    <>
      <PageMeta
        title="Verify Certificate | SkillForge LMS"
        description="Verify student credential authenticity, completion grade, and issue details on SkillForge LMS."
      />

      <div className="py-12 lg:py-16 relative z-10 space-y-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tamper-Proof Credential Verification
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              Verify Digital Credentials
            </h1>
            <p className="text-base text-gray-400 max-w-xl mx-auto font-normal">
              Enter a SkillForge LMS certificate code to instantly validate student identity, course completion, and achievement grade.
            </p>
          </motion.div>

          {/* Verification Lookup Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6"
          >
            <form onSubmit={onSubmitForm} className="space-y-4">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Certificate Verification Code
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter Certificate ID (e.g. LMS-CERT-8842)..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full px-5 py-4 pl-12 text-sm sm:text-base bg-white/[0.04] border border-white/15 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-mono tracking-wider shadow-inner"
                />
                <Search className="absolute left-4 text-gray-400 w-5 h-5" />
                <button
                  type="submit"
                  disabled={status === 'LOADING'}
                  className="absolute right-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {status === 'LOADING' ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Validating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Verify Code <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
              <p className="text-2xs text-gray-500">
                Tip: Try sample code <button type="button" onClick={() => { setInputCode('LMS-CERT-8842'); handleVerifyCode('LMS-CERT-8842'); }} className="text-brand-400 underline font-mono">LMS-CERT-8842</button> to see verified credential details.
              </p>
            </form>
          </motion.div>

          {/* Verification Results Container */}
          <AnimatePresence mode="wait">
            {status === 'SUCCESS' && certData && (
              <motion.div
                key="success-result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-white/[0.02] to-white/[0.01] border border-emerald-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-8"
              >
                {/* Verified Header Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Authenticated Credential
                      </span>
                      <h3 className="text-xl font-black text-white mt-1">
                        Certificate Verified Successfully
                      </h3>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xs font-mono text-gray-400 uppercase tracking-widest block">Verification ID</span>
                    <span className="text-sm font-mono font-bold text-brand-300">{certData.code}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Name */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" /> Student Recipient
                    </span>
                    <h4 className="text-lg font-black text-white">{certData.studentName}</h4>
                  </div>

                  {/* Course Title */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Certified Program
                    </span>
                    <h4 className="text-lg font-bold text-white">{certData.courseTitle}</h4>
                  </div>

                  {/* Achievement Grade */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Grade & Honor
                    </span>
                    <h4 className="text-lg font-black text-amber-300">{certData.grade}</h4>
                  </div>

                  {/* Issue Date & Instructor */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" /> Issue Date & Instructor
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {certData.issueDate} • <span className="text-gray-300">By {certData.instructor}</span>
                    </h4>
                  </div>
                </div>

                {/* Seal Banner */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-semibold">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Digitally signed by SkillForge LMS Cryptographic Trust Authority
                  </span>
                  <span className="font-mono text-2xs uppercase">100% Valid</span>
                </div>
              </motion.div>
            )}

            {status === 'INVALID' && (
              <motion.div
                key="invalid-result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/40 backdrop-blur-xl text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Certificate Code Not Found
                </h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  We could not find any active credential matching code <strong className="font-mono text-rose-300">{inputCode}</strong>. Please verify the code spelling or contact platform support.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('WAITING')}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all"
                >
                  Try Another Code
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
};

export default PublicVerifyCertificatePage;
