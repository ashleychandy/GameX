import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GameCard } from './GameCard';

const TrendsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TrendGraph = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 150px;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
`;

const Bar = styled(motion.div)`
  flex: 1;
  background: ${({ $value, theme }) => {
    const percentage = ($value / 6) * 100;
    return `linear-gradient(to top, 
      ${theme.primary}40 ${percentage}%, 
      transparent ${percentage}%
    )`;
  }};
  height: 100%;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.primary};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  text-align: center;
`;

const StatItem = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 8px;
  
  h4 {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.text.primary};
    font-weight: bold;
  }
`;

export function GameTrends({ previousBets }) {
  // Calculate number frequencies
  const frequencies = Array(6).fill(0);
  previousBets.forEach(bet => {
    frequencies[bet.rolledNumber - 1]++;
  });

  const maxFreq = Math.max(...frequencies);

  return (
    <GameCard title="Number Trends">
      <TrendsContainer>
        <TrendGraph>
          {frequencies.map((freq, i) => (
            <Bar
              key={i}
              $value={freq}
              initial={{ height: 0 }}
              animate={{ height: `${(freq / maxFreq) * 100}%` }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </TrendGraph>
        
        <Stats>
          <StatItem>
            <h4>Most Common</h4>
            <p>{frequencies.indexOf(maxFreq) + 1}</p>
          </StatItem>
          <StatItem>
            <h4>Total Rolls</h4>
            <p>{previousBets.length}</p>
          </StatItem>
        </Stats>
      </TrendsContainer>
    </GameCard>
  );
} 