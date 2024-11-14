import { useContext, useCallback, useEffect, useState } from 'react';
import { WalletContext } from '@/contexts/WalletContext';
import { ethers } from 'ethers';
import { TOKEN_ABI, DICE_GAME_ABI } from '@/abi';
import { config } from '@/config';

export function useWallet() {
  const context = useContext(WalletContext);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = useCallback(async () => {
    if (!context.provider || !context.address) {
      setIsAdmin(false);
      return;
    }

    try {
      // Check both token and game contract admin roles
      const tokenContract = new ethers.Contract(
        config.contracts.token,
        TOKEN_ABI,
        context.provider.getSigner()
      );

      const diceContract = new ethers.Contract(
        config.contracts.diceGame,
        DICE_GAME_ABI,
        context.provider.getSigner()
      );

      const [tokenAdmin, gameOwner] = await Promise.all([
        tokenContract.hasRole(await tokenContract.DEFAULT_ADMIN_ROLE(), context.address),
        diceContract.owner()
      ]);

      // User is admin if they have admin role in token contract or are game owner
      setIsAdmin(tokenAdmin || gameOwner.toLowerCase() === context.address.toLowerCase());
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [context.provider, context.address]);

  useEffect(() => {
    if (context.provider && context.address) {
      checkAdminStatus();
    }
  }, [context.provider, context.address, checkAdminStatus]);

  return {
    ...context,
    isAdmin,
    checkAdminStatus
  };
}