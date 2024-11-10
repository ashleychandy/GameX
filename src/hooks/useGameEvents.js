import { useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { formatAmount } from '../utils/format';
import { parseGameStatus } from '../utils/contractHelpers';

export function useGameEvents(onGameUpdate) {
  const { contract: dice, address } = useWallet();

  const setupEventListeners = useCallback(() => {
    if (!dice || !address) return;

    // Game Started Event
    const gameStartedFilter = dice.filters.GameStarted(address);
    const handleGameStarted = (player, requestId, chosenNumber, amount, timestamp) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.info(
          `Bet placed: ${chosenNumber} for ${formatAmount(amount)} tokens`
        );
        onGameUpdate?.();
      }
    };

    // Game Resolved Event
    const gameResolvedFilter = dice.filters.GameResolved(address);
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
    const gameCancelledFilter = dice.filters.GameCancelled(address);
    const handleGameCancelled = (player, requestId, reason) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.error(`Game cancelled: ${reason}`);
        onGameUpdate?.();
      }
    };

    // Set up listeners
    dice.on(gameStartedFilter, handleGameStarted);
    dice.on(gameResolvedFilter, handleGameResolved);
    dice.on(gameCancelledFilter, handleGameCancelled);

    // Cleanup function
    return () => {
      dice.off(gameStartedFilter, handleGameStarted);
      dice.off(gameResolvedFilter, handleGameResolved);
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