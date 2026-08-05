import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Layers, Code, Server, Cpu, ShieldCheck, Terminal } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export interface LearningPathData {
  id: string;
  title: string;
  difficulty: string;
  coursesCount: number;
  duration: string;
  description: string;
  skills: string[];
  color: string;
  progress?: number;
}

interface LearningPathCardProps {
  path: LearningPathData;
  index?: number;
}

const getPathCover = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('frontend') || lowerTitle.includes('react')) {
    return {
      bg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
      icon: <Code className="w-9 h-9 text-blue-400" />,
    };
  }
  if (lowerTitle.includes('backend') || lowerTitle.includes('systems')) {
    return {
      bg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950',
      icon: <Server className="w-9 h-9 text-emerald-400" />,
    };
  }
  if (lowerTitle.includes('ai') || lowerTitle.includes('ml') || lowerTitle.includes('machine')) {
    return {
      bg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-purple-950',
      icon: <Cpu className="w-9 h-9 text-amber-400" />,
    };
  }
  if (lowerTitle.includes('devops') || lowerTitle.includes('cloud')) {
    return {
      bg: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950',
      icon: <Terminal className="w-9 h-9 text-cyan-400" />,
    };
  }
  if (lowerTitle.includes('cyber') || lowerTitle.includes('security') || lowerTitle.includes('appsec')) {
    return {
      bg: 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950',
      icon: <ShieldCheck className="w-9 h-9 text-rose-400" />,
    };
  }
  return {
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
    icon: <Layers className="w-9 h-9 text-indigo-400" />,
  };
};

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path, index = 0 }) => {
  const cover = getPathCover(path.title);

  const visibleSkills = path.skills.slice(0, 3);
  const remainingSkills = path.skills.length - visibleSkills.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 3) * 0.08 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="group flex flex-col h-full rounded-xl bg-[#10141F] border border-white/[0.06] hover:border-white/20 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden justify-between"
    >
      <div>
        {/* 1. Thumbnail/Cover Graphic Top Header (16:9 ratio) */}
        <div className={`relative aspect-[16/9] w-full ${cover.bg} flex items-center justify-center border-b border-white/[0.08] overflow-hidden`}>
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          
          {/* Tech Cover Icon Graphic */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 shadow-md group-hover:scale-110 transition-transform duration-300">
            {cover.icon}
          </div>

          {/* Difficulty Badge Overlay (Top-Left Chip) */}
          <div className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-200 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-md shadow-sm">
            {path.difficulty}
          </div>
        </div>

        {/* Card Main Body Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
            {path.title}
          </h3>

          <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
            {path.description}
          </p>

          {/* 3. Skill-Chip Tag List (Inline flex-wrap, max 3 + overflow indicator) */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[11px] font-medium bg-white/[0.04] text-gray-300 rounded-md"
              >
                {skill}
              </span>
            ))}
            {remainingSkills > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-medium bg-white/[0.03] text-gray-400 rounded-md">
                +{remainingSkills} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Metadata Row + Progress & CTA */}
      <div className="p-5 pt-0 space-y-3.5">
        {/* 2. Metadata Grouping Row (Duration & Courses) */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 border-t border-white/[0.06] pt-3">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {path.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            {path.coursesCount} Courses
          </span>
        </div>

        {/* 4. Progress Bar & View Roadmap CTA */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium text-gray-400">
              <span>Path Completion</span>
              <span className="text-brand-400 font-semibold">{path.progress || 60}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                whileInView={{ width: `${path.progress || 60}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="bg-brand-500 h-1.5 rounded-full"
              />
            </div>
          </div>

          <div className="pt-1">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={PUBLIC.COURSES}
                className="ds-public-btn-primary w-full text-center py-2 text-xs font-semibold text-white rounded-lg shadow-sm block"
              >
                View Roadmap
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningPathCard;
