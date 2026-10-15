import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui';
import { AppRole } from '../../types';

interface Props { children: React.ReactNode; requiredRole?: AppRole; }

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <Spinner size={36} />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to={profile?.role === 'owner' ? '/dashboard' : '/dept'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
