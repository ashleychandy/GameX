import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ethers } from 'ethers';

import { Button } from "../common/Button";
import { NumberSelector } from "./NumberSelector";
import { AmountInput } from "./AmountInput";
import { GameResults } from "./GameResults";
import { GameStats } from "./GameStats";
import { Loading } from "../common/Loading";
import { GameCard } from "./GameCard";
import { DiceRoll } from "./DiceRoll";
import { useWallet } from "../../contexts/WalletContext";
import { useGame } from "../../hooks/useGame";
import { useTokenApproval } from "../../hooks/useTokenApproval";
import { formatAmount } from "../../utils/helpers";
import { GAME_STATES } from "../../utils/constants";

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
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
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
  padding: 2rem;

  h1 {
    font-size: 2.5rem;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  p {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 1.1rem;
  }
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: auto;
  padding: 2rem;
`;

const BetInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.border};

  span {
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.9rem;
  }

  strong {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const QuickAmount = styled.button`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.5rem 1rem;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}20`};
    border-color: ${({ theme }) => theme.primary};
  }
`;

const StatsContainer = styled(GameCard)`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 20px;
`;

const GameProgress = styled(motion.div)`
  text-align: center;
  padding: 1rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const ErrorMessage = styled(motion.div)`
  color: ${({ theme }) => theme.error};
  text-align: center;
  padding: 1rem;
  margin: 1rem 0;
`;

export function DiceGame() {
  const { balance, address } = useWallet();
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  
  const {
    gameData,
    playDice,
    resolveGame,
    refreshGameData,
    isLoading,
    error: gameError
  } = useGame();

  const {
    approveTokens,
    isApproving,
    checkAllowance,
    error: approvalError
  } = useTokenApproval();

  // Reset game state when address changes
  useEffect(() => {
    setSelectedNumber(null);
    setBetAmount("");
    setIsPolling(false);
  }, [address]);

  // Handle errors
  useEffect(() => {
    if (gameError) {
      toast.error(gameError.message);
    }
    if (approvalError) {
      toast.error(approvalError.message);
    }
  }, [gameError, approvalError]);

  // Poll for game updates
  useEffect(() => {
    if (!isPolling || !gameData?.currentGame?.isActive) return;

    const pollInterval = setInterval(async () => {
      try {
        await refreshGameData();
        const currentGame = gameData?.currentGame;
        
        if (currentGame?.status === GAME_STATES.COMPLETED) {
          clearInterval(pollInterval);
          setIsPolling(false);
          
          const won = currentGame.result === currentGame.chosenNumber;
          toast.success(won ? "Congratulations! You won!" : "Better luck next time!");
          
          setSelectedNumber(null);
          setBetAmount("");
        }
      } catch (error) {
        console.error('Error polling game result:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [isPolling, gameData, refreshGameData]);

  const handleBetAmountChange = useCallback((value) => {
    if (!value) {
      setBetAmount("");
      return;
    }

    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');

    // Limit decimal places to 18
    const [whole, decimal = ''] = cleanValue.split('.');
    const formattedValue = whole + (decimal ? '.' + decimal.slice(0, 18) : '');

    if (isNaN(formattedValue) || parseFloat(formattedValue) < 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    
    if (parseFloat(formattedValue) > parseFloat(formatAmount(balance))) {
      toast.error("Insufficient balance");
      return;
    }
    
    setBetAmount(formattedValue);
  }, [balance]);

  const handlePlay = async () => {
    try {
      if (!selectedNumber || !betAmount) {
        toast.error("Please select a number and enter bet amount");
        return;
      }

      // Check if there's an active game
      if (gameData?.currentGame?.isActive) {
        toast.error("You have an active game. Please wait for it to complete.");
        return;
      }

      // Check and get approval if needed
      const hasApproval = await checkAllowance(betAmount);
      if (!hasApproval) {
        const approved = await approveTokens(betAmount);
        if (!approved) return;
      }

      // Place bet
      const tx = await playDice(selectedNumber, betAmount);
      await tx.wait();
      
      toast.success("Bet placed successfully!");
      setIsPolling(true);
      
      // Refresh game data
      await refreshGameData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResolve = async () => {
    try {
      if (!gameData?.currentGame?.isActive) {
        toast.error("No active game to resolve");
        return;
      }

      const tx = await resolveGame();
      await tx.wait();
      
      toast.success("Game resolved successfully!");
      await refreshGameData();
      
      setSelectedNumber(null);
      setBetAmount("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const potentialWinnings = useMemo(() => {
    if (!betAmount || isNaN(betAmount)) return "0.00";
    const winnings = (parseFloat(betAmount) * 6).toFixed(6);
    return winnings.replace(/\.?0+$/, '');
  }, [betAmount]);

  const isGameActive = gameData?.currentGame?.isActive;
  const canPlaceBet = !isLoading && !isApproving && !isGameActive;
  const showResolve = isGameActive && gameData?.currentGame?.status === GAME_STATES.PENDING;

  return (
    <GameContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <MainSection>
        <GameHeader>
          <h1>Roll the Dice</h1>
          <p>Select a number, place your bet, and test your luck!</p>
        </GameHeader>

        <NumberSelector
          selectedNumber={selectedNumber}
          onSelect={setSelectedNumber}
          disabled={!canPlaceBet}
        />

        <DiceRoll
          rolling={isLoading || isPolling}
          result={gameData?.currentGame?.result}
          won={gameData?.currentGame?.result === gameData?.currentGame?.chosenNumber}
        />

        <GameControls>
          <BetInfo>
            <div>
              <span>Balance: </span>
              <strong>{formatAmount(balance)} DICE</strong>
            </div>
            <div>
              <span>Potential Win: </span>
              <strong>{potentialWinnings} DICE</strong>
            </div>
          </BetInfo>

          <AmountInput
            value={betAmount}
            onChange={handleBetAmountChange}
            max={balance}
            disabled={!canPlaceBet}
          />

          {showResolve ? (
            <Button
              $variant="secondary"
              $fullWidth
              onClick={handleResolve}
              disabled={isLoading}
            >
              Resolve Game
            </Button>
          ) : (
            <Button
              $variant="primary"
              $fullWidth
              disabled={!selectedNumber || !betAmount || !canPlaceBet}
              onClick={handlePlay}
            >
              {isApproving ? "Approving..." : 
               isLoading ? "Rolling..." : 
               isGameActive ? "Game in Progress..." :
               "Roll Dice"}
            </Button>
          )}
        </GameControls>
      </MainSection>

      <SideSection>
        <GameStats 
          stats={gameData?.stats}
          isLoading={isLoading} 
        />
        <GameResults 
          results={gameData?.recentResults}
          isLoading={isLoading}
        />
      </SideSection>

      <AnimatePresence>
        {(isLoading || isApproving) && <Loading />}
      </AnimatePresence>
    </GameContainer>
  );
}
