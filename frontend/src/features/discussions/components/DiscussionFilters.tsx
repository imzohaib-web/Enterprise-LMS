import React from 'react';
import { DiscussionFilter, DiscussionSort } from '../types';
import { Filter, ArrowUpDown } from 'lucide-react';

interface DiscussionFiltersProps {
  activeFilter: DiscussionFilter;
  activeSort: DiscussionSort;
  onFilterChange: (filter: DiscussionFilter) => void;
  onSortChange: (sort: DiscussionSort) => void;
}

export const DiscussionFilters: React.FC<DiscussionFiltersProps> = ({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
}) => {
  const filterTabs: { key: DiscussionFilter; label: string }[] = [
    { key: 'all', label: 'All Topics' },
    { key: 'recent', label: 'Recent' },
    { key: 'active', label: 'Most Active' },
    { key: 'pinned', label: 'Pinned' },
  ];

  const sortOptions: { key: DiscussionSort; label: string }[] = [
    { key: 'latest', label: 'Latest First' },
    { key: 'oldest', label: 'Oldest First' },
    { key: 'replies', label: 'Most Replies' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl shadow-sm">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
        </span>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as DiscussionSort)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {sortOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DiscussionFilters;
