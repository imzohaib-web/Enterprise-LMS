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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl bg-[#090C15] border border-white/15 p-10 sm:p-14 lg:p-16 text-white shadow-2xl backdrop-blur-2xl"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>CAREER TRANSFORMATION</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          Ready to Master Production Software Development?
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Join thousands of software engineers, cloud architects, and tech incubators enrolled in SkillForge LMS today.
        </p>
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={PUBLIC.REGISTER}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-gray-950 bg-white hover:bg-gray-100 rounded-xl shadow-lg transition-all"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to={PUBLIC.COURSES}
            className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-white/[0.06] hover:bg-white/10 border border-white/15 rounded-xl transition-all block text-center"
          >
            Browse All Courses
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default CTASection;
