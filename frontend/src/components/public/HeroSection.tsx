import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  ArrowRight,
  Search,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 lg:py-0">
      {/* Background Ambient Radial Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-brand-500/15 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/5 w-[450px] h-[450px] bg-indigo-500/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[550px] h-[500px] bg-purple-500/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Hero Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
          >
            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]"
            >
              Learn Industry Skills.{' '}
              <span className="block mt-2 bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Build Your Career.
              </span>
            </motion.h1>

            {/* Paragraph Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Master full-stack engineering, cloud architecture, and AI with production-grade curricula, interactive assessments, and cryptographically verified enterprise credentials.
            </motion.p>

            {/* Large Hero Search Bar */}
            <motion.div variants={itemVariants} className="max-w-2xl mx-auto lg:mx-0">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/15 focus-within:border-brand-500/80 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all"
              >
                <div className="pl-4 pr-2 text-gray-400">
                  <Search className="w-5 h-5 text-brand-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, learning paths, or skills..."
                  className="w-full bg-transparent py-2.5 px-2 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>

            {/* CTA Action Buttons */}
            <motion.div variants={itemVariants} className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                <Link
                  to={PUBLIC.COURSES}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-extrabold text-white rounded-2xl overflow-hidden transition-all shadow-[0_0_30px_rgba(70,95,255,0.4)] hover:shadow-[0_0_45px_rgba(70,95,255,0.75)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 group-hover:scale-105 transition-transform" />
                  <span className="relative z-10">Explore Courses</span>
                  <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  to={PUBLIC.REGISTER}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-gray-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 rounded-2xl backdrop-blur-xl transition-all hover:border-white/30"
                >
                  Start Learning Free
                </Link>
              </motion.div>
            </motion.div>

            {/* Live Trust Badges */}
            <motion.div variants={itemVariants} className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Self-Paced & Cohort Modules
              </span>
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" /> Verifiable Credentials
              </span>
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" /> Industry Mentorship
              </span>
            </motion.div>
          </motion.div>

          {/* Right Hero Graphic: Clean, Spacious Central Card (Clutter-Free) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="lg:col-span-5 relative mt-6 lg:mt-0"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">

              {/* Central Main Glass Card */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/15 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] space-y-6">
                
                {/* Header inside central card */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(70,95,255,0.5)]">
                      SF
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        SkillForge Incubator
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">Production Tech Track</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-2xs font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live Cohort
                  </span>
                </div>

                {/* 4 Statistics Cards inside Central Card */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-500/30 transition-colors flex items-center gap-3">
                    <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-white block leading-none">10K+</span>
                      <span className="text-[10px] font-semibold text-gray-400">Students</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-colors flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-white block leading-none">250+</span>
                      <span className="text-[10px] font-semibold text-gray-400">Courses</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-white block leading-none">50+</span>
                      <span className="text-[10px] font-semibold text-gray-400">Instructors</span>
                    </div>
                  </div>

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
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '88%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                      className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 h-2 rounded-full"
                    />
                  </div>
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
