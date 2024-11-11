import { useState, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { validateGameState } from '../utils/contractHelpers';
import { GAME_CONFIG } from '../utils/constants';

export function useGameData() {
  const { address } = useWallet();
  const { contract } = useContract('dice');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGameData = useCallback(async () => {
    if (!contract || !address) return null;

    try {
      setIsLoading(true);
      setError(null);

      const [currentGame, canStart, playerStats] = await Promise.all([
        contract.getCurrentGame(address),
        contract.canStartNewGame(address),
        contract.getPlayerStats(address)
      ]);

      return {
        currentGame: validateGameState(currentGame),
        canStartNewGame: canStart,
        stats: {
          totalGames: playerStats.gamesPlayed.toString(),
          totalWins: playerStats.gamesWon.toString(),
          totalBets: playerStats.totalBets.toString(),
          totalWinnings: playerStats.totalWinnings.toString(),
          winRate: (playerStats.gamesWon / playerStats.gamesPlayed * 100).toFixed(2)
        }
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  return {
    fetchGameData,
    isLoading,
    error
  };
} 