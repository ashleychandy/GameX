import { useState, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { formatAmount } from '../utils/format';
import { GAME_STATES } from '../utils/constants';

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

      const [currentGame, canStart] = await Promise.all([
        contract.getCurrentGame(address),
        contract.canStartNewGame(address)
      ]);

      return {
        currentGame: {
          isActive: currentGame.isActive,
          chosenNumber: currentGame.chosenNumber.toString(),
          amount: formatAmount(currentGame.amount),
          status: currentGame.status,
          payout: formatAmount(currentGame.payout)
        },
        canStartNewGame: canStart
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