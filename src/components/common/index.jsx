import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';

// Button Component
export const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.primary : theme.surface3};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

// Loading Component
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $size }) => $size === 'small' ? '100px' : '200px'};
`;

const Spinner = styled.div`
  width: ${({ $size }) => $size === 'small' ? '24px' : '48px'};
  height: ${({ $size }) => $size === 'small' ? '24px' : '48px'};
  border: 3px solid ${({ theme }) => theme.background};
  border-top: 3px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const Loading = ({ size = 'medium', message }) => (
  <LoadingContainer $size={size}>
    <Spinner $size={size} />
    {message && <p>{message}</p>}
  </LoadingContainer>
);

Loading.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string
};

// Protected Route Component
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isConnected, isAdmin } = useWallet();

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool
};

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

// WalletPrompt Component
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
  color: ${({ theme }) => theme.text.primary};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

export const WalletPrompt = () => {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <PromptContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>Connect Your Wallet</Title>
      <Description>
        Please connect your wallet to access the game. You'll need some DICE tokens to play.
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
}; 