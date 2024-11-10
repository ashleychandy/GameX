import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandling';

export function useTokenApproval() {
  const { tokenContract: token, diceContract: dice } = useWallet();
  const [hasApproval, setHasApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const approveTokens = useCallback(async (amount) => {
    if (!token || !dice) return;
    
    try {
      setIsApproving(true);
      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await token.approve(dice.target, amountInWei);
      toast.info('Approving tokens...');
      await tx.wait();
      setHasApproval(true);
      toast.success('Token approval successful');
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsApproving(false);
    }
  }, [token, dice]);

  return {
    hasApproval,
    approveTokens,
    isApproving
  };
} 