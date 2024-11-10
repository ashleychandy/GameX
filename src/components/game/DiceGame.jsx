import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ethers } from 'ethers';
import { Button } from "../common/Button";
import { NumberSelector } from "./NumberSelector";
import { AmountInput } from "./AmountInput";
import { handleError } from "../../utils/helpers";
import { useGame } from "../../hooks/useGame";
import { useWallet } from "../../contexts/WalletContext";
import { GameResults } from "./GameResults";
import { GameStats } from "./GameStats";
import { Loading } from "../common/Loading";
import { GameCard } from "./GameCard";
import { GameProgress } from "./GameProgress";
import { DiceRoll } from "./DiceRoll";
import { useTokenApproval } from "../../hooks/useTokenApproval";
import { formatAmount } from "../../utils/helpers";
import { 
  GAME_STATES, 
  GAME_CONFIG
} from '../../utils/constants';

const GameContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 2rem;
  grid-template-columns: 2fr 1fr;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const MainSection = styled(GameCard)`
  grid-column: 1;
  min-height: 500px;
  display: flex;
  flex-direction: column;
`;

const SideSection = styled.div`
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-column: 1;
  }
`;

const GameHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: auto;
`;

const BetInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  margin-bottom: 1rem;

  span {
    color: ${({ theme }) => theme.text.secondary};
  }

  strong {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const BetControls = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const QuickAmount = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary + '20'};
    border-color: ${({ theme }) => theme.primary};
  }
`;

export function DiceGame() {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { address, balance } = useWallet();
  const { isApproving, checkAndApprove } = useTokenApproval();
  const { 
    gameState,
    currentGame,
    playerStats,
    previousBets,
    requestDetails,
    isLoading,
    error,
    playDice,
    resolveGame,
    refreshGameData
  } = useGame();

  const quickAmounts = ['10', '50', '100', '500'];

  // Validate input amount
  const validateAmount = (amount) => {
    if (!amount) return 'Please enter an amount';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return 'Invalid amount';
    if (parsedAmount < GAME_CONFIG.MIN_BET) return `Minimum bet is ${GAME_CONFIG.MIN_BET}`;
    if (parsedAmount > GAME_CONFIG.MAX_BET) return `Maximum bet is ${GAME_CONFIG.MAX_BET}`;
    if (parsedAmount > parseFloat(formatAmount(balance))) return 'Insufficient balance';
    return '';
  };

  const handleQuickAmount = (amount) => {
    const error = validateAmount(amount);
    setValidationError(error);
    if (!error) {
      setBetAmount(amount);
    } else {
      toast.warning(error);
    }
  };

  const handleBetAmountChange = (e) => {
    const amount = e.target.value;
    const error = validateAmount(amount);
    setValidationError(error);
    setBetAmount(amount);
  };

  const handlePlaceBet = async () => {
    if (!address) {
      toast.error('Please connect your wallet to play');
      return;
    }

    if (!selectedNumber || !betAmount) {
      toast.error('Please select a number and enter bet amount');
      return;
    }

    const error = validateAmount(betAmount);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsPlacingBet(true);
      
      // Check approval first
      const approved = await checkAndApprove(ethers.parseEther(betAmount));
      if (!approved) return;

      await playDice(selectedNumber, betAmount);
      
      // Reset form
      setSelectedNumber(null);
      setBetAmount('');
      setValidationError('');
      
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error(error.message || 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Auto-refresh when game state changes
  useEffect(() => {
    if (gameState === 'COMPLETED_WIN' || gameState === 'COMPLETED_LOSS') {
      refreshGameData();
    }
  }, [gameState, refreshGameData]);

  return (
    <GameContainer>
      <MainSection>
        <GameHeader>
          <h1>Roll the Dice</h1>
          <p>Select a number, place your bet, and test your luck!</p>
        </GameHeader>

        <NumberSelector 
          selectedNumber={selectedNumber}
          onSelect={setSelectedNumber}
          disabled={!address || currentGame?.isActive || isPlacingBet}
          min={GAME_CONFIG.MIN_NUMBER}
          max={GAME_CONFIG.MAX_NUMBER}
        />

        <DiceRoll 
          number={currentGame?.result || selectedNumber || 1}
          isRolling={isLoading}
          won={currentGame?.status === GAME_STATES.WON}
        />

        <GameControls>
          <BetInfo>
            <div>
              <span>Balance: </span>
              <strong>{address ? formatAmount(balance) : '0'} DICE</strong>
            </div>
            <div>
              <span>Potential Win: </span>
              <strong>{potentialWinnings} DICE</strong>
            </div>
          </BetInfo>

          <QuickAmounts>
            {quickAmounts.map(amount => (
              <QuickAmount
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                disabled={!address || currentGame?.isActive || isPlacingBet}
              >
                {amount} DICE
              </QuickAmount>
            ))}
          </QuickAmounts>

          <BetControls>
            <AmountInput
              value={betAmount}
              onChange={handleBetAmountChange}
              disabled={!address || currentGame?.isActive || isPlacingBet}
              min={ethers.formatEther(GAME_CONFIG.MIN_BET)}
              max={ethers.formatEther(GAME_CONFIG.MAX_BET)}
            />
            <Button
              $variant="secondary"
              onClick={() => setBetAmount(formatAmount(balance))}
              disabled={!address || currentGame?.isActive || isPlacingBet}
            >
              Max
            </Button>
          </BetControls>

          {!address ? (
            <Button
              $variant="primary"
              $fullWidth
              to="/connect"
            >
              Connect Wallet to Play
            </Button>
          ) : (
            <Button
              $variant="primary"
              $fullWidth
              onClick={handlePlaceBet}
              disabled={!canPlaceBet}
            >
              {isPlacingBet ? 'Placing Bet...' : 
               isApproving ? 'Approving...' : 
               'Place Bet'}
            </Button>
          )}

          {canResolveGame && (
            <Button
              $variant="secondary"
              $fullWidth
              onClick={resolveGame}
              disabled={isLoading}
            >
              {isLoading ? 'Resolving...' : 'Resolve Game'}
            </Button>
          )}
        </GameControls>

        <GameProgress 
          gameState={gameState} 
          isActive={currentGame?.isActive}
          requestDetails={requestDetails}
        />
      </MainSection>

      <SideSection>
        {address ? (
          <>
            <GameStats 
              stats={playerStats}
              currentGame={currentGame}
            />
            <GameResults 
              results={previousBets}
              currentGame={currentGame}
            />
          </>
        ) : (
          <GameCard>
            <h2>Connect Wallet</h2>
            <p>Connect your wallet to view your game statistics and history.</p>
          </GameCard>
        )}
      </SideSection>

      {(isLoading || isPlacingBet || isApproving) && (
        <Loading />
      )}
    </GameContainer>
  );
}
