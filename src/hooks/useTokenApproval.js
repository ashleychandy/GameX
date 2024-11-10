import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { handleError } from '../utils/errorHandling';

export function useTokenApproval() {
  const { tokenContract: token, diceContract: dice, address } = useWallet();
  const [hasApproval, setHasApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Check existing allowance
  const checkAllowance = useCallback(async (amount) => {
    if (!token || !dice || !address) return false;
    try {
      const allowance = await token.allowance(address, dice.target);
      const requiredAmount = ethers.parseEther(amount.toString());
      return allowance >= requiredAmount;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }, [token, dice, address]);

  const approveTokens = useCallback(async (amount) => {
    if (!token || !dice) throw new Error('Contracts not initialized');
    
    try {
      setIsApproving(true);
      const hasExistingApproval = await checkAllowance(amount);
      
      if (hasExistingApproval) {
        setHasApproval(true);
        return true;
      }

      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await token.approve(dice.target, amountInWei);
      toast.info('Approving tokens...');
      await tx.wait();
      setHasApproval(true);
      toast.success('Token approval successful');
      return true;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [token, dice, checkAllowance]);

  // Reset approval state on address change
  useEffect(() => {
    setHasApproval(false);
  }, [address]);

  return {
    hasApproval,
    approveTokens,
    isApproving,
    checkAllowance
  };
} 