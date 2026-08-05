import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const CTASection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-[#10141F] p-10 sm:p-14 lg:p-16 text-white border border-white/[0.08] shadow-xl"
    >
      {/* Subtle Grid Overlay for depth */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300 bg-brand-500/10 rounded-md border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Accelerate Your Engineering Career
        </span>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
          Ready to Master Production Software Development?
        </h2>
        
        <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed font-normal">
          Join thousands of software engineers, cloud architects, and tech incubators enrolled in Enterprise LMS today.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              to={PUBLIC.REGISTER}
              className="ds-public-btn-primary group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-lg transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              to={PUBLIC.COURSES}
              className="ds-public-btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-gray-300 hover:text-white rounded-lg transition-all"
            >
              Browse All Courses
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default CTASection;
