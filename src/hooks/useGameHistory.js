import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { STORAGE_KEYS } from '../utils/constants';

export function useGameHistory() {
  const { address } = useWallet();
  const [history, setHistory] = useState([]);

  // Load history from local storage
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(
        `${STORAGE_KEYS.GAME_HISTORY}_${address}`
      );
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    }
  }, [address]);

  // Add game to history
  const addToHistory = useCallback((game) => {
    if (!address) return;
    
    setHistory(prev => {
      const updated = [game, ...prev].slice(0, 50); // Keep last 50 games
      localStorage.setItem(
        `${STORAGE_KEYS.GAME_HISTORY}_${address}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  }, [address]);

  // Clear history
  const clearHistory = useCallback(() => {
    if (!address) return;
    
    localStorage.removeItem(`${STORAGE_KEYS.GAME_HISTORY}_${address}`);
    setHistory([]);
  }, [address]);

  return {
    history,
    addToHistory,
    clearHistory
  };
} 