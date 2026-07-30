import React from 'react';

interface FeatureCardProps {
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
  color = 'from-brand-500/20 to-indigo-500/20 text-brand-400 border-brand-500/30',
}) => {
  return (
    <div className="group relative p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-brand-500/40 backdrop-blur-xl shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${color} border shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
            {icon}
          </div>
          {badge && (
            <span className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-300 bg-brand-500/20 border border-brand-500/30 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      <div className="pt-2 flex items-center text-xs font-semibold text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5">
        <span>Explore Feature</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </div>
  );
};

export default FeatureCard;
