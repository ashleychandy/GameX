import { useCallback, useRef, useState, useEffect } from 'react';
import { useContract } from './useContract';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';
import { validateGameData } from '../utils/format';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

export function useGame() {
  const { contract, isValid } = useContract('dice');
  const { address } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchGameData = useCallback(async () => {
    if (!isValid || !contract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch all game data in parallel
      const [userData, requestDetails, previousBets] = await Promise.all([
        contract.getUserData(address),
        contract.getCurrentRequestDetails(address),
        contract.getPreviousBets(address)
      ]);

      const gameState = {
        currentGame: {
          isActive: userData.currentGame.isActive,
          chosenNumber: userData.currentGame.chosenNumber.toString(),
          result: userData.currentGame.result.toString(),
          amount: ethers.formatEther(userData.currentGame.amount),
          timestamp: userData.currentGame.timestamp.toString(),
          payout: ethers.formatEther(userData.currentGame.payout),
          randomWord: userData.currentGame.randomWord.toString(),
          status: userData.currentGame.status
        },
        stats: {
          totalGames: userData.totalGames.toString(),
          totalBets: ethers.formatEther(userData.totalBets),
          totalWinnings: ethers.formatEther(userData.totalWinnings),
          totalLosses: ethers.formatEther(userData.totalLosses),
          lastPlayed: userData.lastPlayed.toString()
        },
        requestDetails: {
          requestId: requestDetails[0].toString(),
          requestFulfilled: requestDetails[1],
          requestActive: requestDetails[2]
        },
        previousBets: previousBets.map(bet => ({
          chosenNumber: bet.chosenNumber.toString(),
          rolledNumber: bet.rolledNumber.toString(),
          amount: ethers.formatEther(bet.amount),
          timestamp: bet.timestamp.toString()
        }))
      };

      setGameData(gameState);
    } catch (error) {
      console.error('Error fetching game data:', error);
      setError(handleError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, isValid]);

  const playDice = useCallback(async (number, amount) => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const canStart = await contract.canStartNewGame(address);
      if (!canStart) {
        throw new Error('Cannot start new game at this time');
      }

      // Convert amount to BigNumber with proper decimals
      const amountInWei = ethers.parseEther(amount.toString());

      const tx = await contract.playDice(number, amountInWei);
      toast.info('Transaction submitted...');
      await tx.wait();
      
      await fetchGameData();
      toast.success('Game started successfully!');
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    }
  }, [contract, address, fetchGameData]);

  const resolveGame = useCallback(async () => {
    if (!contract || !address) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const tx = await contract.resolveGame();
      toast.info('Resolving game...');
      await tx.wait();
      await fetchGameData();
      toast.success('Game resolved successfully!');
      return tx;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    }
  }, [contract, address, fetchGameData]);

  const resetGame = useCallback(async () => {
    setGameData(null);
    setError(null);
    await fetchGameData();
  }, [fetchGameData]);

  // Add pagination support
  const fetchPaginatedBets = useCallback(async (offset = 0, limit = 10) => {
    if (!contract || !address) return null;

    try {
      const [bets, total] = await contract.getPaginatedBets(address, offset, limit);
      return {
        bets: bets.map(bet => ({
          chosenNumber: bet.chosenNumber.toString(),
          rolledNumber: bet.rolledNumber.toString(),
          amount: ethers.formatEther(bet.amount),
          timestamp: bet.timestamp.toString()
        })),
        total: total.toString()
      };
    } catch (error) {
      console.error('Error fetching paginated bets:', error);
      throw error;
    }
  }, [contract, address]);

  // Fetch game data on mount and when address changes
  useEffect(() => {
    fetchGameData();
  }, [address, fetchGameData]);

  return {
    gameData,
    isLoading,
    error,
    fetchGameData,
    playDice,
    resolveGame,
    resetGame,
    fetchPaginatedBets
  };
}