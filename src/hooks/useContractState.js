import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { ethers } from 'ethers';

export function useContractState() {
  const { address } = useWallet();
  const { contract } = useContract('dice');
  
  const [state, setState] = useState({
    contractBalance: '0',
    paused: false,
    playerStats: {
      winRate: '0',
      averageBet: '0',
      totalGamesWon: '0',
      totalGamesLost: '0'
    },
    defaultHistorySize: '0',
    maxBet: '0'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContractState = useCallback(async () => {
    if (!contract || !address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [balance, paused, playerStats, historySize] = await Promise.all([
        contract.getContractBalance(),
        contract.paused(),
        contract.getPlayerStats(address),
        contract.DEFAULT_HISTORY_SIZE()
      ]);

      const maxBet = calculateMaxBet(balance);

      setState({
        contractBalance: balance.toString(),
        paused,
        playerStats: {
          winRate: playerStats.winRate.toString(),
          averageBet: playerStats.averageBet.toString(),
          totalGamesWon: playerStats.totalGamesWon.toString(),
          totalGamesLost: playerStats.totalGamesLost.toString()
        },
        defaultHistorySize: historySize.toString(),
        maxBet: maxBet.toString()
      });

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  useEffect(() => {
    fetchContractState();
  }, [fetchContractState]);

  return {
    state,
    isLoading,
    error,
    refreshState: fetchContractState
  };
} 