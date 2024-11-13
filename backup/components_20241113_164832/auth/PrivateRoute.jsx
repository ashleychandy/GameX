import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

export function PrivateRoute({ children }) {
  const { account } = useWeb3React();
  const location = useLocation();

  if (!account) {
    return <Navigate to="/connect" state={{ from: location }} replace />;
  }

  return children;
} 