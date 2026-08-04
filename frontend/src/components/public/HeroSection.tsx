import React from 'react';
import { Link } from 'react-router-dom';
import { PUBLIC } from '../../constants/routes';
import { TaskIcon, PieChartIcon, ShootingStarIcon, GroupIcon, ArrowRightIcon } from '../../icons';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-16 lg:py-24">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Enterprise Learning System 2.0
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]">
              Learn Industry Skills.{' '}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 bg-clip-text text-transparent">
                Build Your Career.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Master full-stack engineering, cloud architecture, and AI with production-grade curricula, interactive quizzes, and verified enterprise credentials.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to={PUBLIC.COURSES}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Courses
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to={PUBLIC.REGISTER}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-all"
              >
                Start Learning Free
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Self-Paced & Cohort Modules
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Verifiable Certificates
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Instructor Mentorship
              </span>
            </div>
          </div>

          {/* Right Side Illustration Card & Statistics Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Card Graphic */}
              <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                      LMS
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        Tech Incubator Hub
                      </h3>
                      <p className="text-xs text-gray-500">Live Student Portal</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full">
                    Active Cohort
                  </span>
                </div>

                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Stat 1 */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-brand-500 mb-1">
                      <GroupIcon className="w-5 h-5" />
                      <span className="text-2xl font-black text-gray-900 dark:text-white">10K+</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Students Enrolled</p>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                      <TaskIcon className="w-5 h-5" />
                      <span className="text-2xl font-black text-gray-900 dark:text-white">250+</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Courses & Labs</p>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-purple-500 mb-1">
                      <ShootingStarIcon className="w-5 h-5" />
                      <span className="text-2xl font-black text-gray-900 dark:text-white">50+</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Instructors</p>
                  </div>

                  {/* Stat 4 */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                      <PieChartIcon className="w-5 h-5" />
                      <span className="text-2xl font-black text-gray-900 dark:text-white">95%</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
                  </div>
                </div>

                {/* Progress bar preview */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    <span>Full Stack React + Node Track</span>
                    <span className="text-brand-500">88% Completed</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-500 to-indigo-500 h-2 rounded-full w-[88%]" />
                  </div>
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
