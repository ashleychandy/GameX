import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { formatAmount, formatDate } from '../../utils/helpers';

const ResultsContainer = styled(motion.div)`
  padding: 1.5rem;
  background: ${({ theme }) => theme.background.primary};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ResultItem = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  border-left: 4px solid ${({ $won, theme }) => 
    $won ? theme.success : theme.error};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ResultNumbers = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const NumberBox = styled.div`
  padding: 0.5rem;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 4px;
  text-align: center;

  span {
    display: block;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.text.secondary};
  }

  strong {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const ResultInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export function GameResults({ results = [], currentGame }) {
  return (
    <ResultsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>Recent Games</h3>
      
      {currentGame?.isActive && (
        <ResultItem $won={false}>
          <ResultHeader>
            <strong>Current Game</strong>
            <span>{formatDate(currentGame.timestamp)}</span>
          </ResultHeader>
          <ResultNumbers>
            <NumberBox>
              <span>Chosen</span>
              <strong>{currentGame.chosenNumber}</strong>
            </NumberBox>
            <NumberBox>
              <span>Amount</span>
              <strong>{formatAmount(currentGame.amount)} DICE</strong>
            </NumberBox>
          </ResultNumbers>
          <ResultInfo>
            <span>Status: {currentGame.status}</span>
          </ResultInfo>
        </ResultItem>
      )}

      {results.map((result, index) => (
        <ResultItem 
          key={index}
          $won={result.chosenNumber === result.rolledNumber}
        >
          <ResultHeader>
            <strong>
              {result.chosenNumber === result.rolledNumber ? 'Won' : 'Lost'}
            </strong>
            <span>{formatDate(result.timestamp)}</span>
          </ResultHeader>
          <ResultNumbers>
            <NumberBox>
              <span>Chosen</span>
              <strong>{result.chosenNumber}</strong>
            </NumberBox>
            <NumberBox>
              <span>Rolled</span>
              <strong>{result.rolledNumber}</strong>
            </NumberBox>
          </ResultNumbers>
          <ResultInfo>
            <span>Bet: {formatAmount(result.amount)} DICE</span>
          </ResultInfo>
        </ResultItem>
      ))}

      {results.length === 0 && !currentGame?.isActive && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          No games played yet
        </div>
      )}
    </ResultsContainer>
  );
} 