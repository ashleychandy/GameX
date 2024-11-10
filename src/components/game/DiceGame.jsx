import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../hooks/useGame';
import { useTokenApproval } from '../../hooks/useTokenApproval';
import { NumberSelector } from './NumberSelector';
import { BetInput } from './BetInput';
import { DiceRoll } from './DiceRoll';
import { GameProgress } from './GameProgress';
import { validateBetAmount } from '../../utils/validation';
import { GAME_STATES, UI_STATES } from '../../utils/constants';
import { Button } from '../common/Button';

const GameContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
`;

const GameSection = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const BettingSection = styled(GameSection)`
  display: grid;
  gap: 1.5rem;
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
  text-align: center;
  margin: 0.5rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};

  h4 {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  span {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

export function DiceGame() {
  const { balance, address } = useWallet();
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [uiState, setUiState] = useState(UI_STATES.IDLE);
  const [showRollAnimation, setShowRollAnimation] = useState(false);
  
  const {
    gameData,
    playDice,
    resolveGame,
    refreshGameData,
    isLoading: isGameLoading
  } = useGame();

  const {
    approveTokens,
    checkAllowance,
    isApproving,
    hasApproval
  } = useTokenApproval();

  const resetGameState = useCallback(() => {
    setSelectedNumber(null);
    setBetAmount('');
    setUiState(UI_STATES.IDLE);
    setShowRollAnimation(false);
  }, []);

  // Reset game state when address changes
  useEffect(() => {
    resetGameState();
  }, [address, resetGameState]);

  // Check if game needs to be resolved
  useEffect(() => {
    const checkGameStatus = async () => {
      if (gameData?.currentGame?.isActive && 
          gameData.currentGame.status === GAME_STATES.PENDING_VRF) {
        setUiState(UI_STATES.WAITING_FOR_RESULT);
        setShowRollAnimation(true);
        await resolveGame();
        setShowRollAnimation(false);
      }
    };
    
    checkGameStatus();
  }, [gameData, resolveGame]);

  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
    toast.info(`Selected number ${number}`);
  };

  const handleBetAmountChange = (amount) => {
    setBetAmount(amount);
  };

  const handlePlaceBet = async () => {
    try {
      // Validate inputs
      if (!selectedNumber) {
        toast.error('Please select a number');
        return;
      }

      const validatedAmount = validateBetAmount(betAmount);

      // Check and handle approval if needed
      const hasTokenApproval = await checkAllowance(betAmount);
      if (!hasTokenApproval) {
        setUiState(UI_STATES.APPROVING);
        await approveTokens(betAmount);
      }

      // Place bet
      setUiState(UI_STATES.PLACING_BET);
      await playDice(selectedNumber, validatedAmount);
      setUiState(UI_STATES.WAITING_FOR_RESULT);
      setShowRollAnimation(true);

    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error(error.message);
      setUiState(UI_STATES.ERROR);
      setShowRollAnimation(false);
    }
  };

  const handleNewGame = () => {
    resetGameState();
    refreshGameData();
  };

  const isGameActive = gameData?.currentGame?.isActive;
  const isInteractionDisabled = isGameActive || isGameLoading || isApproving;
  const currentGame = gameData?.currentGame;
  const gameResult = currentGame?.rolledNumber;
  const hasWon = gameResult === currentGame?.chosenNumber;

  return (
    <GameContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StatsRow>
        <StatItem>
          <h4>Balance</h4>
          <span>{ethers.utils.formatEther(balance || '0')} DICE</span>
        </StatItem>
        <StatItem>
          <h4>Last Win</h4>
          <span>{gameData?.stats?.lastWinAmount || '0'} DICE</span>
        </StatItem>
        <StatItem>
          <h4>Games Played</h4>
          <span>{gameData?.stats?.totalGames || '0'}</span>
        </StatItem>
      </StatsRow>

      <BettingSection>
        <NumberSelector 
          selectedNumber={selectedNumber}
          onSelectNumber={handleNumberSelect}
          disabled={isInteractionDisabled}
        />

        <BetInput
          value={betAmount}
          onChange={handleBetAmountChange}
          disabled={isInteractionDisabled}
          maxAmount={balance}
        />

        <ButtonGroup>
          <Button
            onClick={handlePlaceBet}
            disabled={isInteractionDisabled || !selectedNumber || !betAmount}
            isLoading={isGameLoading || isApproving}
            $variant="primary"
            $size="large"
          >
            Place Bet
          </Button>

          {isGameActive && (
            <Button
              onClick={handleNewGame}
              $variant="secondary"
              $size="large"
            >
              New Game
            </Button>
          )}
        </ButtonGroup>

        <InfoText>
          {isApproving ? 'Approving tokens...' : 
           isGameLoading ? 'Processing bet...' : 
           'Select a number and place your bet to play'}
        </InfoText>
      </BettingSection>

      {showRollAnimation && (
        <GameSection>
          <DiceRoll
            rolling={uiState === UI_STATES.WAITING_FOR_RESULT}
            result={gameResult}
            won={hasWon}
          />
        </GameSection>
      )}

      {isGameActive && (
        <GameSection>
          <GameProgress 
            gameState={currentGame.status}
            requestDetails={currentGame}
          />
        </GameSection>
      )}
    </GameContainer>
  );
}
