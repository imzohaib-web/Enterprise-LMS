import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Layers, Compass, Code, ArrowRight } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export interface LearningPathData {
  id: string;
  title: string;
  difficulty: string;
  coursesCount: number;
  duration: string;
  description: string;
  skills: string[];
  color?: string;
  thumbnailUrl?: string;
  progress?: number;
}

interface LearningPathCardProps {
  path: LearningPathData;
  index?: number;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path, index = 0 }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
      whileHover={{ y: -5 }}
      className="group flex flex-col h-full overflow-hidden rounded-2xl bg-[#090C15] hover:bg-[#0C101D] border border-white/10 hover:border-white/25 backdrop-blur-2xl shadow-xl transition-all duration-300 justify-between"
    >
      {/* Compact Widescreen Visual Header */}
      <div className="relative h-32 w-full bg-[#06080F] overflow-hidden">
        {path.thumbnailUrl && !imgError ? (
          <img
            src={path.thumbnailUrl}
            alt={path.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0D1322] via-[#090C15] to-[#12182B] flex items-center justify-center p-4 relative">
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 130" fill="none">
              <line x1="0" y1="65" x2="400" y2="65" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="200" cy="65" r="40" stroke="white" strokeWidth="1" />
            </svg>
            <Code className="w-8 h-8 text-emerald-400 opacity-60" />
          </div>
        )}

        {/* Dark Gradient Mask Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090C15] via-black/30 to-transparent pointer-events-none" />

        {/* Top Badges (Difficulty & Duration) */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-auto">
          <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-emerald-400 border border-emerald-500/30">
            {path.difficulty}
          </span>
          <span className="text-[10px] font-mono text-gray-300 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {path.duration}
          </span>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="flex flex-col flex-1 p-5 justify-between space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors leading-snug">
            {path.title}
          </h3>

          <p className="text-xs text-gray-400 mt-2 leading-relaxed font-normal line-clamp-2">
            {path.description}
          </p>

          {/* Monospace Technology Skill Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {path.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[10px] font-mono text-gray-300 bg-white/[0.04] border border-white/10 rounded-md flex items-center gap-1"
              >
                <Compass className="w-3 h-3 text-emerald-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Career Milestone Progress Bar */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-gray-400">
              <span>Career Milestone Completion</span>
              <span className="text-emerald-400 font-bold">{path.progress || 60}%</span>
            </div>
            <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                whileInView={{ width: `${path.progress || 60}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 h-1.5 rounded-full"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              {path.coursesCount} Courses Track
            </span>
            <Link
              to={PUBLIC.COURSES}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/15 border border-white/15 rounded-lg transition-all"
            >
              <span>View Roadmap</span>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningPathCard;
