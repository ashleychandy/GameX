import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWeb3Context, useGameContext } from '@/contexts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

const Button = styled(motion.button)`
  background: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    opacity: 0.9;
  }
`;

export function HomePage() {
  const { account, connectWallet } = useWeb3Context();
  const { gameState } = useGameContext();

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title>Welcome to Dice Game</Title>
        {!account ? (
          <Button 
            onClick={connectWallet}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Connect Wallet
          </Button>
        ) : (
          <Title>Connected: {account.slice(0, 6)}...{account.slice(-4)}</Title>
        )}
      </Card>
    </Container>
  );
} 