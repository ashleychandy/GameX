import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatAmount } from '../../utils/format';

const StatsContainer = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  
  span {
    display: block;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 0.25rem;
  }
  
  strong {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.text.primary};
  }
`;

export function UserStats({ userData }) {
  if (!userData) return null;

  return (
    <StatsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>Your Stats</h3>
      <StatsGrid>
        <StatItem>
          <span>Total Games</span>
          <strong>{userData.totalGames.toString()}</strong>
        </StatItem>
        <StatItem>
          <span>Win Rate</span>
          <strong>{userData.totalGames > 0 ? 
            `${(userData.totalGamesWon / userData.totalGames * 100).toFixed(1)}%` : 
            '0%'}
          </strong>
        </StatItem>
        <StatItem>
          <span>Total Winnings</span>
          <strong>{formatAmount(userData.totalWinnings)} GAMEX</strong>
        </StatItem>
        <StatItem>
          <span>Total Losses</span>
          <strong>{formatAmount(userData.totalLosses)} GAMEX</strong>
        </StatItem>
      </StatsGrid>
    </StatsContainer>
  );
} 