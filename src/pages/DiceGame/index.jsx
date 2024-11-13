import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useDiceGame } from '../../hooks/useDiceGame';
import { DiceSelector } from '../../components/game/DiceSelector';
import { BetInput } from '../../components/game/BetInput';
import { GameStatus } from '../../components/game/GameStatus';
import { GameHistory } from '../../components/game/GameHistory';
import { UserStats } from '../../components/game/UserStats';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { WalletPrompt } from '../../components/common/WalletPrompt';
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
    resolveGame
  } = useDiceGame();

  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');

  if (!address) {
    return <WalletPrompt />;
  }

  const handlePlay = async () => {
    if (!selectedNumber || !betAmount) {
      toast.error('Please select a number and enter bet amount');
      return;
    }

    try {
      await playDice(selectedNumber, betAmount);
      setBetAmount('');
    } catch (error) {
      console.error('Error playing dice:', error);
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
          maxBet={gameData?.maxBet}
        />
        
        <ButtonGroup>
          <Button 
            onClick={handlePlay}
            disabled={!canStartGame || loadingStates.placingBet}
            whileTap={{ scale: 0.95 }}
          >
            {loadingStates.placingBet ? 'Placing Bet...' : 'Place Bet'}
          </Button>
          
          {gameData?.isActive && (
            <Button
              onClick={resolveGame}
              disabled={loadingStates.resolving}
              whileTap={{ scale: 0.95 }}
              $variant="secondary"
            >
              {loadingStates.resolving ? 'Resolving...' : 'Resolve Game'}
            </Button>
          )}
        </ButtonGroup>
      </GameControls>

      <UserStats stats={userStats} />
      
      <GameHistory 
        history={history}
        isLoading={loadingStates.fetchingData}
      />
    </GameContainer>
  );
}

export default DiceGame; 