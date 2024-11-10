import { useState, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { validateGameState, formatBetHistory } from '../utils/contractHelpers';
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

      const [userData, gameState, requestDetails] = await Promise.all([
        contract.getUserData(address),
        contract.getCurrentGame(address),
        contract.getCurrentRequestDetails(address)
      ]);

      return {
        currentGame: validateGameState(gameState),
        totalGames: userData.totalGames.toString(),
        totalBets: userData.totalBets.toString(),
        totalWinnings: userData.totalWinnings.toString(),
        totalLosses: userData.totalLosses.toString(),
        lastPlayed: userData.lastPlayed.toString(),
        requestId: requestDetails.requestId.toString(),
        requestFulfilled: requestDetails.requestFulfilled,
        requestActive: requestDetails.requestActive
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  const fetchGameHistory = useCallback(async (offset = 0, limit = GAME_CONFIG.HISTORY_LIMIT) => {
    if (!contract || !address) return { bets: [], total: 0 };

    try {
      setIsLoading(true);
      const { bets, total } = await contract.getPaginatedBets(address, offset, limit);
      return {
        bets: bets.map(formatBetHistory),
        total: total.toNumber()
      };
    } catch (err) {
      setError(err.message);
      return { bets: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  return {
    fetchGameData,
    fetchGameHistory,
    isLoading,
    error
  };
} 