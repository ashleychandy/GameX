import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ethers } from 'ethers';
import { Button } from "../common/Button";
import { NumberSelector } from "./NumberSelector";
import { AmountInput } from "./AmountInput";
import { useGame } from "../../hooks/useGame";
import { useWallet } from "../../contexts/WalletContext";
import { GameResults } from "./GameResults";
import { GameStats } from "./GameStats";
import { Loading } from "../common/Loading";
import { GameCard } from "./GameCard";
import { GameProgress } from "./GameProgress";
import { DiceRoll } from "./DiceRoll";
import { ErrorHandler } from "../common/ErrorHandler";
import { useTokenApproval } from "../../hooks/useTokenApproval";
import { formatAmount } from "../../utils/helpers";
import { validateBetAmount } from "../../utils/validation";
import { GAME_CONFIG, GAME_STATES } from "../../utils/constants";

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

export function DiceGame() {
  const { isConnected, address, balance } = useWallet();
  const { gameData, playDice, resolveGame, isLoading, error, resetGame } = useGame();
  const { hasApproval, approveTokens, isApproving, checkAllowance } = useTokenApproval();
  
  const [betAmount, setBetAmount] = useState("");
  const [selectedNumber, setSelectedNumber] = useState(null);

  // Reset game state when address changes
  useEffect(() => {
    setBetAmount("");
    setSelectedNumber(null);
    resetGame();
  }, [address, resetGame]);

  // Memoized values
  const canPlay = useMemo(() => {
    if (!isConnected || !betAmount || isLoading || isApproving) return false;
    try {
      const amount = ethers.parseEther(betAmount);
      return amount.gt(0) && amount.lte(balance);
    } catch {
      return false;
    }
  }, [isConnected, betAmount, balance, isLoading, isApproving]);

  const potentialWinnings = useMemo(() => {
    if (!betAmount) return "0";
    try {
      return (Number(betAmount) * GAME_CONFIG.PAYOUT_MULTIPLIER).toString();
    } catch {
      return "0";
    }
  }, [betAmount]);

  const isGameActive = useMemo(() => 
    gameData?.currentGame?.isActive && 
    gameData.currentGame.status !== GAME_STATES.COMPLETED,
    [gameData]
  );

  const canResolve = useMemo(() => 
    isGameActive && gameData.currentGame.status === GAME_STATES.WAITING_FOR_RESULT,
    [isGameActive, gameData]
  );

  // Handlers
  const handleBetAmountChange = (value) => {
    try {
      if (value) {
        validateBetAmount(value, balance);
      }
      setBetAmount(value);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePlay = async (number) => {
    if (!canPlay) return;
    
    try {
      // Check and get approval if needed
      const hasCurrentApproval = await checkAllowance(betAmount);
      if (!hasCurrentApproval) {
        await approveTokens(betAmount);
      }
      
      await playDice(number, betAmount);
      setSelectedNumber(number);
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    }
  };

  const handleResolve = async () => {
    if (!canResolve) return;
    
    try {
      await resolveGame();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    }
  };

  if (error) {
    return <ErrorHandler error={error} />;
  }

  return (
    <GameContainer>
      <MainSection>
        <GameHeader>
          <h1>Roll the Dice</h1>
          <p>Select a number, place your bet, and test your luck!</p>
        </GameHeader>

        <NumberSelector
          selectedNumber={selectedNumber}
          onSelect={handlePlay}
          disabled={!canPlay || isGameActive}
        />

        <AnimatePresence mode="wait">
          {isGameActive && (
            <GameProgress 
              gameState={gameData.currentGame.status}
              requestDetails={gameData.requestDetails}
            />
          )}
        </AnimatePresence>

        <DiceRoll
          rolling={isLoading}
          result={gameData?.currentGame?.rolledNumber}
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
            disabled={isLoading || isApproving || isGameActive}
          />

          {canResolve && (
            <Button 
              onClick={handleResolve}
              disabled={isLoading}
              $variant="primary"
              $fullWidth
            >
              {isLoading ? "Resolving..." : "Resolve Game"}
            </Button>
          )}
        </GameControls>
      </MainSection>

      <SideSection>
        <StatsContainer>
          <GameStats stats={gameData?.playerStats} />
        </StatsContainer>

        <StatsContainer>
          <GameResults results={gameData?.previousBets} />
        </StatsContainer>
      </SideSection>
    </GameContainer>
  );
}
