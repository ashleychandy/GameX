import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { useWallet } from '../../contexts/WalletContext';

const PromptContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadow.md};
  max-width: 500px;
  margin: 2rem auto;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Icon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
`;

export function WalletPrompt() {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <PromptContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Icon>👛</Icon>
      <Title>Connect Your Wallet</Title>
      <Description>
        Please connect your wallet to access the game. You'll need some GAMEX tokens to play.
      </Description>
      <Button
        $variant="primary"
        onClick={connectWallet}
        disabled={isConnecting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </PromptContainer>
  );
} 