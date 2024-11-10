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
import { PAYOUT_MULTIPLIER } from "../../constants";

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
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const { address, balance } = useWallet();
  const { isApproving, checkAndApprove } = useTokenApproval();
  const { 
    isLoading,
    gameState,
    currentGame,
    gameStats,
    playDice,
    resolveGame,
    fetchGameState
  } = useGame();

  const potentialWinnings = betAmount ? 
    (parseFloat(betAmount) * PAYOUT_MULTIPLIER).toFixed(2) : "0.00";

  const handlePlaceBet = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!selectedNumber || !betAmount) {
      toast.error('Please select a number and enter bet amount');
      return;
    }

    try {
      setIsPlacingBet(true);
      const amount = ethers.parseEther(betAmount);
      
      const approved = await checkAndApprove(amount);
      if (!approved) return;

      await playDice(selectedNumber, amount);
      toast.success('Bet placed successfully!');
      
      setSelectedNumber(null);
      setBetAmount('');
      
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleResolveGame = async () => {
    try {
      await resolveGame();
      toast.success('Game resolved successfully!');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchGameState, 10000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  if (!address) {
    return (
      <GameContainer>
        <MainSection>
          <GameHeader>
            <h1>Connect Wallet</h1>
            <p>Please connect your wallet to play the game</p>
          </GameHeader>
        </MainSection>
      </GameContainer>
    );
  }

  if (isLoading && !currentGame) {
    return <Loading />;
  }

  return (
    <GameContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <MainSection>
        <GameHeader>
          <h1>Roll the Dice</h1>
          <p>Select a number, place your bet, and test your luck!</p>
        </GameHeader>

        <NumberSelector 
          selectedNumber={selectedNumber}
          onSelect={setSelectedNumber}
          disabled={isPlacingBet || currentGame?.isActive}
        />

        <DiceRoll
          rolling={isPlacingBet || false}
          number={currentGame?.result || selectedNumber || 1}
          won={currentGame?.status === 'WON'}
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
            disabled={isPlacingBet || currentGame?.isActive}
            max={balance}
          />

          <Button
            $variant="primary"
            $fullWidth
            onClick={handlePlaceBet}
            disabled={!selectedNumber || !betAmount || isPlacingBet || isApproving || currentGame?.isActive}
          >
            {isPlacingBet ? 'Placing Bet...' : 
             isApproving ? 'Approving...' : 
             'Place Bet'}
          </Button>
          
          {currentGame?.isActive && currentGame?.status === 'READY_TO_RESOLVE' && (
            <Button
              $variant="secondary"
              $fullWidth
              onClick={handleResolveGame}
            >
              Resolve Game
            </Button>
          )}
          
          <GameProgress gameState={gameState} />
        </GameControls>
      </MainSection>

      <SideSection>
        <GameStats stats={gameStats} />
        <GameResults />
      </SideSection>
    </GameContainer>
  );
}

export default DiceGame;
