import { useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';

export function useGameEvents(onGameUpdate) {
  const { diceContract: contract, address } = useWallet();

  const setupEventListeners = useCallback((contract, address) => {
    if (!contract || !address) return;

    const filters = {
      betPlaced: contract.filters.BetPlaced(address),
      gameResolved: contract.filters.GameResolved(address),
      randomWords: contract.filters.RandomWordsFulfilled()
    };

    const handlers = {
      betPlaced: (player, number, amount) => {
        if (player.toLowerCase() === address.toLowerCase()) {
          toast.info(`Bet placed: ${formatAmount(amount)} DICE on ${number}`);
          onGameUpdate?.();
        }
      },
      // ... other handlers
    };

    // Set up listeners with error handling
    Object.entries(filters).forEach(([event, filter]) => {
      try {
        contract.on(filter, handlers[event]);
      } catch (error) {
        console.error(`Failed to set up ${event} listener:`, error);
      }
    });

    return () => {
      Object.entries(filters).forEach(([event, filter]) => {
        contract.off(filter, handlers[event]);
      });
    };
  }, [onGameUpdate]);

  useEffect(() => {
    setupEventListeners(contract, address);

    return () => {
      setupEventListeners(contract, address);
    };
  }, [setupEventListeners, contract, address]);
} 