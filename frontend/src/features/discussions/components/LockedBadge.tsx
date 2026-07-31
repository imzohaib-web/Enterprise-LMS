import React from 'react';
import Badge from '../../../components/ui/badge/Badge';

interface LockedBadgeProps {
  size?: 'sm' | 'md';
}

export const LockedBadge: React.FC<LockedBadgeProps> = ({ size = 'sm' }) => {
  return (
    <Badge variant="light" color="dark" size={size}>
      <svg
        className="w-3.5 h-3.5 inline mr-1 text-gray-500 fill-current"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
      Locked
    </Badge>
  );
};

export default LockedBadge;
