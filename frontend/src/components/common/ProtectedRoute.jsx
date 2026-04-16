import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, role, roles }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return <LoadingSpinner label="Authenticating..." />;
  if (!token) return <Navigate to="/login" replace />;

  const allowedRoles = roles || (role ? [role] : null);
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
