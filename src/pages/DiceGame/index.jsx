import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/common/Button';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { DICE_GAME_ABI } from '@/contracts/abis';
import { formatAmount } from '@/utils/helpers';
import { Loading } from '@/components/common/Loading';

const DiceContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const GameSection = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.md};
  margin-bottom: 2rem;
`;

const BetControls = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const NumberButton = styled(motion.button)`
  padding: 1rem;
  border: 2px solid ${({ theme, selected }) => 
    selected ? theme.primary : theme.border};
  border-radius: 0.5rem;
  background: ${({ theme, selected }) => 
    selected ? `${theme.primary}20` : 'transparent'};
  color: ${({ theme }) => theme.text.primary};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultDisplay = styled(motion.div)`
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 1rem;
  background: ${({ theme, won }) => 
    won ? `${theme.success}20` : `${theme.error}20`};
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const DicePage = () => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [gameStats, setGameStats] = useState({
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
  });
  const { provider, address, balance, chainId } = useWallet();
  const [contract, setContract] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize contract
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      if (provider && address) {
        const diceGameAddress = import.meta.env.VITE_DICE_GAME_ADDRESS;
        const contract = new ethers.Contract(
          diceGameAddress,
          DICE_GAME_ABI,
          provider.getSigner()
        );
        setContract(contract);
      }
      setIsInitializing(false);
    };
    init();
  }, [provider, address]);

  if (isInitializing) return <Loading />;

  // Load game stats
  useEffect(() => {
    const loadStats = async () => {
      if (contract && address) {
        try {
          const [totalBets, totalWins] = await Promise.all([
            contract.playerTotalBets(address),
            contract.playerTotalWins(address),
          ]);
          
          setGameStats({
            totalBets: totalBets.toNumber(),
            totalWins: totalWins.toNumber(),
            totalLosses: totalBets.toNumber() - totalWins.toNumber(),
          });
        } catch (error) {
          console.error('Error loading stats:', error);
        }
      }
    };

    loadStats();
  }, [contract, address]);

  // Handle bet placement
  const handleBet = async () => {
    if (!betAmount || !selectedNumber || !contract) {
      toast.error('Please select a number and enter bet amount');
      return;
    }

    try {
      setIsRolling(true);
      const betAmountWei = ethers.utils.parseEther(betAmount);
      
      // Check allowance and approve if needed
      const tokenContract = new ethers.Contract(
        import.meta.env.VITE_TOKEN_ADDRESS,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        provider.getSigner()
      );

      const allowance = await tokenContract.allowance(address, contract.address);
      if (allowance.lt(betAmountWei)) {
        const tx = await tokenContract.approve(contract.address, betAmountWei);
        await tx.wait();
      }

      // Place bet
      const tx = await contract.placeBet(selectedNumber, betAmountWei, {
        gasLimit: 500000,
      });

      toast.info('Rolling the dice...');
      
      // Wait for transaction and get result
      const receipt = await tx.wait();
      const betEvent = receipt.events?.find(e => e.event === 'BetPlaced');
      const resultEvent = receipt.events?.find(e => e.event === 'GameResult');
      
      if (resultEvent) {
        const [playerWon, rolledNumber] = resultEvent.args;
        setResult({
          won: playerWon,
          number: rolledNumber.toNumber(),
          amount: betAmount,
        });

        toast.success(
          playerWon 
            ? `You won! Rolled number: ${rolledNumber}` 
            : `Better luck next time! Rolled number: ${rolledNumber}`
        );

        // Update stats
        setGameStats(prev => ({
          totalBets: prev.totalBets + 1,
          totalWins: prev.totalWins + (playerWon ? 1 : 0),
          totalLosses: prev.totalLosses + (playerWon ? 0 : 1),
        }));
      }
    } catch (error) {
      console.error('Bet error:', error);
      toast.error(error.message || 'Error placing bet');
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <DiceContainer>
      <GameSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Dice Game</h1>
        
        <StatsSection>
          <StatCard>
            <h3>Total Bets</h3>
            <p>{gameStats.totalBets}</p>
          </StatCard>
          <StatCard>
            <h3>Total Wins</h3>
            <p>{gameStats.totalWins}</p>
          </StatCard>
          <StatCard>
            <h3>Win Rate</h3>
            <p>
              {gameStats.totalBets > 0
                ? ((gameStats.totalWins / gameStats.totalBets) * 100).toFixed(1)
                : 0}
              %
            </p>
          </StatCard>
        </StatsSection>

        <BetControls>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter bet amount"
            disabled={isRolling}
          />
          <Button 
            onClick={handleBet} 
            disabled={!betAmount || !selectedNumber || isRolling}
            loading={isRolling}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Button>
        </BetControls>

        <NumberGrid>
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <NumberButton
              key={number}
              selected={selectedNumber === number}
              onClick={() => setSelectedNumber(number)}
              disabled={isRolling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {number}
            </NumberButton>
          ))}
        </NumberGrid>

        <AnimatePresence>
          {result && (
            <ResultDisplay
              won={result.won}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2>{result.won ? 'You Won!' : 'You Lost'}</h2>
              <p>Rolled Number: {result.number}</p>
              <p>Bet Amount: {formatAmount(result.amount)} GameX</p>
            </ResultDisplay>
          )}
        </AnimatePresence>
      </GameSection>
    </DiceContainer>
  );
};

export default DicePage; 