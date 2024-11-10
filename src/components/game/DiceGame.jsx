import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
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
  const { gameData, playDice, resolveGame, isLoading, error } = useGame();
  const { hasApproval, approveTokens, isApproving } = useTokenApproval();

  const quickAmounts = [10, 50, 100, 500];

  const handleQuickAmount = (amount) => {
    setBetAmount(amount.toString());
  };

  const handlePlay = async (number, amount) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      if (!hasApproval) {
        await approveTokens(amount);
      }
      await playDice(number, amount);
    } catch (error) {
      toast.error(formatErrorMessage(error));
    }
  };

  const handleResolve = async () => {
    try {
      await resolveGame();
    } catch (error) {
      toast.error(formatErrorMessage(error));
    }
  };

  // Add check for pending VRF request
  const canResolve = gameData?.currentGame?.isActive && 
                    gameData?.requestDetails?.requestFulfilled;

  const potentialWinnings = gameData?.currentGame?.amount ? (parseFloat(gameData.currentGame.amount) * 6).toFixed(2) : "0.00";

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
          selectedNumber={gameData?.currentGame?.chosenNumber}
          onSelect={handlePlay}
          disabled={isLoading || isApproving}
        />

        <AnimatePresence mode="wait">
          {gameData?.currentGame?.isActive && (
            <GameProgress game={gameData.currentGame} />
          )}
        </AnimatePresence>

        <DiceRoll
          rolling={isLoading}
          result={gameData?.currentGame?.result}
          won={gameData?.currentGame?.result > 0}
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

          <QuickAmounts>
            {quickAmounts.map(amount => (
              <QuickAmount
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                disabled={isLoading || isApproving}
              >
                {amount} DICE
              </QuickAmount>
            ))}
          </QuickAmounts>

          <AmountInput
            value={gameData?.currentGame?.amount}
            onChange={handlePlay}
            max={balance}
            disabled={isLoading || isApproving}
          />

          <Button
            $variant="primary"
            $fullWidth
            disabled={!gameData?.currentGame?.chosenNumber || !gameData?.currentGame?.amount || isLoading || isApproving}
            onClick={handlePlay}
          >
            {isApproving ? "Approving..." : isLoading ? "Rolling..." : "Roll Dice"}
          </Button>

          <Button 
            onClick={handleResolve}
            disabled={!canResolve || isLoading}
          >
            Resolve Game
          </Button>
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
