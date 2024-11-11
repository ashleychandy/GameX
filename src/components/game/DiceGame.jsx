import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../hooks/useGame';
import { useContractState } from '../../hooks/useContractState';
import { useContractInteraction } from '../../hooks/useContractInteraction';
import { DiceSelector } from './DiceSelector';
import { BetInput } from './BetInput';
import { GameStatus } from './GameStatus';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { formatAmount, calculateMaxBet } from '../../utils/format';
import { UI_STATES, GAME_STATUS } from '../../utils/constants';
import { debounce } from 'lodash';

const GameContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const AdminControls = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const StatsContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.surface2};
  border-radius: 12px;
`;

export function DiceGame() {
  const { address, isAdmin } = useWallet();
  const { 
    gameData, 
    previousBets, 
    pendingRequest, 
    refreshGameState,
    userData,
    requestDetails,
    canStart 
  } = useGame();
  const { state: contractState } = useContractState();
  const { 
    playDice, 
    resolveGame, 
    recoverStuckGame,
    forceStopGame,
    pause,
    unpause,
    uiState 
  } = useContractInteraction();
  
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');

  const maxBet = calculateMaxBet(ethers.BigNumber.from(contractState.contractBalance));

  const handlePlay = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const amount = ethers.parseEther(betAmount);
      await playDice(selectedNumber, amount);
      refreshGameState();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveGame();
      refreshGameState();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRecoverGame = async () => {
    try {
      await recoverStuckGame(address);
      refreshGameState();
      toast.success('Game recovered successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleForceStop = async () => {
    try {
      await forceStopGame(address);
      refreshGameState();
      toast.success('Game stopped successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePause = async () => {
    try {
      await pause();
      refreshGameState();
      toast.success('Contract paused successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnpause = async () => {
    try {
      await unpause();
      refreshGameState();
      toast.success('Contract unpaused successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const isGameActive = gameData?.isActive;
  const canPlay = !isGameActive && !pendingRequest && !contractState.paused && canStart;
  const canResolve = isGameActive && gameData?.status === GAME_STATUS.READY_TO_RESOLVE;
  const showRecoverOption = isGameActive && gameData?.status === GAME_STATUS.STUCK;

  // Add memoization for expensive calculations and child components
  const MemoizedDiceSelector = React.memo(DiceSelector);
  const MemoizedGameStatus = React.memo(GameStatus);

  const handleBetChange = debounce((value) => {
    // Handle bet amount change
  }, 300);

  return (
    <GameContainer>
      <MemoizedGameStatus 
        gameData={gameData}
        pendingRequest={pendingRequest}
        previousBets={previousBets}
        userData={userData}
        requestDetails={requestDetails}
      />
      
      <Controls>
        <MemoizedDiceSelector 
          disabled={!canPlay}
          value={selectedNumber}
          onChange={setSelectedNumber}
        />
        
        <BetInput
          disabled={!canPlay}
          value={betAmount}
          onChange={setBetAmount}
          maxBet={formatAmount(maxBet)}
        />
        
        <ActionButtons>
          {canPlay && (
            <Button 
              primary
              disabled={uiState !== UI_STATES.IDLE}
              onClick={handlePlay}
            >
              {uiState === UI_STATES.PLAYING ? <Loading /> : 'Roll Dice'}
            </Button>
          )}
          
          {canResolve && (
            <Button
              secondary
              disabled={uiState !== UI_STATES.IDLE}
              onClick={handleResolve}
            >
              {uiState === UI_STATES.RESOLVING ? <Loading /> : 'Resolve Game'}
            </Button>
          )}

          {showRecoverOption && (
            <Button
              warning
              disabled={uiState !== UI_STATES.IDLE}
              onClick={handleRecoverGame}
            >
              Recover Game
            </Button>
          )}
        </ActionButtons>
      </Controls>

      {isAdmin && (
        <AdminControls>
          <h3>Admin Controls</h3>
          <ActionButtons>
            <Button
              danger
              onClick={handleForceStop}
              disabled={uiState !== UI_STATES.IDLE}
            >
              Force Stop Game
            </Button>
            
            {contractState.paused ? (
              <Button
                success
                onClick={handleUnpause}
                disabled={uiState !== UI_STATES.IDLE}
              >
                Unpause Contract
              </Button>
            ) : (
              <Button
                warning
                onClick={handlePause}
                disabled={uiState !== UI_STATES.IDLE}
              >
                Pause Contract
              </Button>
            )}
          </ActionButtons>
        </AdminControls>
      )}

      <StatsContainer>
        <h3>Player Stats</h3>
        <div>Win Rate: {contractState.playerStats.winRate}%</div>
        <div>Average Bet: {formatAmount(contractState.playerStats.averageBet)} Tokens</div>
        <div>Total Games Won: {contractState.playerStats.totalGamesWon}</div>
        <div>Total Games Lost: {contractState.playerStats.totalGamesLost}</div>
      </StatsContainer>
    </GameContainer>
  );
}
