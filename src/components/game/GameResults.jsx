import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther } from '../../utils/helpers';
import { useGameEvents } from '../../hooks/useGameEvents';
import Loading from '../common/Loading';

const GameResults = () => {
  const { results, loading } = useGameEvents();

  return (
    <ResultsContainer>
      <ResultsTitle>Recent Results</ResultsTitle>
      {loading ? (
        <LoadingWrapper>
          <Loading size="small" />
        </LoadingWrapper>
      ) : (
        <ResultsList>
          <AnimatePresence>
            {results.map((result, index) => (
              <ResultItem
                key={result.id}
                as={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                won={result.won}
              >
                <ResultInfo>
                  <ResultNumber>
                    Rolled: <span>{result.result}</span>
                  </ResultNumber>
                  <ResultGuess>
                    Guessed: <span>{result.guess}</span>
                  </ResultGuess>
                </ResultInfo>
                <ResultAmount>
                  {result.won ? '+' : '-'}{formatEther(result.amount)} ETH
                </ResultAmount>
                <ResultTime>{new Date(result.timestamp).toLocaleTimeString()}</ResultTime>
              </ResultItem>
            ))}
          </AnimatePresence>
        </ResultsList>
      )}
    </ResultsContainer>
  );
};

const ResultsContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ResultsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-height: 300px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.sm};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 3px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  border-left: 4px solid ${({ won, theme }) => 
    won ? theme.colors.success : theme.colors.error};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ResultNumber = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ResultGuess = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 0.9rem;
  
  span {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ResultAmount = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const ResultTime = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 0.8rem;
`;

export default GameResults; 