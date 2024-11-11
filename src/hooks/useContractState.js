import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { formatAmount, calculateMaxBet } from '../utils/format';

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
    defaultHistorySize: '10',
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

      // Fetch contract data with safe defaults and error handling
      const [balance, paused, playerStats, historySize] = await Promise.all([
        contract.getContractBalance().catch(() => ethers.parseEther('0')),
        contract.paused().catch(() => false),
        contract.getPlayerStats(address).catch(() => ({
          winRate: '0',
          averageBet: '0',
          totalGamesWon: '0',
          totalGamesLost: '0'
        })),
        contract.DEFAULT_HISTORY_SIZE().catch(() => '10')
      ]);

      // Safely calculate max bet
      const maxBet = calculateMaxBet(balance);

      // Transform data with safe conversions
      setState({
        contractBalance: balance.toString(),
        paused,
        playerStats: {
          winRate: playerStats.winRate?.toString() || '0',
          averageBet: formatAmount(playerStats.averageBet || '0'),
          totalGamesWon: playerStats.totalGamesWon?.toString() || '0',
          totalGamesLost: playerStats.totalGamesLost?.toString() || '0'
        },
        defaultHistorySize: historySize.toString(),
        maxBet: maxBet.toString()
      });

    } catch (error) {
      console.error('Error fetching contract state:', error);
      setError('Failed to fetch contract state');
      
      // Set safe default state on error
      setState({
        contractBalance: '0',
        paused: false,
        playerStats: {
          winRate: '0',
          averageBet: '0',
          totalGamesWon: '0',
          totalGamesLost: '0'
        },
        defaultHistorySize: '10',
        maxBet: '0'
      });
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  // Fetch initial state
  useEffect(() => {
    fetchContractState();
  }, [fetchContractState]);

  // Listen for contract events that should trigger a refresh
  useEffect(() => {
    if (!contract) return;

    // Define event names based on contract events
    const events = ['BetPlaced', 'GameCompleted', 'GameCancelled', 'PrizeClaimed'];
    
    const handleEvent = () => {
      fetchContractState();
    };

    // Add listeners for each event
    events.forEach(eventName => {
      if (contract.interface.hasEvent(eventName)) {
        contract.on(eventName, handleEvent);
      }
    });

    // Cleanup listeners
    return () => {
      events.forEach(eventName => {
        if (contract.interface.hasEvent(eventName)) {
          contract.off(eventName, handleEvent);
        }
      });
    };
  }, [contract, fetchContractState]);

  const refreshState = useCallback(async () => {
    await fetchContractState();
  }, [fetchContractState]);

  return {
    state,
    isLoading,
    error,
    refreshState
  };
} 