import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { GameCard } from './GameCard';
import { formatAmount } from '../../utils/helpers';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatItem = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

export function GameStats({ stats }) {
  if (!stats) return null;

  return (
    <GameCard>
      <h2>Your Stats</h2>
      <StatsGrid>
        <StatItem>
          <h3>Win Rate</h3>
          <p>{stats.winRate}%</p>
        </StatItem>
        <StatItem>
          <h3>Average Bet</h3>
          <p>{formatAmount(stats.averageBet)} DICE</p>
        </StatItem>
        <StatItem>
          <h3>Games Won</h3>
          <p>{stats.totalGamesWon}</p>
        </StatItem>
        <StatItem>
          <h3>Games Lost</h3>
          <p>{stats.totalGamesLost}</p>
        </StatItem>
      </StatsGrid>
    </GameCard>
  );
}

GameStats.propTypes = {
  stats: PropTypes.shape({
    winRate: PropTypes.string,
    averageBet: PropTypes.string,
    totalGamesWon: PropTypes.string,
    totalGamesLost: PropTypes.string
  })
};

export default GameStats; 