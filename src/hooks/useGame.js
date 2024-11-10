import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useContract } from './useContract';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';

export const GAME_STATES = {
  PENDING: 'PENDING',
  STARTED: 'STARTED',
  COMPLETED_WIN: 'COMPLETED_WIN',
  COMPLETED_LOSS: 'COMPLETED_LOSS',
  CANCELLED: 'CANCELLED',
  READY_TO_RESOLVE: 'READY_TO_RESOLVE',
  WAITING_FOR_RESULT: 'WAITING_FOR_RESULT'
};

export function useGame() {
  const [currentGame, setCurrentGame] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [previousBets, setPreviousBets] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [gameState, setGameState] = useState(GAME_STATES.PENDING);
  const [isLoading, setIsLoading] = useState(false);

  const { contract, address } = useWallet();

  const fetchGameData = useCallback(async () => {
    if (!contract || !address) {
      setCurrentGame(null);
      setPlayerStats(null);
      setPreviousBets([]);
      setRequestDetails(null);
      setGameState(GAME_STATES.PENDING);
      return;
    }

    try {
      const [
        userData,
        stats,
        previousBetsData,
        requestInfo,
        canStart
      ] = await Promise.all([
        contract.getUserData(address),
        contract.getPlayerStats(address),
        contract.getPreviousBets(address),
        contract.getCurrentRequestDetails(address),
        contract.canStartNewGame(address)
      ]);

      // Update current game state with proper null checks
      const gameData = {
        isActive: userData.currentGame.isActive,
        chosenNumber: userData.currentGame.chosenNumber.toNumber(),
        result: userData.currentGame.result.toNumber(),
        amount: ethers.formatEther(userData.currentGame.amount),
        timestamp: userData.currentGame.timestamp.toNumber(),
        payout: ethers.formatEther(userData.currentGame.payout),
        status: GAME_STATES[userData.currentGame.status] || GAME_STATES.PENDING
      };
      setCurrentGame(gameData);

      // Update player stats with proper formatting
      setPlayerStats({
        winRate: stats.winRate.toNumber() / 100, // Convert basis points to percentage
        averageBet: ethers.formatEther(stats.averageBet),
        totalGamesWon: stats.totalGamesWon.toNumber(),
        totalGamesLost: stats.totalGamesLost.toNumber()
      });

      // Format previous bets data
      const formattedBets = previousBetsData.map(bet => ({
        chosenNumber: bet.chosenNumber.toNumber(),
        rolledNumber: bet.rolledNumber.toNumber(),
        amount: ethers.formatEther(bet.amount),
        timestamp: bet.timestamp.toNumber()
      }));
      setPreviousBets(formattedBets);

      // Update request details
      setRequestDetails({
        requestId: requestInfo.requestId.toNumber(),
        requestFulfilled: requestInfo.requestFulfilled,
        requestActive: requestInfo.requestActive
      });

      // Determine game state
      if (!gameData.isActive) {
        setGameState(GAME_STATES.PENDING);
      } else if (requestInfo.requestFulfilled) {
        setGameState(GAME_STATES.READY_TO_RESOLVE);
      } else if (requestInfo.requestActive) {
        setGameState(GAME_STATES.WAITING_FOR_RESULT);
      } else {
        setGameState(GAME_STATES.STARTED);
      }

    } catch (error) {
      console.error('Error fetching game data:', error);
      toast.error('Failed to fetch game data');
    }
  }, [contract, address]);

  // Polling interval for game updates
  useEffect(() => {
    if (contract && address) {
      fetchGameData();
      
      const interval = setInterval(fetchGameData, 5000);
      return () => clearInterval(interval);
    }
  }, [contract, address, fetchGameData]);

  // Play dice function with proper error handling
  const playDice = async (chosenNumber, amount) => {
    if (!contract || !address) return;
    
    setIsLoading(true);
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await contract.playDice(chosenNumber, amountInWei);
      await tx.wait();
      toast.success('Bet placed successfully!');
      await fetchGameData();
    } catch (error) {
      console.error('Error placing bet:', error);
      const errorMessage = error.reason || error.message || 'Transaction failed';
      toast.error(`Failed to place bet: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve game function with proper error handling
  const resolveGame = async () => {
    if (!contract || !address) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.resolveGame();
      await tx.wait();
      toast.success('Game resolved successfully!');
      await fetchGameData();
    } catch (error) {
      console.error('Error resolving game:', error);
      const errorMessage = error.reason || error.message || 'Transaction failed';
      toast.error(`Failed to resolve game: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentGame,
    playerStats,
    previousBets,
    requestDetails,
    gameState,
    isLoading,
    playDice,
    resolveGame,
    refreshGameData: fetchGameData
  };
} 