import { useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { formatAmount } from '../utils/format';
import { GAME_EVENTS } from '../utils/events';

export function useGameEvents(onGameUpdate) {
  const { contract: dice, address } = useWallet();

  const setupEventListeners = useCallback(() => {
    if (!dice || !address) return;

    const gameStartedFilter = dice.filters.GameStarted(address);
    const gameCompletedFilter = dice.filters.GameCompleted(address);
    const gameCancelledFilter = dice.filters.GameCancelled(address);

    // Game Started Event
    const handleGameStarted = (player, requestId, chosenNumber, amount, timestamp) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.info(
          `Bet placed: ${chosenNumber} for ${formatAmount(amount)} tokens`
        );
        onGameUpdate?.();
      }
    };

    // Game Resolved Event
    const handleGameResolved = (
      player, 
      requestId, 
      chosenNumber, 
      rolledNumber, 
      amount, 
      payout, 
      status,
      timestamp
    ) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        const statusText = parseGameStatus(status);
        const message = payout > 0
          ? `You won ${formatAmount(payout)} tokens!`
          : 'Better luck next time!';
        
        toast[payout > 0 ? 'success' : 'info'](message);
        onGameUpdate?.();
      }
    };

    // Game Cancelled Event
    const handleGameCancelled = (player, requestId, reason) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.error(`Game cancelled: ${reason}`);
        onGameUpdate?.();
      }
    };

    // Set up listeners
    dice.on(gameStartedFilter, handleGameStarted);
    dice.on(gameCompletedFilter, handleGameResolved);
    dice.on(gameCancelledFilter, handleGameCancelled);

    // Cleanup function
    return () => {
      dice.off(gameStartedFilter, handleGameStarted);
      dice.off(gameCompletedFilter, handleGameResolved);
      dice.off(gameCancelledFilter, handleGameCancelled);
    };
  }, [dice, address, onGameUpdate]);

  useEffect(() => {
    const cleanup = setupEventListeners();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupEventListeners]);
} 