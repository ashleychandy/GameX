import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/helpers';
import { toast } from 'react-toastify';

export function useTokenApproval() {
  const { tokenContract: token, diceContract: dice } = useWallet();
  const [isApproving, setIsApproving] = useState(false);

  const checkAndApprove = useCallback(async (amount) => {
    if (!token || !dice) return false;
    try {
      setIsApproving(true);
      
      const amountWei = ethers.parseEther(amount.toString());
      const allowance = await token.allowance(dice.target);
      
      if (allowance < amountWei) {
        const tx = await token.approve(dice.target, amountWei);
        toast.info('Approving tokens...');
        await tx.wait();
        toast.success('Tokens approved!');
      }
      
      return true;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [token, dice]);

  return { isApproving, checkAndApprove };
} 