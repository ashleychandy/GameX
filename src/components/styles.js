import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Nav = styled(motion.nav)`
  background: ${({ theme }) => `${theme.surface}CC`};
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => `${theme.border}50`};
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
`;

export const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  color: ${({ theme }) => theme.text.primary};
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

export const NavLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.text.primary};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${({ theme }) => theme.primary};
    transform: scaleX(${({ $active }) => ($active ? '1' : '0')});
    transition: transform 0.2s ease;
  }

  &:hover:after {
    transform: scaleX(1);
  }
`;

export const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Balance = styled.div`
  span {
    color: ${({ theme }) => theme.text.secondary};
    margin-right: 0.5rem;
  }
`;

export const Address = styled.div`
  cursor: pointer;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 8px;
  font-family: monospace;

  &:hover {
    background: ${({ theme }) => theme.surface}CC;
  }
`;

export const GameContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

export const StatItem = styled.div`
  background: ${({ theme }) => theme.surface};
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  
  h4 {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

export const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 16px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

export const NotificationWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'success': return theme.success + '20';
      case 'error': return theme.error + '20';
      default: return theme.info + '20';
    }
  }};
`;

export const NotificationIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 1rem;
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'success': return theme.success;
      case 'error': return theme.error;
      default: return theme.info;
    }
  }};
  border-radius: 50%;
`;

export const NotificationMessage = styled.p`
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

export const GameProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

export const StateIndicator = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: ${({ theme, $state }) => {
    switch ($state) {
      case 'betting': return theme.primary + '20';
      case 'rolling': return theme.warning + '20';
      case 'complete': return theme.success + '20';
      default: return theme.surface;
    }
  }};
  color: ${({ theme, $state }) => {
    switch ($state) {
      case 'betting': return theme.primary;
      case 'rolling': return theme.warning;
      case 'complete': return theme.success;
      default: return theme.text.primary;
    }
  }};
  text-align: center;
  font-weight: 500;
`;

export const Amount = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const Result = styled.div`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: ${({ theme }) => theme.primary};
`;

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  z-index: 1000;
`;

export const BetControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
`;

export const GameHistoryWrapper = styled.div`
  margin-top: 2rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  overflow: hidden;
`;

export const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.surface}20;
  }
`;

export const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ theme, $variant }) => theme[$variant] || theme.primary}20;
  color: ${({ theme, $variant }) => theme[$variant] || theme.primary};
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;