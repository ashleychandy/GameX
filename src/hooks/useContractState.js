import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/helpers';

export function useContractState() {
  const { diceContract } = useWallet();
  const [isPaused, setIsPaused] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  const [totalGamesPlayed, setTotalGamesPlayed] = useState('0');
  const [totalPayoutAmount, setTotalPayoutAmount] = useState('0');

  const fetchContractState = useCallback(async () => {
    if (!diceContract) return;
    try {
      const [paused, balance, games, payouts] = await Promise.all([
        diceContract.paused(),
        diceContract.getContractBalance(),
        diceContract.totalGamesPlayed(),
        diceContract.totalPayoutAmount()
      ]);

      setIsPaused(paused);
      setContractBalance(balance.toString());
      setTotalGamesPlayed(games.toString());
      setTotalPayoutAmount(payouts.toString());
    } catch (error) {
      console.error('Error fetching contract state:', error);
    }
  }, [diceContract]);

  useEffect(() => {
    fetchContractState();
  }, [fetchContractState]);

  return {
    isPaused,
    contractBalance,
    totalGamesPlayed,
    totalPayoutAmount,
    refreshState: fetchContractState
  };
} 