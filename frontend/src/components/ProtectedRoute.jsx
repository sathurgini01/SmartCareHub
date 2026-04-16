import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role, roles }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;

  const allowedRoles = roles || (role ? [role] : null);
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

export default ProtectedRoute;
