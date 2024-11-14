import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import Button from './Button';
import { useWallet } from '@/contexts/WalletContext';

// Animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Input Component
export const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.secondary};
  }
`;

// Loading Components
const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $size }) => $size === 'small' ? '100px' : '200px'};
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '32px';
    }
  }};
  border: 3px solid ${({ theme }) => theme.background};
  border-top: 3px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export function Loading({ size = 'medium', message = 'Loading...' }) {
  return (
    <LoadingContainer $size={size}>
      <LoadingSpinner $size={size} />
      {message && <StatusText>{message}</StatusText>}
    </LoadingContainer>
  );
}

// Loading Overlay
export function LoadingOverlay({ visible, message = 'Loading...' }) {
  if (!visible) return null;

  return createPortal(
    <div className="loading-overlay">
      <Loading size="large" message={message} />
    </div>,
    document.body
  );
}

// Error Components
const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.error};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
`;

export function ErrorHandler({ error }) {
  return (
    <ErrorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <ErrorTitle>Something went wrong</ErrorTitle>
      <ErrorMessage>
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </ErrorMessage>
      <Button onClick={() => window.location.reload()} variant="primary">
        Refresh Page
      </Button>
    </ErrorContainer>
  );
}

// PropTypes
Loading.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string
};

LoadingOverlay.propTypes = {
  visible: PropTypes.bool.isRequired,
  message: PropTypes.string
};

ErrorHandler.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string
  })
};

export { Button };

// Add this styled component near the top with other styled components
const StatusText = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  margin-top: 1rem;
  font-size: 0.9rem;
`;

// Add WalletPrompt component before the PropTypes section
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

export function WalletPrompt() {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <PromptContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>Connect Your Wallet</Title>
      <Description>
        Please connect your wallet to access the game. You'll need some GAMEX tokens to play.
      </Description>
      <Button
        variant="primary"
        onClick={connectWallet}
        disabled={isConnecting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      {isConnecting && (
        <StatusText>
          Please check your wallet for connection request...
        </StatusText>
      )}
    </PromptContainer>
  );
}

// Add WalletPrompt PropTypes
WalletPrompt.propTypes = {};
