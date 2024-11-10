import { useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';

export function useContractInteraction() {
  const { address } = useWallet();

  const executeTransaction = useCallback(async (contract, method, args = [], options = {}) => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const tx = await contract[method](...args, options);
      const receipt = await tx.wait();
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed');
      }
      
      return receipt;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    }
  }, [address]);

  const fetchContractData = useCallback(async (contract, method, args = []) => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const result = await contract[method](...args);
      return result;
    } catch (error) {
      const { message } = handleError(error);
      console.error(`Error fetching ${method}:`, message);
      throw error;
    }
  }, [address]);

  const listenForEvents = useCallback((contract, eventName, filter = {}, callback) => {
    if (!contract) return () => {};

    try {
      const eventFilter = contract.filters[eventName](...Object.values(filter));
      contract.on(eventFilter, callback);

      return () => {
        contract.off(eventFilter, callback);
      };
    } catch (error) {
      console.error(`Error setting up ${eventName} listener:`, error);
      return () => {};
    }
  }, []);

  return {
    executeTransaction,
    fetchContractData,
    listenForEvents
  };
} 