import React from 'react';
import styled from 'styled-components';
import { formatEther } from 'ethers';

const StatsContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
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

const StatItem = styled.div`
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

  return (
    <StatsContainer>
      <Title>Your Stats</Title>
      <StatGrid>
        <StatItem>
          <StatLabel>Total Games</StatLabel>
          <StatValue>{stats.totalGames}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Win Rate</StatLabel>
          <StatValue>{stats.winRate}%</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Total Winnings</StatLabel>
          <StatValue>{formatEther(stats.totalWinnings)} DICE</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Average Bet</StatLabel>
          <StatValue>{formatEther(stats.averageBet)} DICE</StatValue>
        </StatItem>
      </StatGrid>
    </StatsContainer>
  );
} 