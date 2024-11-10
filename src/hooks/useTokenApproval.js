import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';
import { TRANSACTION_TYPES, GAME_CONFIG } from '../utils/constants';
import { toast } from 'react-toastify';

export function useTokenApproval() {
  const { tokenContract: token, diceContract: dice, address } = useWallet();
  const [hasApproval, setHasApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [lastCheckedAmount, setLastCheckedAmount] = useState('0');

  const checkAllowance = useCallback(async (amount) => {
    if (!token || !dice || !address || !amount) {
      console.debug('Missing parameters for allowance check:', { token, dice, address, amount });
      return false;
    }

    try {
      // Ensure amount is a valid number and convert to string
      const amountStr = amount.toString();
      if (isNaN(amountStr) || parseFloat(amountStr) <= 0) {
        throw new Error('Invalid amount for approval check');
      }

      const amountBN = ethers.parseEther(amountStr);
      const allowance = await token.allowance(address, dice.target);
      
      // Cache checked amount
      setLastCheckedAmount(amountStr);
      
      return allowance.gte(amountBN);
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }, [token, dice, address]);

  const approveTokens = useCallback(async (amount) => {
    if (!token || !dice) {
      throw new Error('Contracts not initialized');
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount for approval');
    }

    try {
      setIsApproving(true);
      
      // Always approve for a large amount to avoid frequent approvals
      const approvalAmount = GAME_CONFIG.APPROVAL_AMOUNT;
      
      // Check existing allowance first
      const hasExistingApproval = await checkAllowance(amount);
      if (hasExistingApproval) {
        setHasApproval(true);
        return true;
      }

      // Prepare approval transaction
      const tx = await token.approve(dice.target, approvalAmount);
      toast.info('Approving tokens...', { toastId: TRANSACTION_TYPES.APPROVE });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error('Token approval failed');
      }

      setHasApproval(true);
      toast.success('Token approval successful');
      return true;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message, { toastId: TRANSACTION_TYPES.APPROVE });
      throw new Error(message);
    } finally {
      setIsApproving(false);
    }
  }, [token, dice, checkAllowance]);

  // Reset approval state when address changes
  useEffect(() => {
    setHasApproval(false);
    setLastCheckedAmount('0');
  }, [address]);

  // Recheck allowance when amount changes significantly
  useEffect(() => {
    const recheckAllowance = async () => {
      if (!lastCheckedAmount) return;
      const currentApproval = await checkAllowance(lastCheckedAmount);
      setHasApproval(currentApproval);
    };

    recheckAllowance();
  }, [checkAllowance, lastCheckedAmount]);

  return {
    hasApproval,
    approveTokens,
    isApproving,
    checkAllowance
  };
} 