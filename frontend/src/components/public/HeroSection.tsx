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
  Lock,
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
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 lg:py-20">
      {/* 1. Ambient Background Layer: SVG Dot Grid + Mesh PNG (Top-Right Depth) */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      
      <div className="absolute -top-16 -right-20 w-[600px] sm:w-[750px] h-[600px] pointer-events-none z-0 opacity-20 blur-[50px] select-none">
        <img
          src="/images/hero_ambient_mesh.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* 3. Asymmetric 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Eyebrow, Headline, Paragraph, Search, CTAs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Eyebrow Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              Trusted by 10,000+ Engineers & Enterprise Teams
            </motion.div>

            {/* Main Headline (Tightened line-height & confident type scale) */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]"
            >
              Learn Industry Skills.{' '}
              <span className="block mt-1.5 text-white">
                Build Your{' '}
                <span className="bg-gradient-to-r from-brand-300 to-indigo-300 bg-clip-text text-transparent">
                  Career.
                </span>
              </span>
            </motion.h1>

            {/* Paragraph Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Master full-stack engineering, cloud architecture, and AI with production-grade curricula, interactive assessments, and cryptographically verified enterprise credentials.
            </motion.p>

            {/* Restyled Real Product Hero Search Bar */}
            <motion.div variants={itemVariants} className="max-w-xl mx-auto lg:mx-0">
              <form
                onSubmit={handleSearchSubmit}
                className="ds-public-search-container relative flex items-center p-1.5 rounded-lg bg-[#10141F]"
              >
                <div className="pl-3 pr-2 text-gray-400">
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
                  className="ds-public-btn-primary px-5 py-2.5 text-white font-semibold text-xs sm:text-sm rounded-md transition-all whitespace-nowrap active:scale-95 flex items-center gap-2"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>

            {/* CTA Action Buttons */}
            <motion.div variants={itemVariants} className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to={PUBLIC.COURSES}
                  className="ds-public-btn-primary group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to={PUBLIC.REGISTER}
                  className="ds-public-btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-gray-200 hover:text-white rounded-lg transition-all"
                >
                  Start Learning Free
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* 2. Right Column: Realistic Embedded Product Window Treatment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="lg:col-span-5 relative mt-6 lg:mt-0"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none lg:[transform:perspective(1200px)_rotateY(-3deg)_rotateX(2deg)] lg:hover:[transform:perspective(1200px)_rotateY(-1deg)_rotateX(1deg)] transition-transform duration-500">
              
              {/* Product Window Frame (Stripe / Linear Browser Treatment) */}
              <div className="rounded-xl border border-white/15 bg-[#0D111C] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
                
                {/* Browser App Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-950/60 border border-white/[0.06] text-[11px] text-gray-400 font-mono">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>skillforge.academy/incubator</span>
                  </div>

                  <div className="w-10" />
                </div>

                {/* Embedded Dashboard View */}
                <div className="p-5 sm:p-6 space-y-4 bg-[#10141F]">
                  
                  {/* Header inside central card */}
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        SF
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">
                          SkillForge Incubator
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium">Production Tech Track</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live Cohort
                    </span>
                  </div>

                  {/* 4 Statistics Cards inside Central Card */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="ds-public-subcard p-3 rounded-lg flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-800 text-brand-400 rounded-md">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-white block leading-none">10K+</span>
                        <span className="text-[11px] font-medium text-gray-400">Students</span>
                      </div>
                    </div>

                    <div className="ds-public-subcard p-3 rounded-lg flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-800 text-blue-400 rounded-md">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-white block leading-none">250+</span>
                        <span className="text-[11px] font-medium text-gray-400">Courses</span>
                      </div>
                    </div>

                    <div className="ds-public-subcard p-3 rounded-lg flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-800 text-purple-400 rounded-md">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-white block leading-none">50+</span>
                        <span className="text-[11px] font-medium text-gray-400">Instructors</span>
                      </div>
                    </div>

                    <div className="ds-public-subcard p-3 rounded-lg flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-800 text-emerald-400 rounded-md">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-white block leading-none">95%</span>
                        <span className="text-[11px] font-medium text-gray-400">Completion</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Module Progress Bar Widget */}
                  <div className="ds-public-subcard p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-200 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                        React 19 Architecture Track
                      </span>
                      <span className="text-brand-400 font-semibold">88%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                        className="bg-brand-500 h-1.5 rounded-full"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>

        {/* 4. Horizontal Trust / Capability Strip Below Hero Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-14 pt-8 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Self-Paced & Cohort Modules</h4>
              <p className="text-[11px] text-gray-400">Flexible learning schedules</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-md bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Verifiable Credentials</h4>
              <p className="text-[11px] text-gray-400">Cryptographically signed certificates</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Industry Mentorship</h4>
              <p className="text-[11px] text-gray-400">Direct feedback from senior engineers</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
