// src/components/Layout.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { useWeb3Context } from '@/contexts';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
`;

const Header = styled.header`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Main = styled(motion.main)`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const ConnectButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

export function Layout() {
  const { account, connectWallet } = useWeb3Context();

  return (
    <LayoutWrapper>
      <Header>
        <h1>Dice Game</h1>
        <ConnectButton onClick={connectWallet}>
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </ConnectButton>
      </Header>
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

