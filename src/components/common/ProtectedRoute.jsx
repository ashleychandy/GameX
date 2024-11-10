import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { useAdmin } from '../../hooks/useAdmin';
import { getRouteMetadata, ROUTES } from '../../routes';

export function ProtectedRoute({ children }) {
  const { isConnected } = useWallet();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const { requiresAuth, requireAdmin } = getRouteMetadata(location.pathname);

  if (!isConnected && requiresAuth) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
} 