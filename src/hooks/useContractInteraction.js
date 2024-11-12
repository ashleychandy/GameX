import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { handleContractError } from '../utils/errorHandling';
import { estimateGas } from '../utils/gas';

export function useContractInteraction() {
  const { contracts } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeTransaction = useCallback(async (
    contractMethod,
    args = [],
    options = {}
  ) => {
    setIsProcessing(true);
    try {
      const gasLimit = await estimateGas(
        contracts.dice,
        contractMethod,
        args,
        options
      );

      const tx = await contracts.dice[contractMethod](...args, {
        gasLimit,
        ...options
      });

      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      throw handleContractError(error);
    } finally {
      setIsProcessing(false);
    }
  }, [contracts.dice]);

  const placeBet = useCallback(async (number, amount) => {
    const parsedAmount = ethers.parseEther(amount.toString());
    return executeTransaction('placeBet', [number, parsedAmount]);
  }, [executeTransaction]);

  // Add other contract interactions...

  return {
    isProcessing,
    placeBet,
    // Other methods...
  };
} 