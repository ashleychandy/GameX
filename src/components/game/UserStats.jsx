import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatAmount } from '../../utils/format';

const StatsContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  margin-top: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text.primary};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatItem = styled(motion.div)`
  text-align: center;
  padding: 1rem;
  background: ${({ theme }) => theme.surface3};
  border-radius: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export function UserStats({ stats }) {
  if (!stats) return null;

  const statItems = [
    { label: 'Win Rate', value: `${stats.winRate}%` },
    { label: 'Total Games Won', value: stats.totalGamesWon },
    { label: 'Total Games Lost', value: stats.totalGamesLost },
    { label: 'Average Bet', value: `${formatAmount(stats.averageBet)} DICE` }
  ];

  return (
    <StatsContainer>
      <Title>Your Stats</Title>
      <StatGrid>
        {statItems.map((item, index) => (
          <StatItem
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatLabel>{item.label}</StatLabel>
            <StatValue>{item.value}</StatValue>
          </StatItem>
        ))}
      </StatGrid>
    </StatsContainer>
  );
} 