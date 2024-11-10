import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { useWallet } from '../../contexts/WalletContext';
import { formatAddress, formatAmount } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { handleError } from '../../utils/errorHandling';

// Create motion components first
const MotionNav = motion.nav;
const MotionDiv = motion.div;

const Nav = styled(MotionNav)`
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 1rem 2rem;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

// Create a base Link component with motion
const MotionLink = motion(Link);

const StyledNavLink = styled(MotionLink)`
  color: ${({ theme, $active }) => 
    $active ? theme.primary : theme.text.secondary};
  text-decoration: none;
  font-weight: 500;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${({ theme }) => theme.primary};
    transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
    transition: transform 0.2s ease;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Balance = styled.div`
  color: ${({ theme }) => theme.text.secondary};
  
  span {
    margin-right: 0.5rem;
  }
`;

const Address = styled(MotionDiv)`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  cursor: pointer;
`;

// NavLink component with motion properties
const NavLink = ({ to, children, $active }) => (
  <StyledNavLink
    to={to}
    $active={$active}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </StyledNavLink>
);

export function Navbar() {
  const location = useLocation();
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
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
                {formatAmount(balance)} DICE
              </Balance>
              <Address
                onClick={handleAddressClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {formatAddress(address)}
              </Address>
              <Button
                $variant="outline"
                onClick={disconnectWallet}
                disabled={isConnecting}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              $variant="primary"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </WalletInfo>
      </NavContainer>
    </Nav>
  );
} 