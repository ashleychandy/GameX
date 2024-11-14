import React from 'react';
import styled from 'styled-components';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/common/Button';
import { useTheme } from '@/hooks/useTheme';
import { FaSun, FaMoon } from 'react-icons/fa';

const Nav = styled(motion.nav)`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(RouterNavLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.text.primary};
  font-weight: 500;
  padding: 0.5rem;
  position: relative;
  transition: color 0.2s ease;

  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: 0;
    left: 0;
    background: ${({ theme }) => theme.primary};
    transform: scaleX(0);
    transition: transform 0.2s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.primary};
  }

  &.active {
    color: ${({ theme }) => theme.primary};
    &:after {
      transform: scaleX(1);
    }
  }
`;

const WalletButton = styled(Button)`
  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
`;

const ThemeToggle = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

export function Navbar() {
  const { isConnected, isAdmin, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();

  return (
    <Nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <NavLink to="/" end>
        Home
      </NavLink>
      {isConnected && (
        <>
          <NavLink to="/dice">
            Dice Game
          </NavLink>
          <NavLink to="/profile">
            Profile
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin">
              Admin
            </NavLink>
          )}
        </>
      )}
      <ThemeToggle onClick={toggleTheme}>
        {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
      </ThemeToggle>
      <WalletButton
        onClick={isConnected ? disconnect : connect}
        $variant={isConnected ? "secondary" : "primary"}
      >
        {isConnected ? "Disconnect" : "Connect Wallet"}
      </WalletButton>
    </Nav>
  );
}

export { Navbar }; 