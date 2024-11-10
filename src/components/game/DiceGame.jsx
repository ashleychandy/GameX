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
    gameState,
    currentGame,
    playerStats,
    previousBets,
    requestDetails,
    isLoading,
    playDice,
    resolveGame,
    refreshGameData
  } = useGame();

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
      
      // Validate bet amount
      if (amount < GAME_CONFIG.MIN_BET || amount > GAME_CONFIG.MAX_BET) {
        toast.error('Invalid bet amount');
        return;
      }

      // Check approval first
      const approved = await checkAndApprove(amount);
      if (!approved) return;

      await playDice(selectedNumber, amount);
      
      setSelectedNumber(null);
      setBetAmount('');
      
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const canPlaceBet = !currentGame?.isActive && 
                      selectedNumber >= GAME_CONFIG.MIN_NUMBER && 
                      selectedNumber <= GAME_CONFIG.MAX_NUMBER &&
                      betAmount && 
                      !isPlacingBet && 
                      !isApproving;

  const canResolveGame = currentGame?.isActive && 
                        gameState === GAME_STATES.READY_TO_RESOLVE;

  // Calculate potential winnings
  const potentialWinnings = betAmount ? 
    (parseFloat(betAmount) * GAME_CONFIG.PAYOUT_MULTIPLIER).toFixed(2) : 
    "0.00";

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
          disabled={currentGame?.isActive || isPlacingBet}
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
            disabled={currentGame?.isActive || isPlacingBet}
            min={ethers.formatEther(GAME_CONFIG.MIN_BET)}
            max={ethers.formatEther(GAME_CONFIG.MAX_BET)}
          />

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
        <GameStats 
          stats={playerStats}
          currentGame={currentGame}
        />
        <GameResults 
          results={previousBets}
          currentGame={currentGame}
        />
      </SideSection>

      {(isLoading || isPlacingBet || isApproving) && (
        <Loading />
      )}
    </GameContainer>
  );
}