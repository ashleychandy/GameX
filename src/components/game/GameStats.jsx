import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatAmount } from '../../utils/helpers';

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

  const statItems = [
    { 
      label: 'Win Rate', 
      value: `${((stats.winRate || 0) / 100).toFixed(2)}%` 
    },
    { 
      label: 'Total Games', 
      value: stats.totalGames || '0'
    },
    { 
      label: 'Games Won', 
      value: stats.totalGamesWon || '0'
    },
    { 
      label: 'Games Lost', 
      value: stats.totalGamesLost || '0'
    },
    { 
      label: 'Average Bet', 
      value: `${formatAmount(stats.averageBet || 0)} DICE` 
    },
    { 
      label: 'Total Winnings', 
      value: `${formatAmount(stats.totalWinnings || 0)} DICE` 
    },
    { 
      label: 'Total Losses', 
      value: `${formatAmount(stats.totalLosses || 0)} DICE` 
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