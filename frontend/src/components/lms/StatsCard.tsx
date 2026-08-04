import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'sky';
}

const colorMap = {
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-500',  border: 'border-indigo-500/20',  trend: 'text-indigo-400' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', border: 'border-emerald-500/20', trend: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-500',   border: 'border-amber-500/20',   trend: 'text-amber-400' },
  rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-500',    border: 'border-rose-500/20',    trend: 'text-rose-400' },
  purple:  { bg: 'bg-purple-500/10',  icon: 'text-purple-500',  border: 'border-purple-500/20',  trend: 'text-purple-400' },
  sky:     { bg: 'bg-sky-500/10',     icon: 'text-sky-500',     border: 'border-sky-500/20',     trend: 'text-sky-400' },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, trend, color }) => {
  const c = colorMap[color];
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border ${c.border} p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          {trend && (
            <div className="mt-3 flex items-center gap-1">
              <svg className={`w-4 h-4 ${trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                {trend.value >= 0
                  ? <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                }
              </svg>
              <span className={`text-sm font-medium ${trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 p-3 rounded-xl ${c.bg}`}>
          <div className={`w-8 h-8 ${c.icon}`}>{icon}</div>
        </div>
      </div>
      {/* Decorative glow */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${c.bg} blur-2xl opacity-50`} />
    </div>
  );
};

export default StatsCard;
