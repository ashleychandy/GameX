import { useState, useEffect } from 'react';
import { useContract } from './useContract';
import { formatAmount } from '@/utils/helpers';

export function useProfile(address) {
  const { contract } = useContract('dice');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!contract || !address) return;

      try {
        setIsLoading(true);
        const [stats, history] = await Promise.all([
          contract.getPlayerStats(address),
          contract.getPreviousBets(address)
        ]);

        setData({
          stats: {
            winRate: formatAmount(stats.winRate),
            totalGames: stats.totalGames.toString(),
            totalWinnings: formatAmount(stats.totalWinnings)
          },
          history: history.map(bet => ({
            chosenNumber: bet.chosenNumber.toString(),
            amount: formatAmount(bet.amount),
            timestamp: bet.timestamp.toString(),
            won: bet.won
          }))
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [contract, address]);

  return { data, isLoading, error };
} 