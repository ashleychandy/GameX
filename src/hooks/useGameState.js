import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { validateGameData } from '../utils/validation';
import { getContractEvents } from '../utils/contractInteraction';
import { GAME_STATUS, POLLING_INTERVAL } from '../utils/constants';

export function useGameState() {
  const { diceContract, address } = useWallet();
  const [gameState, setGameState] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGameState = useCallback(async () => {
    if (!diceContract || !address) return;

    try {
      const data = await diceContract.getGameState(address);
      const validatedData = validateGameData(data);
      setGameState(validatedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching game state:', error);
      setError(error.message);
    }
  }, [diceContract, address]);

  const fetchGameHistory = useCallback(async () => {
    if (!diceContract || !address) return;

    try {
      const events = await getContractEvents(
        diceContract,
        'GameCompleted',
        { player: address },
        -1000 // Last 1000 blocks
      );

      setGameHistory(events);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  }, [diceContract, address]);

  // Setup polling for active games
  useEffect(() => {
    if (!gameState?.currentGame.isActive) return;

    const interval = setInterval(fetchGameState, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [gameState?.currentGame.isActive, fetchGameState]);

  // Listen for game events
  useEffect(() => {
    if (!diceContract || !address) return;

    const gameStartedFilter = diceContract.filters.GameStarted(address);
    const gameCompletedFilter = diceContract.filters.GameCompleted(address);

    const handleGameEvent = () => {
      fetchGameState();
      fetchGameHistory();
    };

    diceContract.on(gameStartedFilter, handleGameEvent);
    diceContract.on(gameCompletedFilter, handleGameEvent);

    return () => {
      diceContract.off(gameStartedFilter, handleGameEvent);
      diceContract.off(gameCompletedFilter, handleGameEvent);
    };
  }, [diceContract, address, fetchGameState, fetchGameHistory]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchGameState(), fetchGameHistory()])
      .finally(() => setIsLoading(false));
  }, [fetchGameState, fetchGameHistory]);

  return {
    gameState,
    gameHistory,
    isLoading,
    error,
    refreshState: fetchGameState,
    refreshHistory: fetchGameHistory
  };
} 