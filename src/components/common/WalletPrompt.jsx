import React from "react";
import { useWallet } from '../../hooks/useWallet';
import { Button } from './Button';
import { Container, Title, Description, NetworkInfo, ErrorMessage } from './styles';
import { NETWORK_CONFIG } from '../../config';

export function WalletPrompt() {
  const { connectWallet, isConnecting, error } = useWallet();

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Title>Connect Your Wallet</Title>
      <Description>
        Please connect your wallet to access the game. Make sure you have
        MetaMask installed and are on the correct network.
      </Description>
      <NetworkInfo>
        Required Network: {NETWORK_CONFIG.name}
      </NetworkInfo>
      <Button
        variant="primary"
        onClick={connectWallet}
        disabled={isConnecting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      {error && (
        <ErrorMessage
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </ErrorMessage>
      )}
    </Container>
  );
} 