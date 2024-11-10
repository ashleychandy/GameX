import { useState, useRef, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';

export function useGameData() {
  const { address } = useWallet();
  const { contract } = useContract('dice');
  const cache = useRef(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchGameData = useCallback(async (gameId) => {
    if (!contract || !address) return null;

    // Check cache first
    const cachedData = cache.current.get(gameId);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch game data from contract
      const data = await contract.getGameDetails(gameId);
      
      // Process and format the data
      const formattedData = {
        id: gameId,
        chosenNumber: data.chosenNumber.toString(),
        result: data.result.toString(),
        amount: data.amount.toString(),
        timestamp: data.timestamp.toString(),
        status: data.status
      };

      // Update cache
      cache.current.set(gameId, {
        data: formattedData,
        timestamp: Date.now()
      });

      return formattedData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  const invalidateCache = useCallback((gameId) => {
    if (gameId) {
      cache.current.delete(gameId);
    } else {
      cache.current.clear();
    }
  }, []);

  return {
    fetchGameData,
    invalidateCache,
    isLoading,
    error
  };
} 