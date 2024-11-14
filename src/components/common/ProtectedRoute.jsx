import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { LoadingOverlay } from './LoadingOverlay';
import PropTypes from 'prop-types';

export function ProtectedRoute({ children }) {
  const { isConnected, isLoading } = useWallet();

  if (isLoading) {
    return <LoadingOverlay message="Checking access..." />;
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
}; 