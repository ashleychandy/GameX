import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../hooks/useContract';
import { useContractInteraction } from '../../hooks/useContractInteraction';
import { validateGameState } from '../../utils/validation';
import { UI_STATES, GAME_STATUS } from '../../utils/constants';
import { Loading } from '../common/Loading';
import { DiceControls } from './DiceControls';
import { GameStatus } from './GameStatus';
import { GameHistory } from './GameHistory';

export function DiceGame() {
  const { balance, address } = useWallet();
  const { contract } = useContract('dice');
  const { placeBet, resolveGame, cancelGame, uiState } = useContractInteraction();
  
  const [gameState, setGameState] = useState({
    isActive: false,
    chosenNumber: '0',
    amount: '0',
    status: GAME_STATUS.PENDING
  });
  const [betAmount, setBetAmount] = useState('0.1');
  const [selectedNumber, setSelectedNumber] = useState(1);

  const fetchGameState = useCallback(async () => {
    if (!contract || !address) return;
    
    try {
      const currentGame = await contract.getCurrentGame(address);
      const validatedState = validateGameState(currentGame);
      setGameState(validatedState);
    } catch (error) {
      console.error('Error fetching game state:', error);
      toast.error('Failed to fetch game state');
    }
  }, [contract, address]);

  useEffect(() => {
    fetchGameState();
    
    // Set up event listeners
    if (contract) {
      const filters = [
        contract.filters.GameStarted(address),
        contract.filters.GameResolved(address),
        contract.filters.GameCancelled(address)
      ];
      
      filters.forEach(filter => {
        contract.on(filter, fetchGameState);
      });
      
      return () => {
        filters.forEach(filter => {
          contract.off(filter, fetchGameState);
        });
      };
    }
  }, [contract, address, fetchGameState]);

  const handlePlaceBet = async () => {
    try {
      await placeBet(selectedNumber, betAmount);
      toast.success('Bet placed successfully!');
      await fetchGameState();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleClaim = async () => {
    try {
      await resolveGame();
      toast.success('Game resolved successfully!');
      await fetchGameState();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelGame();
      toast.success('Game cancelled successfully!');
      await fetchGameState();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!contract || !address) {
    return <div>Please connect your wallet to play</div>;
  }

  return (
    <GameContainer>
      <GameStatus 
        gameState={gameState} 
        onClaim={handleClaim}
        onCancel={handleCancel}
        isLoading={uiState !== UI_STATES.IDLE}
      />
      
      <DiceControls
        selectedNumber={selectedNumber}
        onNumberSelect={setSelectedNumber}
        betAmount={betAmount}
        onBetAmountChange={setBetAmount}
        onPlaceBet={handlePlaceBet}
        disabled={gameState.isActive || uiState !== UI_STATES.IDLE}
        maxBet={balance}
      />

      {uiState !== UI_STATES.IDLE && <Loading />}
      
      <GameHistory address={address} />
    </GameContainer>
  );
}

const GameContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 2rem;
`;
