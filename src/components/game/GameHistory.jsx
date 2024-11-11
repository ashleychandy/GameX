import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatDate, formatAmount } from '../../utils/format';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';

const HistoryContainer = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
  }
`;

const BetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

const BetItem = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid ${({ theme, $won }) => 
    $won ? theme.success : theme.border};
`;

const BetDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
`;

const DetailBox = styled.div`
  text-align: center;
  
  span {
    display: block;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 0.25rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export function GameHistory({ previousBets = [], onRefresh, isLoading = false }) {
  return (
    <HistoryContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <HistoryHeader>
        <h3>Game History</h3>
        <Button onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </HistoryHeader>

      {isLoading ? (
        <Loading />
      ) : previousBets?.length > 0 ? (
        <BetsList>
          {previousBets.map((bet, index) => (
            <BetItem key={`bet-${index}`} $won={bet.won}>
              <span>{formatDate(bet.timestamp)}</span>
              <BetDetails>
                <DetailBox>
                  <span>Chosen</span>
                  <strong>{bet.chosenNumber}</strong>
                </DetailBox>
                <DetailBox>
                  <span>Rolled</span>
                  <strong>{bet.rolledNumber}</strong>
                </DetailBox>
                <DetailBox>
                  <span>Amount</span>
                  <strong>{formatAmount(bet.amount)} GAMEX</strong>
                </DetailBox>
              </BetDetails>
            </BetItem>
          ))}
        </BetsList>
      ) : (
        <EmptyState>
          <p>No previous games found</p>
          <small>Start playing to see your game history!</small>
        </EmptyState>
      )}
    </HistoryContainer>
  );
}