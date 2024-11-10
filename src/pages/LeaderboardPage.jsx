import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { useLeaderboard } from '../hooks/useLeaderboard';

const LeaderboardContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export function LeaderboardPage() {
  const { data, isLoading, error } = useLeaderboard();

  return (
    <LeaderboardContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1>Leaderboard</h1>
      <LeaderboardTable data={data} isLoading={isLoading} error={error} />
    </LeaderboardContainer>
  );
}

export default LeaderboardPage; 