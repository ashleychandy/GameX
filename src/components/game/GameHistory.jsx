import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther, shortenAddress } from '../../utils/helpers';
import { useWallet } from '../../contexts/WalletContext';
import Loading from '../common/Loading';

const GameHistory = ({ history, loading }) => {
  const { account } = useWallet();

  if (loading) {
    return (
      <HistoryContainer>
        <Loading size="small" />
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <HistoryTitle>Recent Games</HistoryTitle>
      <HistoryList>
        <AnimatePresence>
          {history.map((game, index) => (
            <HistoryItem
              key={game.txHash}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              won={game.won}
            >
              <GameInfo>
                <GameNumber>Roll: {game.number}</GameNumber>
                <GameResult>Result: {game.result}</GameResult>
              </GameInfo>
              <GameDetails>
                <Amount>{formatEther(game.amount)} ETH</Amount>
                <TimeStamp>{new Date(game.timestamp).toLocaleString()}</TimeStamp>
              </GameDetails>
              <TransactionLink 
                href={`https://sepolia.etherscan.io/tx/${game.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </TransactionLink>
            </HistoryItem>
          ))}
        </AnimatePresence>
      </HistoryList>
    </HistoryContainer>
  );
};

const HistoryContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const HistoryTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.md};

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

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-left: 4px solid ${({ won, theme }) => 
    won ? theme.colors.success : theme.colors.error};
  border-radius: 4px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const GameNumber = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const GameResult = styled.span`
  color: ${({ theme }) => theme.colors.textAlt};
`;

const GameDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Amount = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const TimeStamp = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textAlt};
`;

const TransactionLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8rem;
  text-decoration: none;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

export default GameHistory; 