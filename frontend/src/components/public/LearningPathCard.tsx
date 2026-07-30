import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Layers, Compass } from 'lucide-react';
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

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path, index = 0 }) => {
  const xOffset = index % 2 === 0 ? -30 : 30;

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group flex flex-col h-full p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-brand-500/40 backdrop-blur-xl shadow-xl transition-colors duration-300 justify-between space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="px-3.5 py-1 text-2xs font-extrabold uppercase tracking-wider text-brand-300 bg-brand-500/20 border border-brand-500/30 rounded-full">
            {path.difficulty}
          </span>
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            {path.duration}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-white group-hover:text-brand-300 transition-colors leading-snug">
          {path.title}
        </h3>

        <p className="text-xs text-gray-300 mt-3 leading-relaxed">
          {path.description}
        </p>

        {/* Technology Skill Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mt-5">
          {path.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 text-2xs font-semibold bg-white/5 border border-white/10 text-gray-300 rounded-lg flex items-center gap-1"
            >
              <Compass className="w-3 h-3 text-brand-400" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Preview */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-semibold text-gray-400">
            <span>Career Path Completion</span>
            <span className="text-brand-400">{path.progress || 60}%</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: `${path.progress || 60}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 h-1.5 rounded-full"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            {path.coursesCount} Courses
          </span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={PUBLIC.COURSES}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl shadow-xs transition-all block"
            >
              View Roadmap
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningPathCard;
