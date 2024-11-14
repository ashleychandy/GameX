import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatEther } from '../../utils/helpers';
import Loading from '../common/Loading';

const GameStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <StatsContainer>
        <Loading size="small" />
      </StatsContainer>
    );
  }

  return (
    <StatsContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StatsTitle>Your Stats</StatsTitle>
      <StatsGrid>
        <StatItem>
          <StatLabel>Games Played</StatLabel>
          <StatValue>{stats.gamesPlayed}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Wins</StatLabel>
          <StatValue success>{stats.totalWins}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Losses</StatLabel>
          <StatValue error>{stats.totalLosses}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Total Winnings</StatLabel>
          <StatValue>{formatEther(stats.totalWinnings)} ETH</StatValue>
        </StatItem>
      </StatsGrid>
    </StatsContainer>
  );
};

const StatsContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const StatsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme, success, error }) => 
    success ? theme.colors.success :
    error ? theme.colors.error :
    theme.colors.primary};
`;

export default GameStats; 