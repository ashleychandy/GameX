import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatAmount } from '../../utils/helpers';
import ethers from 'ethers';

const StatsContainer = styled(motion.div)`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.text.secondary};
`;

const StatValue = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: bold;
`;

export function GameStats({ stats }) {
  if (!stats) return null;

  const formatWinRate = (rate) => {
    try {
      if (!rate || isNaN(rate)) return '0.00';
      // Convert from basis points (10000 = 100%) to percentage
      return (Number(rate) / 100).toFixed(2);
    } catch (error) {
      console.error('Error formatting win rate:', error);
      return '0.00';
    }
  };

  const formatGameValue = (value) => {
    try {
      if (!value || isNaN(value)) return '0';
      return ethers.BigNumber.from(value).toString();
    } catch (error) {
      console.error('Error formatting game value:', error);
      return '0';
    }
  };

  const statItems = [
    { 
      label: 'Win Rate', 
      value: `${formatWinRate(stats.winRate)}%` 
    },
    { 
      label: 'Total Games', 
      value: formatGameValue(stats.totalGames)
    },
    { 
      label: 'Games Won', 
      value: formatGameValue(stats.totalGamesWon)
    },
    { 
      label: 'Games Lost', 
      value: formatGameValue(stats.totalGamesLost)
    },
    { 
      label: 'Average Bet', 
      value: `${formatAmount(stats.averageBet || '0')} DICE` 
    },
    { 
      label: 'Total Winnings', 
      value: `${formatAmount(stats.totalWinnings || '0')} DICE` 
    },
    { 
      label: 'Total Losses', 
      value: `${formatAmount(stats.totalLosses || '0')} DICE` 
    }
  ];

  return (
    <StatsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {statItems.map((item, index) => (
        <StatItem key={index}>
          <StatLabel>{item.label}</StatLabel>
          <StatValue>{item.value}</StatValue>
        </StatItem>
      ))}
    </StatsContainer>
  );
} 