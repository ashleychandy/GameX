import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom';
import { useWallet } from '../contexts/WalletContext';
import { formatAmount, formatAddress, formatDate } from '../utils/helpers';
import { GAME_STATES, ERROR_MESSAGES } from '../utils/constants';

// Common Components
export const Button = styled(motion.button)`
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.5rem 1rem';
      case 'large': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'secondary': return theme.surface;
      case 'outline': return 'transparent';
      default: return theme.primary;
    }
  }};
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'secondary': return theme.text.primary;
      case 'outline': return theme.primary;
      default: return theme.text.button;
    }
  }};
  border: 2px solid ${({ theme, $variant }) => 
    $variant === 'outline' ? theme.primary : 'transparent'
  };

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
`;

export const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Loading Components
export const LoadingSpinner = styled(motion.div)`
  border: 4px solid ${({ theme }) => theme.background};
  border-top: 4px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Layout Components
export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
`;

export const Navbar = ({ onConnect, onDisconnect, isConnected, address, balance }) => {
  const location = useLocation();
  
  return (
    <Nav>
      <NavContainer>
        <NavLinks>
          <Logo to="/">
            <span>GameX</span>Platform
          </Logo>
          <NavLink to="/" $active={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/game" $active={location.pathname === '/game'}>
            Play
          </NavLink>
        </NavLinks>
        <WalletInfo>
          {isConnected ? (
            <>
              <Balance>
                <span>Balance:</span>
                {formatAmount(balance)} GameX
              </Balance>
              <Address onClick={() => {
                navigator.clipboard.writeText(address);
                toast.success('Address copied!');
              }}>
                {formatAddress(address)}
              </Address>
              <Button onClick={onDisconnect} $variant="outline">
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={onConnect} $variant="primary">
              Connect Wallet
            </Button>
          )}
        </WalletInfo>
      </NavContainer>
    </Nav>
  );
};

// Game Components
export const GameCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

export const DiceDisplay = styled(motion.div)`
  font-size: 4rem;
  text-align: center;
  margin: 2rem 0;
`;

export const GameStats = ({ stats }) => {
  return (
    <StatsContainer>
      {Object.entries(stats).map(([key, value]) => (
        <StatItem key={key}>
          <h4>{key}</h4>
          <p>{value}</p>
        </StatItem>
      ))}
    </StatsContainer>
  );
};

export const BetControls = ({ 
  amount, 
  onAmountChange, 
  onBet, 
  isLoading 
}) => {
  return (
    <BetControlsWrapper>
      <Input
        type="number"
        value={amount}
        onChange={onAmountChange}
        placeholder="Enter bet amount"
        $fullWidth
      />
      <Button 
        onClick={onBet}
        disabled={isLoading}
        $variant="primary"
        $size="large"
      >
        {isLoading ? <LoadingSpinner size="24px" /> : 'Place Bet'}
      </Button>
    </BetControlsWrapper>
  );
};

// Modal Component
export const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <Portal>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {children}
        </ModalContent>
      </ModalOverlay>
    </Portal>
  );
};

// Notification Component
export const Notification = ({ type, message }) => {
  return (
    <NotificationWrapper $type={type}>
      <NotificationIcon $type={type} />
      <NotificationMessage>{message}</NotificationMessage>
    </NotificationWrapper>
  );
};

// GameProgress Component
export const GameProgress = ({ currentState, amount, result }) => {
  return (
    <GameProgressWrapper>
      <StateIndicator $state={currentState}>
        {GAME_STATES[currentState]}
      </StateIndicator>
      {amount && <Amount>Bet Amount: {formatAmount(amount)} GameX</Amount>}
      {result && <Result>Result: {result}</Result>}
    </GameProgressWrapper>
  );
};

// Tooltip Component
export const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  return (
    <TooltipWrapper 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && <TooltipContent>{content}</TooltipContent>}
    </TooltipWrapper>
  );
};

// Portal Component
export const Portal = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted
    ? ReactDOM.createPortal(
        children,
        document.querySelector('#portal-root') || document.body
      )
    : null;
};

// Error Boundary Component
export const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (hasError) {
      console.error('Error caught by boundary');
    }
  }, [hasError]);

  if (hasError) {
    return <div>Something went wrong</div>;
  }

  return children;
};

// Animation variants
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const diceAnimation = {
  initial: { rotate: 0 },
  animate: { rotate: 360 },
  transition: { duration: 0.5 }
};

// Export styled components
export {
  Nav,
  NavContainer,
  NavLinks,
  Logo,
  NavLink,
  WalletInfo,
  Balance,
  Address,
  GameContainer,
  StatsContainer,
  StatItem,
  ModalOverlay,
  ModalContent,
  NotificationWrapper,
  NotificationIcon,
  NotificationMessage,
  GameProgressWrapper,
  StateIndicator,
  Amount,
  Result,
  TooltipWrapper,
  TooltipContent,
  BetControlsWrapper,
  GameHistoryWrapper,
  HistoryItem,
  Badge,
  Card
} from './styles'; 