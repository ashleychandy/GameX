import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { executeTransaction } from '../utils/contractHelpers';

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
      console.error('Error fetching allowance:', error);
    }
  }, [tokenContract, address, spenderAddress]);

  const approve = useCallback(async (amount) => {
    if (!tokenContract || !spenderAddress) {
      throw new Error('Token contract or spender not initialized');
    }

    try {
      setIsApproving(true);
      const parsedAmount = ethers.parseEther(amount.toString());
      
      await executeTransaction(() =>
        tokenContract.approve(spenderAddress, parsedAmount)
      );

      await fetchAllowance();
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsApproving(false);
    }
  }, [tokenContract, spenderAddress, fetchAllowance]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return {
    allowance,
    approve,
    isApproving,
    checkAllowance: fetchAllowance
  };
} 