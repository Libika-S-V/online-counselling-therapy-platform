import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
