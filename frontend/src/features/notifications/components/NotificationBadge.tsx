import React from 'react';

interface NotificationBadgeProps {
  count: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
