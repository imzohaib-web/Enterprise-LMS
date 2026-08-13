import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  ArrowRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Code,
  Layers,
  Check,
  Sparkles,
} from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${PUBLIC.COURSES}?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(PUBLIC.COURSES);
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    navigate(`${PUBLIC.COURSES}?search=${encodeURIComponent(tag)}`);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const popularSkills = ['React 19', 'Cloud DevOps', 'AI Engineering', 'Cybersecurity', 'Microservices'];

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden py-8 lg:py-12">
      
      {/* Tasteful Abstract Architectural Vector Matrix Layer (Background) */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-15">
        <svg className="w-full h-full max-w-7xl" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="600" cy="400" r="300" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="600" cy="400" r="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="100" y1="400" x2="1100" y2="400" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="600" y1="100" x2="600" y2="700" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx="600" cy="200" r="4" fill="#10B981" />
          <circle cx="800" cy="400" r="4" fill="#6366F1" />
          <circle cx="400" cy="400" r="4" fill="#3B82F6" />
          <circle cx="600" cy="600" r="4" fill="#8B5CF6" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-10">
        
        {/* Prominent Dedicated Course Search Bar (Centered Directly Below Header) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl sm:max-w-3xl mx-auto text-center space-y-3 pt-2"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/20 focus-within:border-brand-500/70 backdrop-blur-2xl shadow-[0_12px_35px_rgba(0,0,0,0.6)] transition-all"
          >
            <div className="pl-3.5 pr-2 text-gray-400">
              <Search className="w-5 h-5 text-gray-300" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, skills, learning paths..."
              className="w-full bg-transparent py-2.5 px-2 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap active:scale-95 flex items-center gap-2 border border-white/15 shadow-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </button>
          </form>

          {/* Centered Suggested Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Suggested:
            </span>
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleQuickTagClick(skill)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-[11px] font-mono"
              >
                {skill}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Restructured Two-Column Hero Grid Below Search Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline + Copy + CTAs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Minimal Category Tag */}
            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-gray-400 bg-white/[0.03] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ENTERPRISE LEARNING SYSTEM</span>
              </span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.12]"
            >
              The LMS Platform for{' '}
              <span className="text-gray-300 underline decoration-white/20 underline-offset-8">
                Enterprise Tech Teams.
              </span>
            </motion.h1>

            {/* Value Proposition Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Master software development, cloud architecture, and AI engineering through production-grade curricula, interactive code sandboxes, and cryptographic certification.
            </motion.p>

            {/* Restrained CTAs */}
            <motion.div variants={itemVariants} className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to={PUBLIC.COURSES}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-lg transition-all group"
              >
                <span>Explore Course Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to={PUBLIC.VERIFY}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium text-gray-300 hover:text-white bg-transparent border border-white/10 hover:border-white/25 rounded-lg transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify Credential</span>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={itemVariants} className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verifiable Credentials
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Interactive Labs
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Proprietary SkillForge Learning Studio Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-6 relative mt-4 lg:mt-0"
          >
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              
              {/* Main Studio Window Frame */}
              <div className="rounded-xl bg-[#090C15] border border-white/15 shadow-2xl overflow-hidden backdrop-blur-2xl">
                
                {/* Titlebar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
                    <Layers className="w-3 h-3 text-brand-400" />
                    <span>skillforge.io/workbench/react-19</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    STATUS: ACTIVE
                  </span>
                </div>

                {/* Studio Split Layout */}
                <div className="grid grid-cols-12 min-h-[320px]">
                  
                  {/* Left Sidebar - Curriculum Steps */}
                  <div className="col-span-4 border-r border-white/10 p-3 bg-white/[0.01] space-y-3 font-mono text-xs">
                    <div className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">
                      Module Syllabus
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-between">
                        <span className="truncate">01. Architecture</span>
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      </div>
                      <div className="p-2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-between">
                        <span className="truncate">02. State Graphs</span>
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      </div>
                      <div className="p-2 rounded bg-white/[0.06] text-white border border-white/20 flex items-center justify-between font-semibold">
                        <span className="truncate">03. Micro-frontends</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                      </div>
                      <div className="p-2 rounded text-gray-500 flex items-center justify-between">
                        <span className="truncate">04. Lab Execution</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Code Editor & Terminal Output */}
                  <div className="col-span-8 p-4 flex flex-col justify-between space-y-3 font-mono text-xs bg-[#06080F]">
                    
                    {/* Code Snippet Editor */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-white/10 pb-1.5">
                        <span className="flex items-center gap-1 text-gray-300">
                          <Code className="w-3 h-3 text-brand-400" /> LabExercise.ts
                        </span>
                        <span className="text-gray-500">TypeScript 5.4</span>
                      </div>
                      <pre className="text-[11px] leading-relaxed text-gray-300 overflow-x-auto p-2 rounded bg-white/[0.02] border border-white/5">
                        <code>
                          <span className="text-purple-400">import</span> {`{ verifyLab }`} <span className="text-purple-400">from</span> <span className="text-amber-300">"@skillforge/sdk"</span>;{`\n\n`}
                          <span className="text-blue-400">export async function</span> <span className="text-emerald-400">runTest</span>() {`{\n`}
                          {'  '}<span className="text-purple-400">const</span> res = <span className="text-blue-400">await</span> <span className="text-emerald-400">verifyLab</span>({`{\n`}
                          {'    '}track: <span className="text-amber-300">"React-19"</span>,{`\n`}
                          {'    '}score: <span className="text-emerald-400">100</span>{`\n`}
                          {'  '}{`}`});{`\n`}
                          {`}`}
                        </code>
                      </pre>
                    </div>

                    {/* Console Output Bar */}
                    <div className="p-2.5 rounded bg-white/[0.03] border border-white/10 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-gray-400 text-[10px]">
                        <span className="flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-emerald-400" /> Test Runner Output
                        </span>
                        <span className="text-emerald-400 font-bold">Passed (38ms)</span>
                      </div>
                      <div className="text-emerald-300 text-[10px]">
                        ✓ 12/12 Automated Suite Assertions Passed
                      </div>
                    </div>

                  </div>

                </div>

                {/* Integrated Cryptographic Credential Footer Bar */}
                <div className="px-4 py-2 bg-white/[0.03] border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographic Verification Code:</span>
                  </div>
                  <span className="text-[11px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
                    SF-2026-8921-VERIFIED
                  </span>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
