import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { executeContractTransaction, executeContractCall } from '../utils/contractHelpers';
import { toast } from 'react-toastify';

export function useTokenApproval(spenderAddress) {
  const { contracts: { token }, address } = useWallet();
  const [allowance, setAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);

  const fetchAllowance = useCallback(async () => {
    if (!token || !address || !spenderAddress) return;
    
    try {
      const result = await executeContractCall(
        token,
        'allowance',
        [address, spenderAddress]
      );
      setAllowance(result.toString());
    } catch (error) {
      console.error('Failed to fetch allowance:', error);
      toast.error('Failed to fetch token allowance');
    }
  }, [token, address, spenderAddress]);

  const checkAndApproveToken = useCallback(async (amount) => {
    if (!token || !address || !spenderAddress) {
      throw new Error('Token approval not available');
    }

    try {
      setIsApproving(true);
      const currentAllowance = ethers.BigNumber.from(allowance);
      const requiredAmount = ethers.parseEther(amount.toString());

      if (currentAllowance.lt(requiredAmount)) {
        const tx = await executeContractTransaction(
          token,
          'approve',
          [spenderAddress, ethers.constants.MaxUint256]
        );
        await tx.wait();
        await fetchAllowance();
        toast.success('Token approval successful');
      }
      return true;
    } catch (error) {
      toast.error('Failed to approve token');
      throw error;
    } finally {
      setIsApproving(false);
    }
  }, [token, address, spenderAddress, allowance, fetchAllowance]);

  useEffect(() => {
    fetchAllowance();
    
    // Listen for Approval events
    if (token && address && spenderAddress) {
      const filter = token.filters.Approval(address, spenderAddress);
      token.on(filter, fetchAllowance);
      
      return () => {
        token.off(filter, fetchAllowance);
      };
    }
  }, [token, address, spenderAddress, fetchAllowance]);

  return {
    allowance,
    isApproving,
    checkAndApproveToken,
    refreshAllowance: fetchAllowance
  };
} 