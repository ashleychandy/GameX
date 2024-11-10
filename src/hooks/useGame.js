import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useContract } from './useContract';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/helpers';

export const GAME_STATES = {
  PENDING: 'PENDING',
  STARTED: 'STARTED',
  COMPLETED_WIN: 'COMPLETED_WIN',
  COMPLETED_LOSS: 'COMPLETED_LOSS',
  CANCELLED: 'CANCELLED'
};

export function useGame() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [previousBets, setPreviousBets] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [gameState, setGameState] = useState(GAME_STATES.PENDING);

  const { contract } = useContract('Dice');
  const { address } = useWallet();

  // Fetch all game data
  const fetchGameData = useCallback(async () => {
    if (!contract || !address) return;

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

      // Update current game state
      setCurrentGame({
        isActive: userData.currentGame.isActive,
        chosenNumber: userData.currentGame.chosenNumber.toNumber(),
        result: userData.currentGame.result.toNumber(),
        amount: ethers.formatEther(userData.currentGame.amount),
        timestamp: userData.currentGame.timestamp.toNumber(),
        payout: ethers.formatEther(userData.currentGame.payout),
        status: GAME_STATES[userData.currentGame.status]
      });

      // Update player stats
      setPlayerStats({
        winRate: stats.winRate.toNumber() / 100, // Convert basis points to percentage
        averageBet: ethers.formatEther(stats.averageBet),
        totalGamesWon: stats.totalGamesWon.toNumber(),
        totalGamesLost: stats.totalGamesLost.toNumber(),
        totalGames: userData.totalGames.toNumber(),
        totalBets: ethers.formatEther(userData.totalBets),
        totalWinnings: ethers.formatEther(userData.totalWinnings),
        totalLosses: ethers.formatEther(userData.totalLosses),
        lastPlayed: userData.lastPlayed.toNumber()
      });

      // Update previous bets
      setPreviousBets(previousBetsData.map(bet => ({
        chosenNumber: bet.chosenNumber.toNumber(),
        rolledNumber: bet.rolledNumber.toNumber(),
        amount: ethers.formatEther(bet.amount),
        timestamp: bet.timestamp.toNumber()
      })));

      // Update request details
      setRequestDetails({
        requestId: requestInfo.requestId.toNumber(),
        requestFulfilled: requestInfo.requestFulfilled,
        requestActive: requestInfo.requestActive
      });

      // Determine game state
      if (!userData.currentGame.isActive) {
        setGameState(GAME_STATES.PENDING);
      } else if (requestInfo.requestFulfilled) {
        setGameState('READY_TO_RESOLVE');
      } else {
        setGameState(GAME_STATES.STARTED);
      }

    } catch (error) {
      console.error('Error fetching game data:', error);
      toast.error('Failed to fetch game data');
    }
  }, [contract, address]);

  // Auto-refresh game data
  useEffect(() => {
    if (contract && address) {
      fetchGameData();
      
      // Set up polling for game updates
      const interval = setInterval(fetchGameData, 5000);
      return () => clearInterval(interval);
    }
  }, [contract, address, fetchGameData]);

  // Play dice function
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
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve game function
  const resolveGame = async () => {
    if (!contract || !address) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.resolveGame();
      await tx.wait();
      toast.success('Game resolved successfully!');
      await fetchGameData();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Set history size
  const setHistorySize = async (newSize) => {
    if (!contract || !address) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.setHistorySize(newSize);
      await tx.wait();
      toast.success('History size updated successfully!');
      await fetchGameData();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    currentGame,
    playerStats,
    previousBets,
    requestDetails,
    gameState,
    playDice,
    resolveGame,
    setHistorySize,
    refreshGameData: fetchGameData
  };
} 