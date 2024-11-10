import { useState, useCallback, useEffect, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';

export function useContractState(contract) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useWallet();

  const fetchState = useCallback(async () => {
    if (!contract || !address) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const state = await contract.getState();
      setState(state);
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return { state, error, isLoading, refetch: fetchState };
} 