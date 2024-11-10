import { useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import { useWallet } from '../contexts/WalletContext';
import { useGameContext } from '../contexts/GameContext';
import { handleTransaction } from '../utils/transactionUtils';
import { validateBetAmount, validateGameData } from '../utils/validation';
import { GAME_STATES, TRANSACTION_TYPES, POLLING_INTERVAL, CONTRACTS } from '../utils/constants';
import { handleError } from '../utils/errorHandling';
import DiceABI from '../abi/Dice.json';

export function useGame() {
  const { contract, isValid } = useContract('dice');
  const { address } = useWallet();
  const { 
    gameData,
    isLoading,
    error,
    setLoading,
    setError,
    updateGameData,
    resetGame
  } = useGameContext();
  
  const pollingInterval = useRef(null);

  const fetchGameData = useCallback(async () => {
    if (!isValid || !contract || !address) return;

    try {
      const data = await contract.getUserData(address);
      
      // Transform contract data into expected format
      const transformedData = {
        currentGame: {
          isActive: data.currentGame.isActive || false,
          chosenNumber: data.currentGame.chosenNumber?.toString() || '0',
          result: data.currentGame.result?.toString() || '0',
          amount: data.currentGame.amount?.toString() || '0',
          timestamp: data.currentGame.timestamp?.toString() || '0',
          payout: data.currentGame.payout?.toString() || '0',
          randomWord: data.currentGame.randomWord?.toString() || '0',
          status: data.currentGame.status || 0
        },
        stats: {
          totalGames: data.totalGames?.toString() || '0',
          totalBets: data.totalBets?.toString() || '0',
          totalWinnings: data.totalWinnings?.toString() || '0',
          totalLosses: data.totalLosses?.toString() || '0',
          lastPlayed: data.lastPlayed?.toString() || '0'
        }
      };

      // Now validate the transformed data
      const validatedData = validateGameData(transformedData);
      updateGameData(validatedData);
    } catch (error) {
      console.error('Error fetching game data:', error);
      setError(handleError(error).message);
    }
  }, [contract, address, isValid, updateGameData, setError]);

  const startPolling = useCallback(() => {
    if (pollingInterval.current) return;

    pollingInterval.current = setInterval(() => {
      fetchGameData();
    }, POLLING_INTERVAL);
  }, [fetchGameData]);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  useEffect(() => {
    fetchGameData();
    return () => stopPolling();
  }, [fetchGameData, stopPolling]);

  const playDice = useCallback(async (number, amount) => {
    if (!isValid || !contract) {
      throw new Error('Contract not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      const validatedAmount = validateBetAmount(amount);
      if (number < 1 || number > 6) {
        throw new Error('Invalid number selection');
      }

      // Execute transaction
      await handleTransaction(
        () => contract.playDice(number, validatedAmount),
        {
          pendingMessage: 'Placing bet...',
          successMessage: 'Bet placed successfully!',
          errorMessage: 'Failed to place bet',
          type: TRANSACTION_TYPES.PLAY
        }
      );

      // Start polling for updates
      startPolling();
      
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [contract, isValid, setLoading, setError, startPolling]);

  const resolveGame = useCallback(async () => {
    if (!isValid || !contract) {
      throw new Error('Contract not initialized');
    }

    if (!gameData?.currentGame?.isActive) {
      throw new Error('No active game to resolve');
    }

    try {
      setLoading(true);
      setError(null);

      await handleTransaction(
        () => contract.resolveGame(),
        {
          pendingMessage: 'Resolving game...',
          successMessage: 'Game resolved successfully!',
          errorMessage: 'Failed to resolve game',
          type: TRANSACTION_TYPES.RESOLVE
        }
      );

      await fetchGameData();
      stopPolling();
      
    } catch (error) {
      const { message } = handleError(error);
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [contract, isValid, gameData, fetchGameData, setLoading, setError, stopPolling]);

  return {
    gameData,
    playDice,
    resolveGame,
    isLoading,
    error,
    refreshGameData: fetchGameData,
    resetGame
  };
}