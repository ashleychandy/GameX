import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { handleError, showError } from '../utils/errorHandling';
import { GAME_STATES } from '../utils/constants';

export function useGame() {
  const { diceContract: contract, address } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use ref for event subscriptions
  const eventSubscriptions = useRef([]);

  const isValid = contract && address;

  const fetchGameData = useCallback(async () => {
    if (!isValid) return;

    try {
      const [gameStatus, requestDetails] = await Promise.all([
        contract.getGameStatus(address),
        contract.getCurrentRequestDetails(address)
      ]);

      setGameData({
        currentGame: {
          isActive: gameStatus.isActive,
          status: gameStatus.status,
          chosenNumber: gameStatus.chosenNumber.toString(),
          amount: ethers.formatEther(gameStatus.amount),
          timestamp: gameStatus.timestamp.toString()
        },
        requestDetails: {
          requestId: requestDetails.requestId.toString(),
          requestFulfilled: requestDetails.requestFulfilled,
          requestActive: requestDetails.requestActive
        }
      });
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  }, [contract, address]);

  // Subscribe to events
  useEffect(() => {
    if (!isValid) return;

    const gameStartedFilter = contract.filters.GameStarted(address);
    const gameEndedFilter = contract.filters.GameEnded(address);
    
    const onGameStarted = () => fetchGameData();
    const onGameEnded = () => fetchGameData();

    contract.on(gameStartedFilter, onGameStarted);
    contract.on(gameEndedFilter, onGameEnded);

    eventSubscriptions.current.push(
      { event: gameStartedFilter, handler: onGameStarted },
      { event: gameEndedFilter, handler: onGameEnded }
    );

    return () => {
      eventSubscriptions.current.forEach(({ event, handler }) => {
        contract.off(event, handler);
      });
      eventSubscriptions.current = [];
    };
  }, [contract, address, fetchGameData]);

  // Initial data fetch
  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  const playDice = async (number, amount) => {
    if (!isValid) {
      throw new Error('Contract not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountInWei = ethers.parseEther(amount.toString());
      const gasEstimate = await contract.playDice.estimateGas(number, amountInWei);
      
      const tx = await contract.playDice(number, amountInWei, {
        gasLimit: Math.ceil(gasEstimate * 1.2) // Add 20% buffer
      });

      await tx.wait();
      await fetchGameData();

      return tx;
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const resolveGame = async () => {
    if (!isValid) {
      throw new Error('Contract not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const gasEstimate = await contract.resolveGame.estimateGas();
      const tx = await contract.resolveGame({
        gasLimit: Math.ceil(gasEstimate * 1.2)
      });

      await tx.wait();
      await fetchGameData();

      return tx;
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gameData,
    playDice,
    resolveGame,
    refreshGameData: fetchGameData,
    isLoading,
    error
  };
}