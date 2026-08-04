import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import { Link } from 'react-router-dom';
import { PUBLIC } from '../../../constants/routes';

export const PublicAboutPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="About Us | Enterprise LMS"
        description="Learn about Enterprise LMS's mission to empower software engineers and incubators with production-ready technical education."
      />

      <div className="py-16 lg:py-24 bg-white dark:bg-gray-900 space-y-20">
        {/* Hero Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3.5 py-1.5 rounded-full">
            Our Mission & Vision
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Bridging the Gap Between Learning and Production Engineering
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Enterprise LMS was founded to replace outdated video-only tutorials with an interactive, assessment-driven, and verifiable learning environment designed for modern software development.
          </p>
        </div>

        {/* Stats Highlight Bar */}
        <div className="bg-brand-600 dark:bg-brand-900/60 py-12 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-4xl lg:text-5xl font-black">10,000+</span>
              <p className="text-xs sm:text-sm text-brand-100 mt-1">Active Engineers Trained</p>
            </div>
            <div>
              <span className="text-4xl lg:text-5xl font-black">250+</span>
              <p className="text-xs sm:text-sm text-brand-100 mt-1">Production Courses</p>
            </div>
            <div>
              <span className="text-4xl lg:text-5xl font-black">98.4%</span>
              <p className="text-xs sm:text-sm text-brand-100 mt-1">Verification Accuracy</p>
            </div>
            <div>
              <span className="text-4xl lg:text-5xl font-black">50+</span>
              <p className="text-xs sm:text-sm text-brand-100 mt-1">Tech Incubators & Partners</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Our Core Principles
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Guiding how we design curricula, construct assessments, and partner with tech leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500 text-white font-extrabold text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Production First</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Every code example, project task, and quiz reflects patterns used in production enterprise codebases.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white font-extrabold text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verifiable Mastery</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Credentials issued by Enterprise LMS are backed by cryptographic verification codes for employer trust.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white font-extrabold text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Continuous Evolution</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Our course catalog updates constantly to match emerging stack shifts in React 19, Node, AI Ops, and DevOps.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Join the Enterprise Learning Community Today
          </h3>
          <div className="flex justify-center gap-4">
            <Link
              to={PUBLIC.REGISTER}
              className="px-6 py-3 text-sm font-bold text-white bg-brand-500 rounded-xl shadow-xs"
            >
              Get Started
            </Link>
            <Link
              to={PUBLIC.CONTACT}
              className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicAboutPage;
