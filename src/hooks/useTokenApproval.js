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
      const amountBN = ethers.parseEther(amount.toString());
      const allowance = await token.allowance(address, dice.target);
      
      // Cache checked amount
      setLastCheckedAmount(amount.toString());
      
      return allowance.gte(amountBN);
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }, [token, dice, address]);

  const approveTokens = useCallback(async (amount) => {
    if (!token || !dice || !amount || isNaN(amount)) {
      throw new Error('Invalid approval parameters');
    }

    // Validate amount
    const amountBN = ethers.parseEther(amount.toString());
    if (amountBN.lt(GAME_CONFIG.MIN_BET)) {
      throw new Error(`Minimum bet amount is ${ethers.formatEther(GAME_CONFIG.MIN_BET)} tokens`);
    }
    
    try {
      setIsApproving(true);
      
      // Check existing allowance first
      const hasExistingApproval = await checkAllowance(amount);
      if (hasExistingApproval) {
        setHasApproval(true);
        return true;
      }

      // Prepare approval transaction
      const tx = await token.approve(dice.target, amountBN);
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