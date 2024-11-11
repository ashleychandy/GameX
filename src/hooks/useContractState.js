import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { validateGameState } from '../utils/contractHelpers';

export function useContractState() {
  const { address } = useWallet();
  const { contract } = useContract('dice');
  
  const [state, setState] = useState({
    contractBalance: '0',
    minBet: '0',
    maxBet: '0',
    houseEdge: '0',
    paused: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContractState = useCallback(async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      setError(null);

      const [
        balance,
        minBet,
        maxBet,
        houseEdge,
        paused
      ] = await Promise.all([
        contract.getContractBalance(),
        contract.minBet(),
        contract.maxBet(),
        contract.houseEdge(),
        contract.paused()
      ]);

      setState({
        contractBalance: balance.toString(),
        minBet: minBet.toString(),
        maxBet: maxBet.toString(),
        houseEdge: houseEdge.toString(),
        paused
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contract state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchContractState();
    
    // Setup contract event listeners for state changes
    if (contract) {
      const filters = [
        contract.filters.ContractFunded(),
        contract.filters.FundsWithdrawn(),
        contract.filters.GameParametersUpdated()
      ];
      
      filters.forEach(filter => {
        contract.on(filter, fetchContractState);
      });
      
      return () => {
        filters.forEach(filter => {
          contract.off(filter, fetchContractState);
        });
      };
    }
  }, [contract, fetchContractState]);

  return {
    ...state,
    isLoading,
    error,
    refetch: fetchContractState
  };
} 