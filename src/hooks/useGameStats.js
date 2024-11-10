import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { handleError } from '../utils/errorHandling';

export function useGameStats() {
  const { address } = useWallet();
  const { contract } = useContract('dice');
  
  const [stats, setStats] = useState({
    gameStats: null,
    userStats: null,
    recentRolls: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!contract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const [gameStats, playerStats, lastRolls] = await Promise.all([
        contract.getPlayerStats(address),
        contract.getCurrentGame(address),
        contract.getPreviousBets(address)
      ]);

      setStats({
        gameStats: {
          winRate: gameStats.winRate.toString(),
          averageBet: gameStats.averageBet.toString(),
          totalGamesWon: gameStats.totalGamesWon.toString(),
          totalGamesLost: gameStats.totalGamesLost.toString()
        },
        userStats: {
          isActive: playerStats.isActive,
          chosenNumber: playerStats.chosenNumber.toString(),
          amount: playerStats.amount.toString(),
          status: playerStats.status
        },
        recentRolls: lastRolls.map(roll => ({
          chosenNumber: roll.chosenNumber.toString(),
          rolledNumber: roll.rolledNumber.toString(),
          amount: roll.amount.toString(),
          timestamp: roll.timestamp.toString()
        }))
      });
    } catch (err) {
      const { message } = handleError(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    isLoading,
    error,
    refreshStats: fetchStats
  };
} 