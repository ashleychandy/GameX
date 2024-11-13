import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatAmount, formatDate } from '../../utils/format';

const HistoryContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  margin-top: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text.primary};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const HistoryItem = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.surface3};
  border-radius: 8px;
  font-size: 0.875rem;

  &:hover {
    background: ${({ theme }) => theme.surface};
  }
`;

const NoHistory = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text.secondary};
  padding: 1rem;
`;

export function GameHistory({ history, isLoading }) {
  if (isLoading) {
    return (
      <HistoryContainer>
        <Title>Game History</Title>
        <NoHistory>Loading history...</NoHistory>
      </HistoryContainer>
    );
  }

  if (!history?.length) {
    return (
      <HistoryContainer>
        <Title>Game History</Title>
        <NoHistory>No games played yet</NoHistory>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <Title>Game History</Title>
      <HistoryList>
        {history.map((game, index) => (
          <HistoryItem
            key={`${game.timestamp}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div>
              Chosen: {game.chosenNumber}
              <br />
              Rolled: {game.rolledNumber}
            </div>
            <div>
              Amount: {formatAmount(game.amount)} DICE
            </div>
            <div>
              {formatDate(game.timestamp)}
            </div>
          </HistoryItem>
        ))}
      </HistoryList>
    </HistoryContainer>
  );
}