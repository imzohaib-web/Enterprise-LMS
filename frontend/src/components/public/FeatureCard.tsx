import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  badge,
}) => {
  return (
    <div className="group relative p-6 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-xs">
          {icon}
        </div>
        {badge && (
          <span className="px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
