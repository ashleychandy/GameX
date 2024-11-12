import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';

export function useGameState() {
  const { contracts, address } = useWallet();
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGameState = useCallback(async () => {
    if (!contracts.dice || !address) {
      setGameState(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [currentGame, userData, previousBets] = await Promise.all([
        contracts.dice.getCurrentGame(address),
        contracts.dice.getUserData(address),
        contracts.dice.getPreviousBets(address)
      ]);

      setGameState({
        currentGame,
        userData,
        previousBets,
        isActive: currentGame.isActive
      });
    } catch (error) {
      console.error('Failed to fetch game state:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [contracts.dice, address]);

  // Fetch initial state
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  // Setup event listeners
  useEffect(() => {
    if (!contracts.dice || !address) return;

    const filters = [
      contracts.dice.filters.GameStarted(address),
      contracts.dice.filters.GameResolved(address)
    ];

    filters.forEach(filter => {
      contracts.dice.on(filter, fetchGameState);
    });

    return () => {
      filters.forEach(filter => {
        contracts.dice.off(filter, fetchGameState);
      });
    };
  }, [contracts.dice, address, fetchGameState]);

  return {
    gameState,
    isLoading,
    error,
    refreshGameState: fetchGameState
  };
} 