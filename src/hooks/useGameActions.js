import { useState, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';
import { toast } from 'react-toastify';

export function useGameActions() {
  const { diceContract } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const forceStopGame = useCallback(async () => {
    if (!diceContract) return;
    try {
      setIsLoading(true);
      const tx = await diceContract.forceStopGame();
      toast.info('Stopping game...');
      await tx.wait();
      toast.success('Game stopped successfully');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [diceContract]);

  const pauseGame = useCallback(async () => {
    if (!diceContract) return;
    try {
      setIsLoading(true);
      const tx = await diceContract.pause();
      toast.info('Pausing game...');
      await tx.wait();
      toast.success('Game paused');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [diceContract]);

  const unpauseGame = useCallback(async () => {
    if (!diceContract) return;
    try {
      setIsLoading(true);
      const tx = await diceContract.unpause();
      toast.info('Unpausing game...');
      await tx.wait();
      toast.success('Game unpaused');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [diceContract]);

  return {
    isLoading,
    forceStopGame,
    pauseGame,
    unpauseGame
  };
} 