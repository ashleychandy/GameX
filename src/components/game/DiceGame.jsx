import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../hooks/useGame';
import { useContractState } from '../../hooks/useContractState';
import { DiceSelector } from './DiceSelector';
import { BetInput } from './BetInput';
import { GameStatus } from './GameStatus';
import { GameHistory } from './GameHistory';
import { UserStats } from './UserStats';
import { calculateMaxBet } from '../../utils/format';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.primary : theme.surface3};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

export function DiceGame() {
  const { address } = useWallet();
  const { 
    gameData, 
    previousBets, 
    pendingRequest,
    userData,
    requestDetails,
    canStart,
    loadingStates,
    placeBet,
    resolveGame,
    recoverStuckGame,
    refreshGameState
  } = useGame();
  const { state: contractState } = useContractState();
  
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');

  const maxBet = calculateMaxBet(ethers.BigNumber.from(contractState.contractBalance));
  const isGameActive = gameData?.isActive;
  const isPending = pendingRequest || loadingStates.placingBet;
  const canPlay = !isGameActive && !contractState.paused && canStart && !isPending;

  const handlePlay = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    try {
      await placeBet(selectedNumber, betAmount);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveGame();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRecover = async () => {
    try {
      await recoverStuckGame();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Auto-refresh game state when needed
  useEffect(() => {
    if (isGameActive || pendingRequest) {
      const interval = setInterval(refreshGameState, 5000);
      return () => clearInterval(interval);
    }
  }, [isGameActive, pendingRequest, refreshGameState]);

  return (
    <GameContainer>
      <GameStatus 
        gameData={gameData}
        contractState={contractState}
        requestDetails={requestDetails}
        pendingRequest={pendingRequest}
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
          maxBet={maxBet}
          disabled={!canPlay}
        />

        <ButtonGroup>
          <Button
            $variant="primary"
            disabled={!canPlay}
            onClick={handlePlay}
          >
            {loadingStates.placingBet ? 'Placing Bet...' : 'Play'}
          </Button>

          {isGameActive && (
            <Button
              disabled={loadingStates.resolvingGame}
              onClick={handleResolve}
            >
              {loadingStates.resolvingGame ? 'Resolving...' : 'Resolve Game'}
            </Button>
          )}

          {pendingRequest && (
            <Button
              disabled={loadingStates.recoveringGame}
              onClick={handleRecover}
            >
              {loadingStates.recoveringGame ? 'Recovering...' : 'Recover Game'}
            </Button>
          )}
        </ButtonGroup>
      </GameControls>

      <StatsContainer>
        <UserStats 
          stats={userData}
          previousBets={previousBets}
        />
        <GameHistory 
          bets={previousBets}
          address={address}
        />
      </StatsContainer>
    </GameContainer>
  );
}
