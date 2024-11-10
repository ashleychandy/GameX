import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatAmount } from '../../utils/format';

const StatsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
`;

const StatValue = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  font-size: 1rem;
  ${({ $positive, $negative, theme }) => {
    if ($positive) return `color: ${theme.success};`;
    if ($negative) return `color: ${theme.error};`;
    return '';
  }}
`;

const Title = styled.h3`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1rem;
`;

const CurrentGameInfo = styled.div`
  padding: 1rem;
  background: ${({ theme }) => `${theme.primary}10`};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.primary};
`;

export function GameStats({ stats, currentGame }) {
  if (!stats) return null;

  const formatWinRate = (rate) => {
    if (!rate || isNaN(rate)) return '0%';
    return `${(Number(rate) / 100).toFixed(2)}%`;
  };

  const statItems = [
    {
      label: 'Total Games',
      value: stats.totalGames?.toString() || '0'
    },
    {
      label: 'Games Won',
      value: stats.gamesWon?.toString() || '0',
      positive: true
    },
    {
      label: 'Games Lost',
      value: stats.gamesLost?.toString() || '0',
      negative: true
    },
    {
      label: 'Win Rate',
      value: formatWinRate(stats.winRate),
      positive: Number(stats.winRate) > 5000
    },
    {
      label: 'Total Winnings',
      value: `${formatAmount(stats.totalWinnings || '0')} DICE`,
      positive: true
    },
    {
      label: 'Total Losses',
      value: `${formatAmount(stats.totalLosses || '0')} DICE`,
      negative: true
    },
    {
      label: 'Average Bet',
      value: `${formatAmount(stats.averageBet || '0')} DICE`
    }
  ];

  return (
    <StatsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Game Statistics</Title>

      {currentGame?.isActive && (
        <CurrentGameInfo>
          <StatLabel>Current Game</StatLabel>
          <StatItem>
            <StatLabel>Chosen Number</StatLabel>
            <StatValue>{currentGame.chosenNumber}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Bet Amount</StatLabel>
            <StatValue>{formatAmount(currentGame.amount)} DICE</StatValue>
          </StatItem>
        </CurrentGameInfo>
      )}

      <StatGroup>
        {statItems.map((item, index) => (
          <StatItem key={index}>
            <StatLabel>{item.label}</StatLabel>
            <StatValue 
              $positive={item.positive}
              $negative={item.negative}
            >
              {item.value}
            </StatValue>
          </StatItem>
        ))}
      </StatGroup>
    </StatsContainer>
  );
} 