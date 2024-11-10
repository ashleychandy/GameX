import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';
import { contracts } from '../config';

export function useGameStats() {
  const { diceContract, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentRolls, setRecentRolls] = useState([]);

  const fetchStats = useCallback(async () => {
    if (!diceContract || !address) return;
    try {
      setIsLoading(true);
      const [gameStats, playerStats, lastRolls] = await Promise.all([
        diceContract.getGameStats(),
        diceContract.getUserStats(address),
        diceContract.getPlayerLastNRolls(address, 10)
      ]);

      setStats(gameStats);
      setUserStats(playerStats);
      setRecentRolls(lastRolls);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [diceContract, address]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    isLoading,
    stats,
    userStats,
    recentRolls,
    refreshStats: fetchStats
  };
} 