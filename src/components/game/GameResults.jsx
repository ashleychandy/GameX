import React from 'react';
import styled from 'styled-components';
import { GameCard } from './GameCard';
import { useGame } from '../../hooks/useGame';
import { formatAmount } from '../../utils/helpers';

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
  }
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ResultLabel = styled.span`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.9rem;
`;

const ResultValue = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: bold;
`;

const ResultOutcome = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  background: ${({ $won, theme }) => $won ? theme.success + '20' : theme.error + '20'};
  color: ${({ $won, theme }) => $won ? theme.success : theme.error};
`;

export function GameResults() {
  const { currentGame } = useGame();

  if (!currentGame) return null;

  return (
    <GameCard>
      <h2>Current Game</h2>
      <ResultsList>
        <ResultItem>
          <ResultInfo>
            <ResultLabel>Chosen Number</ResultLabel>
            <ResultValue>{currentGame.chosenNumber}</ResultValue>
          </ResultInfo>
          <ResultInfo>
            <ResultLabel>Bet Amount</ResultLabel>
            <ResultValue>{formatAmount(currentGame.amount)} DICE</ResultValue>
          </ResultInfo>
          {currentGame.status === 'COMPLETED' && (
            <ResultOutcome $won={currentGame.status === 'WON'}>
              {currentGame.status === 'WON' ? 'Won' : 'Lost'}
            </ResultOutcome>
          )}
        </ResultItem>
      </ResultsList>
    </GameCard>
  );
}

export default GameResults; 