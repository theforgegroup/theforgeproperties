
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'Admin' | 'Agent';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={role === 'Agent' ? "/agent/portal" : "/admin"} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
