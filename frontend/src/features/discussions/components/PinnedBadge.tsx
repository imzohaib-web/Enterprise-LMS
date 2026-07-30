import React from 'react';
import Badge from '../../../components/ui/badge/Badge';

interface PinnedBadgeProps {
  size?: 'sm' | 'md';
}

export const PinnedBadge: React.FC<PinnedBadgeProps> = ({ size = 'sm' }) => {
  return (
    <Badge variant="light" color="warning" size={size}>
      <svg
        className="w-3.5 h-3.5 inline mr-1 text-orange-500 fill-current"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1.03 1 1.03-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
      </svg>
      Pinned
    </Badge>
  );
};

export default PinnedBadge;
