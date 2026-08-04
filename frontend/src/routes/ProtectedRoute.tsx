import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { PUBLIC } from '../constants/routes';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  isAllowed?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAllowed = true }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated || !isAllowed) {
    return <Navigate to={PUBLIC.LOGIN} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
