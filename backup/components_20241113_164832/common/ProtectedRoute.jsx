import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { Loading } from './Loading';
import { ErrorHandler } from './ErrorHandler';

export function ProtectedRoute({ children, requireAdmin }) {
  const { isConnected, isAdmin, isLoading, error } = useWallet();

  if (error) {
    return <ErrorHandler error={error} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <Navigate 
        to="/" 
        replace 
        state={{ 
          error: "You don't have admin access to view this page" 
        }} 
      />
    );
  }

  return children;
} 