import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';

export function useContractState(contract) {
  const [gameData, setGameData] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useWallet();

  const fetchGameState = useCallback(async () => {
    if (!contract || !address) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const [gameState, details, previousBets] = await Promise.all([
        contract.getCurrentGame(address),
        contract.getCurrentRequestDetails(address),
        contract.getPreviousBets(address)
      ]);

      setGameData(gameState);
      setRequestDetails({
        requestId: details[0].toString(),
        requestFulfilled: details[1],
        requestActive: details[2]
      });
      setHistory(previousBets.map(bet => ({
        chosenNumber: bet.chosenNumber.toString(),
        rolledNumber: bet.rolledNumber.toString(),
        amount: bet.amount.toString(),
        timestamp: bet.timestamp.toString()
      })));
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  return {
    gameData,
    requestDetails,
    history,
    error,
    isLoading,
    refetch: fetchGameState
  };
} 