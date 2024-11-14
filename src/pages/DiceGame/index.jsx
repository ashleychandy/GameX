import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useGame } from '@/hooks/useGame';
import { formatAmount } from '@/utils/helpers';
import { config } from '@/config';
import { Button } from '@/components/common/Button';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { WalletPrompt } from '@/components/common/WalletPrompt';
import { toast } from 'react-toastify';

const PageContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const GameSection = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatItem = styled.div`
  background: ${({ theme }) => theme.surface2};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.text.secondary};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const DiceButton = styled(motion.button)`
  aspect-ratio: 1;
  background: ${({ theme, $selected }) => 
    $selected ? theme.primary : theme.surface2};
  color: ${({ theme, $selected }) => 
    $selected ? 'white' : theme.text.primary};
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.primary : 'transparent'};
  border-radius: 12px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const BetInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface2};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1.1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const QuickAmount = styled(Button)`
  flex: 1;
  min-width: 100px;
`;

const HistorySection = styled.div`
  margin-top: 2rem;
`;

const HistoryItem = styled.div`
  background: ${({ theme }) => theme.surface2};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    color: ${({ theme, $won }) => 
      $won ? theme.success : theme.text.primary};
  }
`;

export function DicePage() {
  const { isConnected, address } = useWallet();
  const { 
    gameData,
    gameStats,
    placeBet,
    resolveGame,
    isLoading,
    pendingTx,
    error,
    checkAllowance,
    approveTokens 
  } = useGame();

  const [selectedNumber, setSelectedNumber] = useState(1);
  const [betAmount, setBetAmount] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const quickAmounts = [10, 50, 100, 500];

  useEffect(() => {
    const checkApproval = async () => {
      if (!betAmount || !isConnected) return;
      try {
        const allowance = await checkAllowance();
        setNeedsApproval(parseFloat(betAmount) > parseFloat(allowance));
      } catch (err) {
        console.error('Error checking allowance:', err);
      }
    };
    checkApproval();
  }, [betAmount, isConnected, checkAllowance]);

  const handleQuickAmount = (amount) => {
    setBetAmount(amount.toString());
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveTokens(betAmount);
      setNeedsApproval(false);
      toast.success('Token approval successful!');
    } catch (err) {
      console.error('Approval error:', err);
      toast.error(err.message || 'Failed to approve tokens');
    } finally {
      setIsApproving(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    try {
      setIsRolling(true);
      await placeBet(selectedNumber, betAmount);
      setBetAmount('');
    } catch (err) {
      console.error('Bet error:', err);
      toast.error(err.message || 'Failed to place bet');
    } finally {
      setIsRolling(false);
    }
  };

  const handleResolveGame = async () => {
    try {
      await resolveGame();
      toast.success('Game resolved!');
    } catch (err) {
      console.error('Resolve error:', err);
      toast.error(err.message || 'Failed to resolve game');
    }
  };

  if (!isConnected) {
    return <WalletPrompt />;
  }

  return (
    <PageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Title>Dice Game</Title>

      <GameSection>
        <StatsGrid>
          <StatItem>
            <h3>Games Played</h3>
            <p>{gameStats?.gamesPlayed || 0}</p>
          </StatItem>
          <StatItem>
            <h3>Win Rate</h3>
            <p>{gameStats?.winRate ? (gameStats.winRate / 100).toFixed(2) : 0}%</p>
          </StatItem>
          <StatItem>
            <h3>Total Winnings</h3>
            <p>{formatAmount(gameStats?.totalWinnings || 0)} DICE</p>
          </StatItem>
        </StatsGrid>

        <GameControls>
          <DiceGrid>
            {[1, 2, 3, 4, 5, 6].map((number) => (
              <DiceButton
                key={number}
                $selected={selectedNumber === number}
                onClick={() => setSelectedNumber(number)}
                disabled={isRolling || pendingTx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {number}
              </DiceButton>
            ))}
          </DiceGrid>

          <BetInput
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter bet amount"
            disabled={isRolling || pendingTx}
          />

          <QuickAmounts>
            {quickAmounts.map((amount) => (
              <QuickAmount
                key={amount}
                variant="secondary"
                onClick={() => handleQuickAmount(amount)}
                disabled={isRolling || pendingTx}
              >
                {amount} DICE
              </QuickAmount>
            ))}
          </QuickAmounts>

          {needsApproval ? (
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isApproving || !betAmount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isApproving ? 'Approving...' : 'Approve DICE'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handlePlaceBet}
              disabled={isRolling || pendingTx || !betAmount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRolling ? 'Rolling...' : pendingTx ? 'Waiting...' : 'Roll Dice'}
            </Button>
          )}

          {gameData?.currentGame?.isActive && gameData.currentGame.status === 'STARTED' && (
            <Button
              variant="secondary"
              onClick={handleResolveGame}
              disabled={isRolling || pendingTx}
            >
              Resolve Game
            </Button>
          )}
        </GameControls>
      </GameSection>

      <HistorySection>
        <Title>Game History</Title>
        {gameData?.previousBets?.map((game, index) => (
          <HistoryItem
            key={`${game.timestamp}-${index}`}
            $won={game.chosenNumber === game.rolledNumber}
          >
            <span>
              Rolled: {game.rolledNumber} | 
              Chosen: {game.chosenNumber} | 
              Amount: {formatAmount(game.amount)} DICE
            </span>
            <span>
              {game.chosenNumber === game.rolledNumber ? 'Won!' : 'Lost'}
            </span>
          </HistoryItem>
        ))}
      </HistorySection>

      {(isLoading || pendingTx) && (
        <LoadingOverlay 
          message={pendingTx ? 'Waiting for transaction...' : 'Loading...'}
        />
      )}
    </PageContainer>
  );
} 