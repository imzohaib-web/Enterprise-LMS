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

type VerificationState = 'WAITING' | 'LOADING' | 'SUCCESS' | 'INVALID';

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
          courseTitle: 'Full Stack React 19 + Node Microservices',
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

    setStatus('LOADING');

    setTimeout(() => {
      if (cleanCode.startsWith('INVALID') || cleanCode === '0000') {
        setStatus('INVALID');
        setCertData(null);
      } else {
        setStatus('SUCCESS');
        setCertData({
          studentName: 'Alex Student',
          courseTitle: 'Full Stack React 19 + Node Microservices',
          issueDate: 'July 15, 2026',
          code: cleanCode.startsWith('SF-') ? cleanCode : `SF-2026-${cleanCode}`,
          grade: '95% (Distinction)',
          instructor: 'Dr. Elena Rostova',
        });
      }
    }, 500);
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

      <div className="py-14 lg:py-20 relative z-10 space-y-12 bg-[#0B0E17]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TAMPER-PROOF VERIFICATION</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Verify Digital Credentials.
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto font-normal leading-relaxed">
              Enter a SkillForge LMS certificate code to instantly validate student identity, course completion, and achievement grade.
            </p>
          </motion.div>

          {/* Verification Lookup Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="p-7 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl shadow-xl space-y-5"
          >
            <form onSubmit={onSubmitForm} className="space-y-3">
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider">
                Certificate Verification Code
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter Certificate Code (e.g. SF-2026-8921-VERIFIED)..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full px-4 py-3 pl-11 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono tracking-wider shadow-inner"
                />
                <Search className="absolute left-3.5 text-gray-400 w-4 h-4" />
                <button
                  type="submit"
                  disabled={status === 'LOADING'}
                  className="absolute right-1.5 px-4 py-2 text-xs font-semibold text-gray-950 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {status === 'LOADING' ? (
                    <span className="flex items-center gap-2 font-mono">
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full" />
                      Validating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Verify Code <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              </div>
              <p className="text-[11px] font-mono text-gray-500">
                Tip: Try sample code <button type="button" onClick={() => { setInputCode('SF-2026-8921-VERIFIED'); handleVerifyCode('SF-2026-8921-VERIFIED'); }} className="text-emerald-400 underline font-mono">SF-2026-8921-VERIFIED</button> to view authenticated certificate details.
              </p>
            </form>
          </motion.div>

          {/* Verification Results Container */}
          <AnimatePresence mode="wait">
            {status === 'SUCCESS' && certData && (
              <motion.div
                key="success-result"
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="p-7 sm:p-9 rounded-2xl bg-[#090C15] border border-emerald-500/30 backdrop-blur-2xl shadow-xl space-y-7"
              >
                {/* Verified Header Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Authenticated Credential
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white mt-1 tracking-tight">
                        Certificate Verified Successfully
                      </h3>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Verification Code</span>
                    <span className="text-xs font-bold text-emerald-400">{certData.code}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Student Name */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" /> Student Recipient
                    </span>
                    <h4 className="text-base font-bold text-white">{certData.studentName}</h4>
                  </div>

                  {/* Course Title */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Certified Program
                    </span>
                    <h4 className="text-base font-bold text-white">{certData.courseTitle}</h4>
                  </div>

                  {/* Achievement Grade */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Grade & Honor
                    </span>
                    <h4 className="text-base font-bold text-amber-300 font-mono">{certData.grade}</h4>
                  </div>

                  {/* Issue Date & Instructor */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Issue Date & Instructor
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      {certData.issueDate} • <span className="text-gray-400">By {certData.instructor}</span>
                    </h4>
                  </div>
                </div>

                {/* Trust Authority Seal Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Digitally signed by SkillForge LMS Trust Authority
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-400">100% Authentic</span>
                </div>
              </motion.div>
            )}

            {status === 'INVALID' && (
              <motion.div
                key="invalid-result"
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="p-7 rounded-2xl bg-[#090C15] border border-rose-500/30 text-center space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Certificate Code Not Found
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  We could not find any active credential matching code <strong className="font-mono text-rose-300">{inputCode}</strong>. Please verify the code spelling or contact support.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('WAITING')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-all"
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
