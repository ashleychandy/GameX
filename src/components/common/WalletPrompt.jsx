import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { Button } from './Button';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  text-align: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
  max-width: 400px;
`;

export function WalletPrompt() {
  const { connectWallet } = useWallet();

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>Connect Your Wallet</Title>
      <Description>
        Please connect your wallet to play the Dice Game. Make sure you're on the correct network.
      </Description>
      <Button
        variant="primary"
        onClick={connectWallet}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Connect Wallet
      </Button>
    </Container>
  );
} 