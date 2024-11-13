import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { useWallet } from '../../contexts/WalletContext';
import { formatAddress, formatAmount } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { handleError } from '../../utils/errorHandling';

const Nav = styled(motion.nav)`
  background: ${({ theme }) => `${theme.surface}CC`};
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => `${theme.border}50`};
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px ${({ theme }) => `${theme.shadow}20`};
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const StyledNavLink = styled(motion(Link))`
  color: ${({ theme, $active }) => 
    $active ? theme.primary : theme.text.secondary};
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
    color: ${({ theme }) => theme.primary};
  }

  ${({ $active, theme }) => $active && `
    background: ${theme.primary}15;
    color: ${theme.primary};
  `}
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => `${theme.background}80`};
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => `${theme.border}30`};
`;

const Balance = styled.div`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => `${theme.background}50`};
  border-radius: 8px;
  
  span {
    color: ${({ theme }) => theme.text.primary};
    font-weight: 500;
  }
`;

const Address = styled(motion.div)`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => `${theme.primary}15`};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;
  
  &:hover {
    background: ${({ theme }) => `${theme.primary}25`};
  }
`;

const NavLink = ({ to, children, $active }) => (
  <StyledNavLink
    to={to}
    $active={$active}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </StyledNavLink>
);

export function Navbar() {
  const location = useLocation();
  const { isConnected, isConnecting, address, balance, connectWallet, disconnectWallet } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success('Wallet disconnected');
  };

  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  return (
    <Nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
              <Address
                onClick={handleAddressClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {formatAddress(address)}
              </Address>
              <Button
                $variant="outline"
                onClick={handleDisconnect}
                disabled={isConnecting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              $variant="primary"
              onClick={handleConnect}
              disabled={isConnecting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </WalletInfo>
      </NavContainer>
    </Nav>
  );
} 