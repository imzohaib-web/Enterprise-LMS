import React from 'react';
import { Link } from 'react-router-dom';
import { PUBLIC } from '../../constants/routes';

export const CTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 p-8 sm:p-12 lg:p-16 text-white shadow-xl">
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full">
          Accelerate Your Tech Career
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Ready to Master In-Demand Engineering Skills?
        </h2>
        <p className="text-base sm:text-lg text-brand-50/90 max-w-2xl mx-auto leading-relaxed">
          Join thousands of software engineers, cloud architects, and tech innovators enrolled in Enterprise LMS today.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={PUBLIC.REGISTER}
            className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-brand-700 bg-white hover:bg-brand-50 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Create Free Account
          </Link>
          <Link
            to={PUBLIC.COURSES}
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl transition-all backdrop-blur-xs"
          >
            Browse All Courses
          </Link>
        </div>
      </div>

      {/* Decorative background blur shapes */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default CTASection;
