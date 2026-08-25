import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  color?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  badge,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-[310px] sm:w-[370px] lg:w-[410px] flex-shrink-0 p-7 rounded-2xl bg-[#090C15] hover:bg-[#0C101D] border border-white/10 hover:border-white/25 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-5 h-full select-none transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.04] border border-white/15 text-white shadow-sm group-hover:border-brand-500/40 transition-colors">
            {icon}
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-gray-300 bg-white/[0.04] border border-white/10 rounded-md">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      <div className="pt-2 flex items-center text-xs font-medium text-gray-400 group-hover:text-white transition-colors gap-1.5">
        <span>Explore Feature</span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
};

export default FeatureCard;
