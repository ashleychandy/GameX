import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts/WalletContext';
import { useDiceGame } from '../../hooks/useDiceGame';
import { DiceSelector } from './DiceSelector';
import { BetInput } from './BetInput';
import { GameStatus } from './GameStatus';
import { GameHistory } from './GameHistory';
import { UserStats } from './UserStats';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { validateBetAmount, calculateMaxBet } from '../../utils/gameCalculations';
import { GAME_STATES, ERROR_MESSAGES } from '../../utils/constants';
import { handleError } from '../../utils/errorHandling';
import { CONFIG } from '../../config';

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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

export function DiceGame() {
  const { address, isConnected } = useWallet();
  const {
    gameData,
    previousBets,
    pendingRequest,
    userData,
    requestDetails,
    loadingStates,
    placeBet,
    resolveGame,
    recoverStuckGame,
    refreshGameState
  } = useDiceGame();

  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate contract initialization
  useEffect(() => {
    if (!isConnected) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }
  }, [isConnected]);

  // Auto-refresh game state
  useEffect(() => {
    const interval = setInterval(refreshGameState, 10000);
    return () => clearInterval(interval);
  }, [refreshGameState]);

  const handlePlay = async () => {
    try {
      setIsProcessing(true);

      // Validate network
      const network = await provider.getNetwork();
      if (network.chainId !== CONFIG.network.chainId) {
        throw new Error(`Please switch to ${CONFIG.network.chainId} network`);
      }

      // Validate wallet connection
      if (!address) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      }

      // Validate bet amount
      const validationError = validateBetAmount(betAmount, userData?.minBet, userData?.maxBet);
      if (validationError) {
        throw new Error(validationError);
      }

      // Place bet
      const tx = await placeBet(selectedNumber, betAmount);
      
      // Track transaction
      toast.info('Transaction submitted...', { toastId: tx.hash });
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('Bet placed successfully!');
        setBetAmount('');
        await refreshGameState();
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    try {
      setIsProcessing(true);
      await resolveGame();
      await refreshGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecover = async () => {
    try {
      setIsProcessing(true);
      await recoverStuckGame();
      await refreshGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isGameActive = gameData?.isActive;
  const isPending = pendingRequest || isProcessing;
  const canPlay = !isGameActive && !isPending && isConnected;

  if (loadingStates.fetchingData) {
    return <LoadingOverlay message="Loading game data..." />;
  }

  return (
    <ErrorBoundary>
      <GameContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <GameStatus 
          gameData={gameData}
          pendingRequest={pendingRequest}
          requestDetails={requestDetails}
        />

        <GameControls>
          <DiceSelector 
            selectedNumber={selectedNumber}
            onSelect={setSelectedNumber}
            disabled={!canPlay}
          />

          <BetInput
            value={betAmount}
            onChange={setBetAmount}
            disabled={!canPlay}
            minBet={userData?.minBet}
            maxBet={userData?.maxBet}
          />

          <ButtonGroup>
            <Button
              $variant="primary"
              disabled={!canPlay || isProcessing}
              onClick={handlePlay}
              whileHover={canPlay && { scale: 1.05 }}
              whileTap={canPlay && { scale: 0.95 }}
            >
              {isProcessing ? 'Processing...' : 'Play'}
            </Button>

            {isGameActive && (
              <Button
                disabled={isProcessing}
                onClick={handleResolve}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isProcessing ? 'Resolving...' : 'Resolve Game'}
              </Button>
            )}

            {pendingRequest && (
              <Button
                disabled={isProcessing}
                onClick={handleRecover}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isProcessing ? 'Recovering...' : 'Recover Game'}
              </Button>
            )}
          </ButtonGroup>
        </GameControls>

        <StatsContainer>
          <UserStats stats={userData} />
          <GameHistory 
            bets={previousBets}
            onRefresh={refreshGameState}
          />
        </StatsContainer>
      </GameContainer>
    </ErrorBoundary>
  );
}
