import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '../../../icons';
import Badge from '../../../components/ui/badge/Badge';

interface StatCardProps {
  title: string;
  value: number | string;
  growth?: number;
  icon: React.ReactNode;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  growth,
  icon,
  subtitle,
}) => {
  const isPositive = growth !== undefined && growth >= 0;

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <img src={icon} className="size-6" alt="" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-50/80 dark:bg-brand-500/10 rounded-xl text-brand-600 dark:text-brand-400">
          {renderIcon()}
        </div>
        {growth !== undefined && (
          <Badge color={isPositive ? 'success' : 'error'}>
            {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(growth)}%
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h4>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
