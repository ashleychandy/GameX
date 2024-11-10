import React, { useState, useEffect } from "react";
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
  const { isApproving, checkAndApprove } = useTokenApproval();
  const {
    placeBet,
    isLoading,
    gameResult,
    gameStats,
    recentResults
  } = useGame();

  const handleBet = async () => {
    if (!selectedNumber || !betAmount) {
      toast.error("Please select a number and enter bet amount");
      return;
    }

    // Check approval first
    const approved = await checkAndApprove(betAmount);
    if (!approved) return;

    // Place bet
    await placeBet(selectedNumber, betAmount);
  };

  const potentialWinnings = betAmount ? (parseFloat(betAmount) * 6).toFixed(2) : "0.00";

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
          disabled={isLoading || isApproving}
        />

        <DiceRoll
          rolling={isLoading}
          result={gameResult?.number}
          won={gameResult?.won}
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
            onChange={setBetAmount}
            max={balance}
            disabled={isLoading || isApproving}
          />

          <Button
            $variant="primary"
            $fullWidth
            disabled={!selectedNumber || !betAmount || isLoading || isApproving}
            onClick={handleBet}
          >
            {isApproving ? "Approving..." : isLoading ? "Rolling..." : "Roll Dice"}
          </Button>
        </GameControls>
      </MainSection>

      <SideSection>
        <GameStats stats={gameStats} />
        <GameResults results={recentResults} />
      </SideSection>

      <AnimatePresence>
        {(isLoading || isApproving) && <Loading />}
      </AnimatePresence>
    </GameContainer>
  );
} 