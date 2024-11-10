import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from './useContract';
import { GAME_STATES } from '../constants';
import { toast } from 'react-toastify';
import { handleError } from '../utils/helpers';

export function useGame() {
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState(GAME_STATES.PENDING);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameStats, setGameStats] = useState(null);

  const { address } = useWallet();
  const dice = useContract('dice');

  const fetchGameState = useCallback(async () => {
    if (!dice || !address) {
      setGameState(GAME_STATES.PENDING);
      setCurrentGame(null);
      setGameStats(null);
      return;
    }

    try {
      setIsLoading(true);
      
      const [currentGameData, statsData] = await Promise.all([
        dice.getCurrentGame(address).catch(error => {
          console.error('Error fetching current game:', error);
          return {
            isActive: false,
            chosenNumber: 0,
            result: 0,
            amount: 0,
            timestamp: 0,
            status: 0
          };
        }),
        dice.getPlayerStats(address).catch(error => {
          console.error('Error fetching player stats:', error);
          return {
            winRate: 0,
            averageBet: 0,
            totalGamesWon: 0,
            totalGamesLost: 0
          };
        })
      ]);

      if (currentGameData) {
        setCurrentGame({
          isActive: currentGameData.isActive,
          chosenNumber: currentGameData.chosenNumber.toString(),
          result: currentGameData.result.toString(),
          amount: ethers.formatEther(currentGameData.amount || 0),
          timestamp: currentGameData.timestamp.toString(),
          status: currentGameData.status
        });
      }

      if (statsData) {
        setGameStats({
          winRate: statsData.winRate.toString(),
          averageBet: ethers.formatEther(statsData.averageBet || 0),
          totalGamesWon: statsData.totalGamesWon.toString(),
          totalGamesLost: statsData.totalGamesLost.toString()
        });
      }

      // Update game state based on current game status
      if (!currentGameData?.isActive) {
        setGameState(GAME_STATES.PENDING);
      } else if (currentGameData?.status === 1) {
        setGameState(GAME_STATES.WAITING_FOR_RANDOM);
      } else if (currentGameData?.status === 2) {
        setGameState(GAME_STATES.READY_TO_RESOLVE);
      } else if (currentGameData?.status === 3) {
        setGameState(GAME_STATES.COMPLETED);
      }

    } catch (error) {
      const { message } = handleError(error);
      console.error('Error fetching game state:', message);
      if (!error.message.includes('execution reverted')) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dice, address]);

  const playDice = useCallback(async (number, amount) => {
    if (!dice) throw new Error('Contract not initialized');
    
    try {
      setIsLoading(true);
      const tx = await dice.playDice(number, { value: amount });
      toast.info('Transaction submitted...');
      await tx.wait();
      toast.success('Bet placed successfully!');
      await fetchGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [dice, fetchGameState]);

  const resolveGame = useCallback(async () => {
    if (!dice) throw new Error('Contract not initialized');
    
    try {
      setIsLoading(true);
      const tx = await dice.resolveGame();
      toast.info('Resolving game...');
      await tx.wait();
      toast.success('Game resolved successfully!');
      await fetchGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [dice, fetchGameState]);

  // Reduce polling frequency to avoid too many errors
  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 30000); // Changed from 10s to 30s
    return () => clearInterval(interval);
  }, [fetchGameState]);

  return {
    isLoading,
    gameState,
    currentGame,
    gameStats,
    playDice,
    resolveGame,
    fetchGameState
  };
} 