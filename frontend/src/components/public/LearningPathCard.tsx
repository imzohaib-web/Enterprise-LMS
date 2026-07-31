import React from 'react';
import { Link } from 'react-router-dom';
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
}

interface LearningPathCardProps {
  path: LearningPathData;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  return (
    <div className="flex flex-col h-full p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 justify-between space-y-5 group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${path.color}`}>
            {path.difficulty}
          </span>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {path.duration}
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
          {path.title}
        </h3>

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
          {path.description}
        </p>

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {path.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 text-2xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          📚 {path.coursesCount} Included Modules
        </span>
        <Link
          to={PUBLIC.COURSES}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-xs"
        >
          View Roadmap
        </Link>
      </div>
    </div>
  );
};

export default LearningPathCard;
