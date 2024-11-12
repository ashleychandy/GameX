import { useState, useCallback, useRef } from 'react';
import { useContract } from './useContract';
import { executeContractCall } from '../utils/contractHelpers';

export function useContractState(contractType) {
  const { contract } = useContract(contractType);
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const stateRef = useRef(null);

  // Cache state updates
  const updateState = useCallback((newState) => {
    stateRef.current = newState;
    setState(newState);
  }, []);

  // Fetch contract state with caching
  const fetchState = useCallback(async (force = false) => {
    if (!contract) return;
    if (!force && stateRef.current) return stateRef.current;

    try {
      setIsLoading(true);
      setError(null);

      const state = await executeContractCall(contract, 'getState');
      updateState(state);
      return state;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contract, updateState]);

  return {
    state: stateRef.current,
    isLoading,
    error,
    fetchState
  };
} 