import { useState, useCallback, useEffect } from 'react';
import { useWallet } from './useWallet';
import { useContract } from './useContract';
import { formatAmount } from '@/utils/helpers';
import { toast } from 'react-toastify';
import { GAME_STATES } from '@/utils/constants';

export function useGame() {
  const { address } = useWallet();
  const { contract: diceContract } = useContract('dice');
  const [gameData, setGameData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateGameState = useCallback(async () => {
    if (!diceContract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const [currentGame, stats, betsHistory] = await Promise.all([
        diceContract.getCurrentGame(address),
        diceContract.getPlayerStats(address),
        diceContract.getPreviousBets(address)
      ]);

      setGameData({
        isActive: currentGame.isActive,
        chosenNumber: currentGame.chosenNumber.toString(),
        amount: formatAmount(currentGame.amount),
        status: currentGame.status,
        payout: formatAmount(currentGame.payout)
      });

      setUserStats({
        winRate: formatAmount(stats.winRate),
        totalGamesPlayed: stats.totalGames.toString(),
        totalWinnings: formatAmount(stats.totalWinnings)
      });

      setHistory(betsHistory.map(bet => ({
        chosenNumber: bet.chosenNumber.toString(),
        amount: formatAmount(bet.amount),
        timestamp: bet.timestamp.toString(),
        won: bet.won
      })));

    } catch (err) {
      setError(err.message);
      toast.error('Failed to update game state');
    } finally {
      setIsLoading(false);
    }
  }, [diceContract, address]);

  const placeBet = useCallback(async (number, amount) => {
    if (!diceContract || !address) return;

    try {
      setIsLoading(true);
      const tx = await diceContract.placeBet(number, { value: amount });
      await tx.wait();
      toast.success('Bet placed successfully!');
      await updateGameState();
    } catch (err) {
      toast.error('Failed to place bet');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [diceContract, address, updateGameState]);

  useEffect(() => {
    if (diceContract && address) {
      updateGameState();
    }
  }, [diceContract, address]);

  return {
    gameData,
    userStats,
    history,
    isLoading,
    error,
    placeBet,
    updateGameState
  };
} 