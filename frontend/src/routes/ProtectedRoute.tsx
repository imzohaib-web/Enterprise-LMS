import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectPath?: string;
  isAllowed?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = '/signin',
  isAllowed = true, // By default we allow entry since auth is not implemented yet
}) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
