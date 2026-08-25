import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PUBLIC } from '../constants/routes';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  type: 'signin' | 'signup';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, type }) => {
  const isSignIn = type === 'signin';

  return (
    <div className="min-h-screen bg-[#0B0E17] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Vector Architectural Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.12]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} 
      />
      <div className="absolute top-1/4 left-1/6 w-[450px] h-[450px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* ── Left Column: Minimal Brand & Spaced Editorial Atmosphere ──────────────── */}
        <div className="lg:col-span-6 xl:col-span-7 p-8 sm:p-12 lg:p-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#090C15]/50 backdrop-blur-2xl">
          
          {/* Top Brand Header */}
          <div className="flex items-center justify-between">
            <Link to={PUBLIC.HOME} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/15 text-emerald-400 flex items-center justify-center font-black text-lg shadow-sm group-hover:border-emerald-500/40 transition-colors">
                SF
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  SkillForge <span className="text-emerald-400">LMS</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Enterprise EdTech</span>
              </div>
            </Link>
          </div>

          {/* Spaced Editorial Headline */}
          <div className="my-auto py-16 space-y-5 max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              {isSignIn ? (
                <>Master Production-Grade Engineering.</>
              ) : (
                <>Join the Next Generation of Software Architects.</>
              )}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
              {isSignIn ? (
                <>Access your course syllabus, interactive sandboxes, and verified digital certificates.</>
              ) : (
                <>Start learning with hands-on microservice projects and cryptographically verified credentials.</>
              )}
            </p>
          </div>

          {/* Minimal Bottom Branding Tag */}
          <div className="pt-6 border-t border-white/[0.08] text-xs font-mono text-gray-500">
            SkillForge Enterprise Learning System © 2026
          </div>

        </div>

        {/* ── Right Column: Clean Authentication Form Panel ──────────────────────────── */}
        <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-10 lg:p-14 flex flex-col justify-between bg-[#0B0E17]">
          
          {/* Top Back Navigation Link */}
          <div className="flex justify-between items-center mb-8">
            <Link
              to={PUBLIC.HOME}
              className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <span>Back to Home</span>
            </Link>

            <span className="text-xs font-mono text-gray-400">
              {isSignIn ? (
                <>New here? <Link to={PUBLIC.REGISTER} className="text-emerald-400 font-bold hover:underline">Create Account</Link></>
              ) : (
                <>Have an account? <Link to={PUBLIC.LOGIN} className="text-emerald-400 font-bold hover:underline">Sign In</Link></>
              )}
            </span>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto my-auto space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed">{subtitle}</p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl shadow-xl">
              {children}
            </div>
          </div>

          {/* Bottom Legal / Help Footer */}
          <div className="pt-8 text-center text-[11px] text-gray-500 font-mono">
            Protected by SkillForge LMS Authority • <Link to={PUBLIC.TERMS} className="underline hover:text-gray-400">Terms</Link> &amp; <Link to={PUBLIC.PRIVACY} className="underline hover:text-gray-400">Privacy</Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
