import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useDiceGame } from '../../hooks/useDiceGame';
import { useGameEvents } from '../../hooks/useGameEvents';
import { formatAmount } from '../../utils/format';
import { GAME_STATES } from '../../utils/constants';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { WalletPrompt } from '../common/WalletPrompt';
import diceSprite from '../../assets/dice-sprite.svg';

// Styled Components
const GameContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.primary : theme.surface3};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.border};
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};

    &::before {
      opacity: 1;
    }
  }
`;

const StatusContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  text-align: center;
`;

const StatusText = styled(motion.p)`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme, $type }) => {
    switch ($type) {
      case "success": return theme.success;
      case "warning": return theme.warning;
      case "error": return theme.error;
      default: return theme.text.primary;
    }
  }};
`;

const DetailText = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const StatsContainer = styled(motion.div)`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadow.md};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

// Game Status Component
export function GameStatus({ gameData, requestInfo }) {
  const getStatusMessage = () => {
    if (!gameData) return { message: "Ready to play", type: "primary" };

    if (gameData.isActive) {
      return {
        message: `Active game: You chose ${gameData.chosenNumber}`,
        type: "primary"
      };
    }

    if (gameData.result) {
      const won = parseFloat(gameData.payout) > 0;
      return {
        message: won ? "You Won!" : "Better luck next time!",
        type: won ? "success" : "error"
      };
    }

    return { message: "Ready to play", type: "primary" };
  };

  const { message, type } = getStatusMessage();

  return (
    <StatusContainer>
      <StatusText
        $type={type}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {message}
      </StatusText>

      {gameData?.isActive && (
        <DetailText>
          Bet Amount: {formatAmount(gameData.amount)} DICE
        </DetailText>
      )}

      {requestInfo?.requestId && (
        <DetailText>Request ID: {requestInfo.requestId}</DetailText>
      )}
    </StatusContainer>
  );
}

// Game Stats Component
export function GameStats({ stats }) {
  return (
    <StatsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Object.entries(stats).map(([key, value]) => (
        <StatItem key={key}>
          <span>{key}</span>
          <span>{formatAmount(value)}</span>
        </StatItem>
      ))}
    </StatsContainer>
  );
}

// Main DiceGame Component
export function DiceGame() {
  const { address } = useWallet();
  const {
    gameData,
    userStats,
    history,
    requestInfo,
    canStartGame,
    loadingStates,
    playDice,
    resolveGame,
    updateGameState
  } = useDiceGame();

  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');

  useGameEvents(updateGameState);

  if (!address) {
    return <WalletPrompt />;
  }

  const handlePlay = async () => {
    try {
      await playDice(selectedNumber, betAmount);
      setBetAmount('');
    } catch (error) {
      console.error('Error playing dice:', error);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveGame();
    } catch (error) {
      console.error('Error resolving game:', error);
    }
  };

  return (
    <GameContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingOverlay visible={loadingStates.fetchingData} />
      
      <GameControls>
        <GameStatus 
          gameData={gameData}
          requestInfo={requestInfo}
        />
        
        <DiceSelector 
          selectedNumber={selectedNumber}
          onSelect={setSelectedNumber}
          disabled={!canStartGame || loadingStates.placingBet}
        />
        
        <BetInput
          value={betAmount}
          onChange={setBetAmount}
          disabled={!canStartGame || loadingStates.placingBet}
        />
        
        <ButtonGroup>
          <Button 
            onClick={handlePlay}
            disabled={!canStartGame || loadingStates.placingBet}
            whileTap={{ scale: 0.95 }}
          >
            Place Bet
          </Button>
          
          {gameData?.isActive && (
            <Button
              onClick={handleResolve}
              disabled={loadingStates.resolving}
              whileTap={{ scale: 0.95 }}
              $variant="secondary"
            >
              Resolve Game
            </Button>
          )}
        </ButtonGroup>
      </GameControls>

      <GameStats stats={userStats} />
      
      <GameHistory 
        history={history} 
        onRefresh={updateGameState}
      />
    </GameContainer>
  );
} 