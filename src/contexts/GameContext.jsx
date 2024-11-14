import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';
import { DICE_GAME_ABI } from '@/contracts/abis';
import { config } from '@/config';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { provider, address } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameState, setGameState] = useState({
    isActive: false,
    currentBet: null,
    history: []
  });

  const checkAdminStatus = useCallback(async () => {
    if (!provider || !address) return false;

    const contract = new ethers.Contract(
      config.contracts.diceGame,
      DICE_GAME_ABI,
      provider.getSigner()
    );

    try {
      const owner = await contract.owner();
      const isOwner = owner.toLowerCase() === address.toLowerCase();
      setIsAdmin(isOwner);
      return isOwner;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }, [provider, address]);

  useEffect(() => {
    if (provider && address) {
      checkAdminStatus();
    }
  }, [provider, address, checkAdminStatus]);

  const value = {
    isAdmin,
    gameState,
    setGameState,
    checkAdminStatus
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
