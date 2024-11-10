import { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { formatAmount } from '../utils/helpers';

export function useGameEvents(onGameUpdate) {
  const { diceContract, address } = useWallet();

  const handleGameStarted = useCallback((player, number, amount, timestamp, event) => {
    if (player.toLowerCase() === address?.toLowerCase()) {
      toast.info(
        `Bet placed: ${number} for ${formatAmount(amount)} GAMEX`,
        { toastId: event.transactionHash }
      );
      onGameUpdate?.();
    }
  }, [address, onGameUpdate]);

  const handleGameCompleted = useCallback((player, number, result, amount, payout, timestamp, event) => {
    if (player.toLowerCase() === address?.toLowerCase()) {
      const won = payout > 0;
      toast[won ? 'success' : 'info'](
        won 
          ? `You won ${formatAmount(payout)} GAMEX!` 
          : 'Better luck next time!',
        { toastId: event.transactionHash }
      );
      onGameUpdate?.();
    }
  }, [address, onGameUpdate]);

  const handleRandomWordsFulfilled = useCallback((requestId, event) => {
    toast.info('Random number received!', { 
      toastId: event.transactionHash 
    });
    onGameUpdate?.();
  }, [onGameUpdate]);

  useEffect(() => {
    if (!diceContract || !address) return;

    // Event filters
    const gameStartedFilter = diceContract.filters.GameStarted(address);
    const gameCompletedFilter = diceContract.filters.GameCompleted(address);
    const randomWordsFilter = diceContract.filters.RandomWordsFulfilled();

    // Subscribe to events
    diceContract.on(gameStartedFilter, handleGameStarted);
    diceContract.on(gameCompletedFilter, handleGameCompleted);
    diceContract.on(randomWordsFilter, handleRandomWordsFulfilled);

    // Complete cleanup
    return () => {
      if (diceContract) {
        diceContract.off(gameStartedFilter, handleGameStarted);
        diceContract.off(gameCompletedFilter, handleGameCompleted);
        diceContract.off(randomWordsFilter, handleRandomWordsFulfilled);
      }
    };
  }, [
    diceContract,
    address,
    handleGameStarted,
    handleGameCompleted,
    handleRandomWordsFulfilled
  ]);
} 