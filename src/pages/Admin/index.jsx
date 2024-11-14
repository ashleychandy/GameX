import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { Button } from '@/components/common/Button';
import { formatAmount } from '@/utils/helpers';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1.5rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Stat = styled.div`
  background: ${({ theme }) => theme.surface2};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

export function AdminPage() {
  const { gameStats, isLoading, withdrawFees } = useGame();

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Title>Admin Dashboard</Title>
      
      <Card>
        <StatGrid>
          <Stat>
            <h3>Total Games</h3>
            <p>{gameStats?.totalGames || 0}</p>
          </Stat>
          <Stat>
            <h3>Total Volume</h3>
            <p>{formatAmount(gameStats?.totalVolume || 0)} DICE</p>
          </Stat>
          <Stat>
            <h3>House Edge</h3>
            <p>{gameStats?.houseEdge || 0}%</p>
          </Stat>
          <Stat>
            <h3>Collected Fees</h3>
            <p>{formatAmount(gameStats?.collectedFees || 0)} DICE</p>
          </Stat>
        </StatGrid>

        <Button
          variant="primary"
          onClick={withdrawFees}
          disabled={isLoading}
        >
          Withdraw Fees
        </Button>
      </Card>
    </Container>
  );
} 