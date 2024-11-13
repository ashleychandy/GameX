import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWallet();
  const location = useLocation();

  if (!isConnected) {
    // Redirect to home page if wallet is not connected
    // Save the attempted location for potential redirect after connection
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}; 