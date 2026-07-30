import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  BookOpen,
  ShieldCheck,
  BarChart3,
  Users,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-16 lg:py-0">
      {/* Decorative Ambient Glowing Light Shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-brand-500/15 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/5 w-[450px] h-[450px] bg-indigo-500/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[550px] h-[500px] bg-purple-500/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
              </span>
              <span className="text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 bg-gradient-to-r from-brand-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Enterprise Incubator & Academy 3.0
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
              Learn Industry Skills.{' '}
              <span className="block mt-2 bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Build Your Career.
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Master full-stack engineering, cloud architecture, and AI with production-grade curricula, interactive assessments, and cryptographically verified enterprise credentials.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <Link
                to={PUBLIC.COURSES}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-extrabold text-white rounded-2xl overflow-hidden transition-all shadow-[0_0_30px_rgba(70,95,255,0.4)] hover:shadow-[0_0_45px_rgba(70,95,255,0.75)] transform hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 group-hover:scale-105 transition-transform" />
                <span className="relative z-10">Explore Courses</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to={PUBLIC.REGISTER}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-gray-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 rounded-2xl backdrop-blur-xl transition-all hover:border-white/30"
              >
                Start Learning Free
              </Link>
            </div>

            {/* Live Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Self-Paced & Cohort Modules
              </span>
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" /> Verifiable Credentials
              </span>
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" /> Industry Mentorship
              </span>
            </div>
          </div>

          {/* Right Hero Graphic: Immersive Floating Glass Cards Stack */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">

              {/* Central Main Glass Card */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
                
                {/* Header inside central card */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(70,95,255,0.5)]">
                      LMS
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        Tech Incubator Portal
                      </h3>
                      <p className="text-xs text-gray-400">Sheryians & Coursera Track</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-2xs font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full uppercase tracking-wider">
                    ● Live Cohort
                  </span>
                </div>

                {/* 4 Statistics Cards inside Central Card */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Stat 1 */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-500/30 transition-colors flex items-center gap-3">
                    <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-white block leading-none">10K+</span>
                      <span className="text-[10px] font-semibold text-gray-400">Students</span>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-colors flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-white block leading-none">250+</span>
                      <span className="text-[10px] font-semibold text-gray-400">Courses</span>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-white block leading-none">50+</span>
                      <span className="text-[10px] font-semibold text-gray-400">Instructors</span>
                    </div>
                  </div>

                  {/* Stat 4 */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-colors flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-white block leading-none">95%</span>
                      <span className="text-[10px] font-semibold text-gray-400">Completion</span>
                    </div>
                  </div>
                </div>

                {/* Active Module Progress Bar Widget */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                      React 19 Architecture Track
                    </span>
                    <span className="text-brand-400 font-bold">88%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 h-2 rounded-full w-[88%]" />
                  </div>
                </div>
              </div>

              {/* Floating Widget 1: Live Analytics Card (Top Right Floating) */}
              <div className="hidden sm:block absolute -top-8 -right-8 p-4 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-2xl animate-float-slow w-56 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-brand-400" /> Weekly Activity
                  </span>
                  <span className="text-2xs text-emerald-400 font-bold">+28%</span>
                </div>
                <div className="flex items-end gap-1.5 h-10 pt-2">
                  <div className="flex-1 bg-brand-500/30 h-[40%] rounded-t" />
                  <div className="flex-1 bg-brand-500/50 h-[65%] rounded-t" />
                  <div className="flex-1 bg-brand-500/80 h-[50%] rounded-t" />
                  <div className="flex-1 bg-brand-400 h-[85%] rounded-t" />
                  <div className="flex-1 bg-brand-500 h-[100%] rounded-t shadow-[0_0_10px_rgba(70,95,255,0.6)]" />
                </div>
              </div>

              {/* Floating Widget 2: Certificate Preview (Bottom Left Floating) */}
              <div className="hidden sm:flex absolute -bottom-8 -left-8 p-4 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-2xl animate-float-delay items-center gap-3 w-64">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    Verified Credential <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[10px] text-gray-400 font-mono">ID: LMS-CERT-8842</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
