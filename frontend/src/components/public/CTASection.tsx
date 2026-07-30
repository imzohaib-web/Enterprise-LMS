import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const CTASection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 p-10 sm:p-14 lg:p-20 text-white shadow-[0_0_50px_rgba(70,95,255,0.3)] border border-white/20"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black uppercase tracking-widest bg-white/15 backdrop-blur-md rounded-full border border-white/25">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Accelerate Your Engineering Career
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Ready to Master Production Software Development?
        </h2>
        <p className="text-base sm:text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
          Join thousands of software engineers, cloud architects, and tech incubators enrolled in Enterprise LMS today.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-5">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Link
              to={PUBLIC.REGISTER}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 text-base font-extrabold text-brand-950 bg-white hover:bg-brand-50 rounded-2xl shadow-xl transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              to={PUBLIC.COURSES}
              className="w-full sm:w-auto px-9 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl transition-all backdrop-blur-md block text-center"
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
