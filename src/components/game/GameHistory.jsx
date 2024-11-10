import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatAmount } from '../../utils/format';
import { formatDate } from '../../utils/date';
import { Button } from '../common/Button';

const HistoryContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text.primary};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 3px;
  }
`;

const GameEntry = styled(motion.div)`
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  
  ${({ $won, theme }) => $won && `
    border-color: ${theme.success};
    background: ${theme.success}10;
  `}

  ${({ $lost, theme }) => $lost && `
    border-color: ${theme.error};
    background: ${theme.error}10;
  `}
`;

const GameDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const Value = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const entryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

export function GameHistory({ history = [], onClose }) {
  if (!history.length) {
    return (
      <HistoryContainer>
        <HistoryHeader>
          <Title>Game History</Title>
          <Button $variant="secondary" onClick={onClose}>Close</Button>
        </HistoryHeader>
        <EmptyState>
          <p>No games played yet</p>
          <small>Your game history will appear here</small>
        </EmptyState>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <HistoryHeader>
        <Title>Game History</Title>
        <Button $variant="secondary" onClick={onClose}>Close</Button>
      </HistoryHeader>

      <HistoryList>
        <AnimatePresence>
          {history.map((game, index) => {
            const won = game.rolledNumber === game.chosenNumber;
            const lost = !won && game.rolledNumber !== null;
            
            return (
              <GameEntry
                key={index}
                variants={entryVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                $won={won}
                $lost={lost}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <Value>
                    {won ? 'Won' : lost ? 'Lost' : 'Pending'}
                  </Value>
                  <Label>{formatDate(game.timestamp)}</Label>
                </div>

                <GameDetails>
                  <DetailItem>
                    <Label>Chosen Number</Label>
                    <Value>{game.chosenNumber}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Rolled Number</Label>
                    <Value>{game.rolledNumber ?? '?'}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Bet Amount</Label>
                    <Value>{formatAmount(game.amount)} DICE</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Payout</Label>
                    <Value>{formatAmount(game.payout || '0')} DICE</Value>
                  </DetailItem>
                </GameDetails>
              </GameEntry>
            );
          })}
        </AnimatePresence>
      </HistoryList>
    </HistoryContainer>
  );
} 