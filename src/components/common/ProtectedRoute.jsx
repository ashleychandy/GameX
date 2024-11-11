import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { Loading } from './Loading';

export function ProtectedRoute({ children, requireAdmin }) {
  const { isConnected, isAdmin, isLoading } = useWallet();

  if (isLoading) {
    return <Loading />;
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
} 