import React from 'react';
import styled from 'styled-components';
import { formatEther } from 'ethers';
import { formatDate } from '../../utils/format';

const HistoryContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
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

const HistoryItem = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.surface3};
  border-radius: 8px;
  font-size: 0.875rem;
`;

const NoHistory = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text.secondary};
  padding: 1rem;
`;

export function GameHistory({ bets }) {
  if (!bets?.length) {
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
        {bets.map((bet, index) => (
          <HistoryItem key={`${bet.timestamp}-${index}`}>
            <div>
              Chosen: {bet.chosenNumber}
              <br />
              Rolled: {bet.rolledNumber}
            </div>
            <div>
              Amount: {formatEther(bet.amount)} DICE
            </div>
            <div>
              {formatDate(bet.timestamp)}
            </div>
          </HistoryItem>
        ))}
      </HistoryList>
    </HistoryContainer>
  );
}