import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import Button from '../common/Button';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet, loading } = useWallet();

  return (
    <NavContainer>
      <NavContent>
        <Logo
          as={motion.div}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/">Dice Game</Link>
        </Logo>

        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/game">Play</NavLink>
        </NavLinks>

        <WalletSection>
          {account ? (
            <>
              <Address>{`${account.slice(0, 6)}...${account.slice(-4)}`}</Address>
              <Button onClick={disconnectWallet} variant="secondary">
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={connectWallet} loading={loading}>
              Connect Wallet
            </Button>
          )}
        </WalletSection>
      </NavContent>
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
  }
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Address = styled.span`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  font-family: monospace;
`;

export default Navbar; 