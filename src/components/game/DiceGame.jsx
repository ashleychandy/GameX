import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useDiceGame } from '../../hooks/useDiceGame';
import { useGameEvents } from '../../hooks/useGameEvents';
import { DiceSelector } from './DiceSelector';
import { BetInput } from './BetInput';
import { GameStatus } from './GameStatus';
import { GameHistory } from './GameHistory';
import { UserStats } from './UserStats';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { WalletPrompt } from '../common/WalletPrompt';
import { toast } from 'react-toastify';

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

  // Set up event listeners
  useGameEvents(updateGameState);

  // Handle wallet not connected
  if (!address) {
    return <WalletPrompt />;
  }

  const handlePlay = async () => {
    try {
      await playDice(selectedNumber, betAmount);
      setBetAmount(''); // Reset bet amount after successful play
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

      <UserStats stats={userStats} />
      
      <GameHistory 
        history={history} 
        onRefresh={updateGameState}
      />
    </GameContainer>
  );
}
