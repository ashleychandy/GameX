import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { DICE_GAME_ABI } from '@/contracts/abis';
import { toast } from 'react-toastify';
import { config } from '@/config';

export function useGame() {
  const { provider, address } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [gameStats, setGameStats] = useState({
    totalBets: 0,
    winRate: 0,
    averageBet: 0,
    gamesWon: 0,
    gamesLost: 0
  });
  const [betHistory, setBetHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const diceContract = useCallback(() => {
    if (!provider || !address) return null;
    return new ethers.Contract(
      config.contracts.dice,
      DICE_GAME_ABI,
      provider.getSigner()
    );
  }, [provider, address]);

  // Fetch game data
  const fetchGameData = useCallback(async () => {
    if (!diceContract() || !address) return;

    try {
      const [currentGame, requestDetails, stats, history] = await Promise.all([
        diceContract().getCurrentGame(address),
        diceContract().getCurrentRequestDetails(address),
        diceContract().getPlayerStats(address),
        diceContract().getPreviousBets(address)
      ]);

      setGameData({
        isActive: currentGame.isActive,
        chosenNumber: currentGame.chosenNumber.toNumber(),
        result: currentGame.result.toNumber(),
        amount: ethers.utils.formatEther(currentGame.amount),
        timestamp: currentGame.timestamp.toNumber(),
        payout: ethers.utils.formatEther(currentGame.payout),
        status: currentGame.status,
        requestId: requestDetails.requestId.toNumber(),
        requestFulfilled: requestDetails.requestFulfilled,
        requestActive: requestDetails.requestActive
      });

      setGameStats({
        winRate: stats.winRate.toNumber() / 100, // Convert from basis points
        averageBet: ethers.utils.formatEther(stats.averageBet),
        gamesWon: stats.gamesWon.toNumber(),
        gamesLost: stats.gamesLost.toNumber()
      });

      setBetHistory(history.map(bet => ({
        chosenNumber: bet.chosenNumber.toNumber(),
        rolledNumber: bet.rolledNumber.toNumber(),
        amount: ethers.utils.formatEther(bet.amount),
        timestamp: bet.timestamp.toNumber()
      })));

    } catch (err) {
      console.error('Error fetching game data:', err);
      setError('Failed to fetch game data');
    }
  }, [diceContract, address]);

  // Place bet
  const placeBet = useCallback(async (number, amount) => {
    if (!diceContract()) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const canStart = await diceContract().canStartNewGame(address);
      if (!canStart) {
        throw new Error('Cannot start new game. Previous game might be in progress.');
      }

      // First approve tokens
      const tokenContract = new ethers.Contract(
        config.contracts.token,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        provider.getSigner()
      );

      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Check allowance
      const allowance = await tokenContract.allowance(address, config.contracts.dice);
      if (allowance.lt(amountWei)) {
        const approveTx = await tokenContract.approve(config.contracts.dice, amountWei);
        await approveTx.wait();
      }

      // Place bet
      const tx = await diceContract().placeBet(number, amountWei, {
        gasLimit: config.chainLink.callbackGasLimit,
      });
      
      const receipt = await tx.wait();
      
      // Fetch updated game data
      await fetchGameData();
      
      toast.success('Bet placed successfully!');
      return receipt;
    } catch (err) {
      console.error('Place bet error:', err);
      setError(err.message);
      toast.error('Failed to place bet');
    } finally {
      setIsLoading(false);
    }
  }, [diceContract, provider, address, fetchGameData]);

  // Initial data fetch
  useEffect(() => {
    if (diceContract() && address) {
      fetchGameData();
    }
  }, [diceContract, address, fetchGameData]);

  return {
    gameData,
    gameStats,
    betHistory,
    isLoading,
    error,
    placeBet,
    refreshGameState: fetchGameData
  };
} 