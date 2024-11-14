// src/components/Layout.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Navbar } from './Navbar';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
`;

const Main = styled(motion.main)`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

export function Layout() {
  return (
    <LayoutWrapper>
      <Navbar />
      <Main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Outlet />
      </Main>
    </LayoutWrapper>
  );
}

