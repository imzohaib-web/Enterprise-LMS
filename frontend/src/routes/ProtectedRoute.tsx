import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';
import type { UserRole } from '../types/user';
import { PUBLIC } from '../constants/routes';
import AccessDenied from '../pages/OtherPage/AccessDenied';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  isAllowed?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, isAllowed = true }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  // 1. Not Authenticated -> Redirect to Login with location state
  if (!isAuthenticated || !currentUser) {
    return <Navigate to={PUBLIC.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Explicit boolean parameter check
  if (!isAllowed) {
    return <Navigate to={PUBLIC.LOGIN} state={{ from: location }} replace />;
  }

  // 3. Role Authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role;
    // Allow if user has role or if user is admin (admin override)
    const hasRole = allowedRoles.includes(userRole) || userRole === 'admin';

    if (!hasRole) {
      return <AccessDenied allowedRoles={allowedRoles} userRole={userRole} />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
