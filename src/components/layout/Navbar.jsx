import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { useWallet } from '../../contexts/WalletContext';
import { formatAddress, formatAmount } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { handleError } from '../../utils/errorHandling';

const Nav = styled.nav`
  background: ${({ theme }) => theme.surface};
  padding: 1rem 2rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const NavContainer = styled(motion.create("nav"))`
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

const NavLink = styled(motion(Link))`
  color: ${({ $active, theme }) => 
    $active ? theme.primary : theme.text.secondary};
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.background};
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Balance = styled.div`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  font-weight: 500;
  
  span {
    color: ${({ theme }) => theme.text.secondary};
    margin-right: 0.5rem;
  }
`;

const Address = styled(motion.div)`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  font-family: monospace;
  cursor: pointer;
`;

export function Navbar() {
  const location = useLocation();
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Nav>
      <NavContainer>
        <NavLinks>
          <NavLink 
            to="/"
            $active={location.pathname === '/'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Home
          </NavLink>
          <NavLink 
            to="/game"
            $active={location.pathname === '/game'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play
          </NavLink>
          <NavLink 
            to="/admin"
            $active={location.pathname === '/admin'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Admin
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