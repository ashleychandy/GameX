import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { useGameContext } from '@/contexts/GameContext';
import { LoadingOverlay } from './LoadingOverlay';
import PropTypes from 'prop-types';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isConnected, isLoading } = useWallet();
  const { isAdmin } = useGameContext();

  if (isLoading) {
    return <LoadingOverlay message="Checking access..." />;
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool
}; 