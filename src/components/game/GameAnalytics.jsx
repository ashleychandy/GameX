import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useContract } from '../../hooks/useContract';
import { formatEther } from '../../utils/helpers';
import Loading from '../common/Loading';

const GameAnalytics = () => {
  const contract = useContract();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!contract) return;

      try {
        setLoading(true);
        const [
          totalGames,
          totalVolume,
          totalWins,
          averageBet
        ] = await Promise.all([
          contract.getTotalGames(),
          contract.getTotalVolume(),
          contract.getTotalWins(),
          contract.getAverageBet()
        ]);

        setStats({
          totalGames: totalGames.toString(),
          totalVolume: formatEther(totalVolume),
          totalWins: totalWins.toString(),
          averageBet: formatEther(averageBet),
          winRate: (Number(totalWins) / Number(totalGames) * 100).toFixed(2)
        });
      } catch (error) {
        console.error('Failed to fetch game stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [contract]);

  if (loading) {
    return (
      <AnalyticsContainer>
        <Loading size="small" />
      </AnalyticsContainer>
    );
  }

  return (
    <AnalyticsContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnalyticsTitle>Game Statistics</AnalyticsTitle>
      <StatsGrid>
        <StatCard>
          <StatIcon>🎲</StatIcon>
          <StatLabel>Total Games</StatLabel>
          <StatValue>{stats?.totalGames || '0'}</StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>💰</StatIcon>
          <StatLabel>Total Volume</StatLabel>
          <StatValue>{stats?.totalVolume || '0'} ETH</StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>🏆</StatIcon>
          <StatLabel>Total Wins</StatLabel>
          <StatValue>{stats?.totalWins || '0'}</StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatLabel>Win Rate</StatLabel>
          <StatValue>{stats?.winRate || '0'}%</StatValue>
        </StatCard>

        <StatCard>
          <StatIcon>💵</StatIcon>
          <StatLabel>Average Bet</StatLabel>
          <StatValue>{stats?.averageBet || '0'} ETH</StatValue>
        </StatCard>
      </StatsGrid>
    </AnalyticsContainer>
  );
};

const AnalyticsContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const AnalyticsTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows.small};

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: bold;
`;

export default GameAnalytics; 