import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';
import { TOKEN_ABI } from '@/abi';
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
    if (!provider || !address) {
      setIsAdmin(false);
      return false;
    }

    const tokenContract = new ethers.Contract(
      config.contracts.token,
      TOKEN_ABI,
      provider.getSigner()
    );

    try {
      const DEFAULT_ADMIN_ROLE = await tokenContract.DEFAULT_ADMIN_ROLE();
      const hasAdminRole = await tokenContract.hasRole(
        DEFAULT_ADMIN_ROLE,
        address
      );
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
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
