import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../../features/auth/authSlice';
import type { UserRole } from '../../types/user';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to role's default page
    const defaultRoutes: Record<UserRole, string> = {
      admin:      '/admin/dashboard',
      instructor: '/instructor/dashboard',
      student:    '/student/dashboard',
    };
    return <Navigate to={defaultRoutes[userRole] || '/'} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
