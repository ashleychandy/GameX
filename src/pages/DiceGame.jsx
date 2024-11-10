import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ethers } from 'ethers';

import { Button } from "../components/common/Button";
import { NumberSelector } from "../components/game/NumberSelector";
import { AmountInput } from "../components/game/AmountInput";
import { GameResults } from "../components/game/GameResults";
import { GameStats } from "../components/game/GameStats";
import { Loading } from "../components/common/Loading";
import { GameCard } from "../components/game/GameCard";
import { DiceRoll } from "../components/game/DiceRoll";
import { useWallet } from "../contexts/WalletContext";
import { useGame } from "../hooks/useGame";
import { useTokenApproval } from "../hooks/useTokenApproval";
import { formatAmount } from "../utils/helpers";
import { showError } from "../utils/errorHandling";
import { GAME_STATES } from "../utils/constants";

const GameContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 2rem;
  grid-template-columns: 2fr 1fr;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
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

export function DiceGame() {
  const { balance, address } = useWallet();
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const { approveTokens, isApproving, checkAllowance } = useTokenApproval();
  const {
    gameData,
    playDice,
    resolveGame,
    refreshGameData,
    isLoading,
    error
  } = useGame();

  // Reset game state when address changes
  useEffect(() => {
    setSelectedNumber(null);
    setBetAmount("");
  }, [address]);

  // Handle errors from useGame hook
  useEffect(() => {
    if (error) {
      showError(error, 'DiceGame');
    }
  }, [error]);

  const handleBetAmountChange = useCallback((value) => {
    // Validate bet amount
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    
    if (value && parseFloat(value) > parseFloat(formatAmount(balance))) {
      toast.error("Insufficient balance");
      return;
    }
    
    setBetAmount(value);
  }, [balance]);

  const handleBet = async () => {
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
      await playDice(selectedNumber, betAmount);
      toast.success("Bet placed successfully!");

      // Start polling for game result
      startPollingGameResult();
    } catch (error) {
      showError(error, 'placeBet');
    }
  };

  // Poll for game result
  const startPollingGameResult = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        await refreshGameData();
        const currentGame = gameData?.currentGame;
        
        if (currentGame?.status === GAME_STATES.COMPLETED) {
          clearInterval(pollInterval);
          const won = currentGame.result === currentGame.chosenNumber;
          toast.success(won ? "Congratulations! You won!" : "Better luck next time!");
          setSelectedNumber(null);
          setBetAmount("");
        }
      } catch (error) {
        console.error('Error polling game result:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup
    return () => clearInterval(pollInterval);
  }, [gameData, refreshGameData]);

  const potentialWinnings = betAmount ? 
    (parseFloat(betAmount) * 6).toFixed(2) : 
    "0.00";

  const isGameActive = gameData?.currentGame?.isActive;
  const canPlaceBet = !isLoading && !isApproving && !isGameActive;

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
          rolling={isLoading}
          result={gameData?.currentGame?.result}
          won={gameData?.currentGame?.won}
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

          <Button
            $variant="primary"
            $fullWidth
            disabled={!selectedNumber || !betAmount || !canPlaceBet}
            onClick={handleBet}
          >
            {isApproving ? "Approving..." : 
             isLoading ? "Rolling..." : 
             isGameActive ? "Game in Progress..." :
             "Roll Dice"}
          </Button>
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