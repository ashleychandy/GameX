import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useWallet } from '@/hooks/useWallet';
import { Loading } from '@/components/common';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export default function AdminPage() {
  const { isConnected, isAdmin, address } = useWallet();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      // Add any additional admin page initialization here
      setIsLoading(false);
    };

    if (isConnected && isAdmin) {
      init();
    }
  }, [isConnected, isAdmin]);

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You do not have admin privileges.</p>
        <p>Current address: {address}</p>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <AdminPanel />
    </Container>
  );
} 