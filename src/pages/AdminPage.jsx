import React from 'react';
import styled from 'styled-components';
import { AdminPanel } from '../components/admin/AdminPanel';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export function AdminPage() {
  return (
    <Container>
      <AdminPanel />
    </Container>
  );
}

export default AdminPage; 