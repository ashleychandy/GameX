import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import WalletPrompt from './WalletPrompt';

const ProtectedRoute = ({ children }) => {
  const { account, loading } = useWallet();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <WalletPrompt />;
  }

  return children;
};

export default ProtectedRoute; 