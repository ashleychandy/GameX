import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';
import { executeTransaction } from '../utils/contractHelpers';
import { toast } from 'react-toastify';

export function useTokenApproval(spenderAddress) {
  const { tokenContract, address } = useWallet();
  const [allowance, setAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);

  const fetchAllowance = useCallback(async () => {
    if (!tokenContract || !address || !spenderAddress) return;

    try {
      const currentAllowance = await tokenContract.allowance(address, spenderAddress);
      setAllowance(ethers.formatEther(currentAllowance));
    } catch (error) {
      const { message } = handleError(error);
      console.error('Error fetching allowance:', message);
    }
  }, [tokenContract, address, spenderAddress]);

  const checkAndApproveToken = useCallback(async (amount) => {
    if (!tokenContract || !spenderAddress) {
      throw new Error('Token contract or spender not initialized');
    }

    try {
      const currentAllowance = ethers.parseEther(allowance);
      const requiredAmount = ethers.parseEther(amount.toString());

      if (currentAllowance.gte(requiredAmount)) {
        return true;
      }

      setIsApproving(true);
      const tx = await executeTransaction(() =>
        tokenContract.approve(spenderAddress, requiredAmount)
      );

      await tx.wait();
      await fetchAllowance();
      toast.success('Token approval successful');
      return true;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(`Token approval failed: ${message}`);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [tokenContract, spenderAddress, allowance, fetchAllowance]);

  useEffect(() => {
    fetchAllowance();
    
    // Listen for Approval events
    if (tokenContract && address && spenderAddress) {
      const filter = tokenContract.filters.Approval(address, spenderAddress);
      tokenContract.on(filter, fetchAllowance);
      
      return () => {
        tokenContract.off(filter, fetchAllowance);
      };
    }
  }, [tokenContract, address, spenderAddress, fetchAllowance]);

  return {
    allowance,
    isApproving,
    checkAndApproveToken,
    refreshAllowance: fetchAllowance
  };
} 