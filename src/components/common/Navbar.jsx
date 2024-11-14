import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Button } from './Button';
import { shortenAddress } from '@/utils/helpers';

const Nav = styled.nav`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: ${({ theme, $active }) => 
    $active ? theme.primary : theme.text.secondary};
  text-decoration: none;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const WalletButton = styled(Button)`
  min-width: 140px;
`;

export function Navbar() {
  const { isConnected, connect, disconnect, address } = useWallet();
  const location = useLocation();

  return (
    <Nav>
      <Container>
        <Logo to="/">Dice Game</Logo>
        <NavLinks>
          <NavLink to="/" $active={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/play" $active={location.pathname === '/play'}>
            Play
          </NavLink>
          <WalletButton
            onClick={isConnected ? disconnect : connect}
            variant={isConnected ? "secondary" : "primary"}
          >
            {isConnected ? shortenAddress(address) : "Connect Wallet"}
          </WalletButton>
        </NavLinks>
      </Container>
    </Nav>
  );
} 