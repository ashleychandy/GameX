import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TrendsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1rem;
`;

const GraphContainer = styled.div`
  height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Bar = styled(motion.div)`
  flex: 1;
  background: ${({ theme }) => theme.primary};
  opacity: ${({ $frequency }) => Math.max(0.3, $frequency)};
  border-radius: 4px 4px 0 0;
  position: relative;

  &:hover {
    opacity: 1;
  }

  &::after {
    content: '${({ $number }) => $number}';
    position: absolute;
    bottom: -24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatCard = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
`;

export function GameTrends({ previousBets = [] }) {
  const stats = useMemo(() => {
    // Initialize frequencies array for numbers 1-6
    const frequencies = Array(6).fill(0);
    let totalRolls = 0;
    let hotNumber = 1;
    let maxFreq = 0;

    // Calculate frequencies
    previousBets.forEach(bet => {
      if (bet.rolledNumber) {
        frequencies[bet.rolledNumber - 1]++;
        totalRolls++;
        
        if (frequencies[bet.rolledNumber - 1] > maxFreq) {
          maxFreq = frequencies[bet.rolledNumber - 1];
          hotNumber = bet.rolledNumber;
        }
      }
    });

    // Calculate percentages
    const percentages = frequencies.map(freq => 
      totalRolls ? (freq / totalRolls) : 0
    );

    return {
      frequencies,
      percentages,
      totalRolls,
      hotNumber,
      coldNumber: frequencies.indexOf(Math.min(...frequencies)) + 1
    };
  }, [previousBets]);

  if (!previousBets.length) {
    return (
      <TrendsContainer>
        <Title>Number Trends</Title>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'gray' }}>
          Play some games to see trends
        </div>
      </TrendsContainer>
    );
  }

  return (
    <TrendsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Number Trends</Title>

      <GraphContainer>
        {stats.percentages.map((percentage, index) => (
          <Bar
            key={index}
            $number={index + 1}
            $frequency={percentage}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(5, percentage * 100)}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
          />
        ))}
      </GraphContainer>

      <StatsGrid>
        <StatCard>
          <StatLabel>Hot Number</StatLabel>
          <StatValue>{stats.hotNumber}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Cold Number</StatLabel>
          <StatValue>{stats.coldNumber}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Rolls</StatLabel>
          <StatValue>{stats.totalRolls}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Most Frequent</StatLabel>
          <StatValue>
            {Math.max(...stats.frequencies)} times
          </StatValue>
        </StatCard>
      </StatsGrid>
    </TrendsContainer>
  );
} 