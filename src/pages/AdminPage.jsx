import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useWallet } from '../contexts/WalletContext';
import { useAdmin } from '../hooks/useAdmin';
import { AdminPanel } from '../components/admin/AdminPanel';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export function AdminPage() {
  const { isConnected } = useWallet();
  const { isAdmin } = useAdmin();

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/game" replace />;
  }

  return (
    <Container>
      <AdminPanel />
    </Container>
  );
}

export default AdminPage; 