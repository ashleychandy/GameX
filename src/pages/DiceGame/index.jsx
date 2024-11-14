import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { Button } from '@/components/common';
import { toast } from 'react-toastify';
import { Loading } from '@/components/common/Loading';
import { formatAmount } from '@/utils/helpers';

const DiceContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const GameSection = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
  margin-bottom: 2rem;
`;

const BetControls = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const NumberButton = styled(motion.button)`
  padding: 1rem;
  border: 2px solid ${({ theme, selected }) => 
    selected ? theme.primary : theme.border};
  border-radius: 0.5rem;
  background: ${({ theme, selected }) => 
    selected ? `${theme.primary}20` : 'transparent'};
  color: ${({ theme }) => theme.text.primary};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultDisplay = styled(motion.div)`
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 1rem;
  background: ${({ theme, won }) => 
    won ? `${theme.success}20` : `${theme.error}20`};
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const DicePage = () => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const {
    gameData,
    gameStats,
    betHistory,
    isLoading,
    error,
    placeBet,
    refreshGameState
  } = useGame();

  const handleBet = async () => {
    if (!betAmount || !selectedNumber) {
      toast.error('Please select a number and enter bet amount');
      return;
    }

    try {
      await placeBet(selectedNumber, betAmount);
      setBetAmount('');
      setSelectedNumber(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <DiceContainer>
      <GameSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Game Stats</h2>
        <StatsGrid>
          <StatItem>
            <StatLabel>Win Rate</StatLabel>
            <StatValue>{gameStats.winRate.toFixed(2)}%</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Games Won</StatLabel>
            <StatValue>{gameStats.gamesWon}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Games Lost</StatLabel>
            <StatValue>{gameStats.gamesLost}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Avg Bet</StatLabel>
            <StatValue>{formatAmount(gameStats.averageBet)} DICE</StatValue>
          </StatItem>
        </StatsGrid>
      </GameSection>

      <GameSection>
        <h2>Place Your Bet</h2>
        <NumberGrid>
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <NumberButton
              key={number}
              selected={selectedNumber === number}
              onClick={() => setSelectedNumber(number)}
              disabled={gameData?.isActive}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {number}
            </NumberButton>
          ))}
        </NumberGrid>

        <BetControls>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter bet amount"
            disabled={gameData?.isActive}
          />
          <Button
            onClick={handleBet}
            disabled={gameData?.isActive || !betAmount || !selectedNumber}
          >
            Place Bet
          </Button>
        </BetControls>

        {gameData?.isActive && (
          <GameStatus>
            <StatusText>
              Game in progress... Chosen number: {gameData.chosenNumber}
            </StatusText>
            <StatusText>
              Bet Amount: {formatAmount(gameData.amount)} DICE
            </StatusText>
          </GameStatus>
        )}
      </GameSection>

      <GameSection>
        <h2>Bet History</h2>
        <HistoryList>
          {betHistory.map((bet, index) => (
            <HistoryItem key={index}>
              <span>Chosen: {bet.chosenNumber}</span>
              <span>Rolled: {bet.rolledNumber}</span>
              <span>Amount: {formatAmount(bet.amount)} DICE</span>
              <span>
                {new Date(bet.timestamp * 1000).toLocaleDateString()}
              </span>
            </HistoryItem>
          ))}
        </HistoryList>
      </GameSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </DiceContainer>
  );
};

export default DicePage; 