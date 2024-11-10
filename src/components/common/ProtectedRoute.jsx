import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';

export function ProtectedRoute({ children }) {
  const { isConnected } = useWallet();
  return isConnected ? children : <Navigate to="/" />;
} 