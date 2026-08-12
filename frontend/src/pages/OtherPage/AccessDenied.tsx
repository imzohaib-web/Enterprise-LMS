import React from 'react';
import { Link } from 'react-router-dom';
import type { UserRole } from '../../types/user';
import { STUDENT, INSTRUCTOR, ADMIN } from '../../constants/routes';

interface AccessDeniedProps {
  allowedRoles?: UserRole[];
  userRole?: UserRole;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ allowedRoles = [], userRole }) => {
  const getDashboardRoute = () => {
    switch (userRole) {
      case 'instructor':
        return INSTRUCTOR.DASHBOARD;
      case 'admin':
        return ADMIN.DASHBOARD;
      case 'student':
      default:
        return STUDENT.DASHBOARD;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          🔒
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Access Denied (403)</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            You don't have permission to access this page. This area is restricted to{' '}
            <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{allowedRoles.join(' / ') || 'authorized'}</span> accounts.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to={getDashboardRoute()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition shadow-md"
          >
            Go to My Dashboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
