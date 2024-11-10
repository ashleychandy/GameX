import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { GAME_STATES, POLLING_INTERVAL } from '../utils/constants';
import { useWallet } from '../contexts/WalletContext';
import { handleError, formatErrorMessage } from '../utils/errorHandling';
import { useContract } from './useContract';

export function useGame() {
  const { address, provider } = useWallet();
  const { contract, isValid } = useContract('dice');
  const { contract: tokenContract } = useContract('token');
  
  const [currentGame, setCurrentGame] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [previousBets, setPreviousBets] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [gameState, setGameState] = useState(GAME_STATES.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Safe contract call wrapper
  const safeContractCall = async (method, ...args) => {
    try {
      if (!contract || !isValid) return null;
      const result = await contract[method](...args);
      return result;
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      return null;
    }
  };

  // Enhanced data fetching with proper error handling
  const fetchGameData = useCallback(async () => {
    if (!contract || !address || !isValid) {
      resetGameState();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current game state with safe call
      const currentGameData = await safeContractCall('getCurrentGame', address);
      if (currentGameData) {
        setCurrentGame({
          isActive: currentGameData.isActive,
          chosenNumber: currentGameData.chosenNumber.toString(),
          result: currentGameData.result.toString(),
          amount: currentGameData.amount.toString(),
          timestamp: currentGameData.timestamp.toString(),
          payout: currentGameData.payout.toString(),
          randomWord: currentGameData.randomWord.toString(),
          status: currentGameData.status
        });
        setGameState(determineGameState(currentGameData));
      }

      // Get player stats with safe call
      const stats = await safeContractCall('getPlayerStats', address);
      if (stats) {
        setPlayerStats({
          winRate: stats.winRate.toString(),
          averageBet: stats.averageBet.toString(),
          totalGamesWon: stats.totalGamesWon.toString(),
          totalGamesLost: stats.totalGamesLost.toString()
        });
      }

      // Get bet history with safe call
      const history = await safeContractCall('getPreviousBets', address);
      if (Array.isArray(history)) {
        setPreviousBets(history.map(bet => ({
          chosenNumber: bet.chosenNumber.toString(),
          rolledNumber: bet.rolledNumber.toString(),
          amount: bet.amount.toString(),
          timestamp: bet.timestamp.toString()
        })));
      }

      // Get request details with safe call
      const requestData = await safeContractCall('getCurrentRequestDetails', address);
      if (requestData) {
        setRequestDetails({
          requestId: requestData.requestId.toString(),
          requestFulfilled: requestData.requestFulfilled,
          requestActive: requestData.requestActive
        });
      }

    } catch (error) {
      console.error('Error fetching game data:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, isValid, safeContractCall]);

  // Improved play dice function with proper error handling
  const playDice = async (chosenNumber, amount) => {
    if (!contract || !address || !isValid || !tokenContract) {
      toast.error('Please connect your wallet to play');
      return;
    }

    setIsLoading(true);
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      
      // Check allowance first
      const allowance = await tokenContract.allowance(address, contract.target);
      if (allowance < amountInWei) {
        // Request approval
        const approveTx = await tokenContract.approve(contract.target, amountInWei);
        await approveTx.wait();
        toast.success('Token approval successful');
      }

      // Make the play
      const tx = await contract.playDice(chosenNumber, amountInWei);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('Bet placed successfully!');
        await fetchGameData();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error playing dice:', error);
      toast.error(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Improved resolve game function
  const resolveGame = async () => {
    if (!contract || !address || !isValid) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await contract.resolveGame();
      await tx.wait();

      toast.success('Game resolved successfully!');
      await fetchGameData();
    } catch (error) {
      console.error('Error resolving game:', error);
      toast.error(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset game state utility
  const resetGameState = () => {
    setCurrentGame(null);
    setPlayerStats(null);
    setPreviousBets([]);
    setRequestDetails(null);
    setGameState(GAME_STATES.PENDING);
    setError(null);
  };

  // Modified polling logic with better error handling
  useEffect(() => {
    let mounted = true;
    let interval;
    let errorCount = 0;
    const MAX_ERRORS = 3;
    const BACKOFF_TIME = 5000;

    const pollGameData = async () => {
      if (!mounted || !contract || !address || !isValid) return;

      try {
        await fetchGameData();
        errorCount = 0;
      } catch (error) {
        errorCount++;
        console.error(`Polling error (${errorCount}/${MAX_ERRORS}):`, error);
        
        if (errorCount >= MAX_ERRORS) {
          console.error('Max polling errors reached, stopping polling');
          clearInterval(interval);
          if (mounted) {
            setTimeout(() => {
              errorCount = 0;
              if (mounted) {
                interval = setInterval(pollGameData, POLLING_INTERVAL);
              }
            }, BACKOFF_TIME);
          }
        }
      }
    };

    if (contract && address && isValid) {
      pollGameData();
      interval = setInterval(pollGameData, POLLING_INTERVAL);
    }

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [contract, address, isValid, fetchGameData]);

  return {
    currentGame,
    playerStats,
    previousBets,
    requestDetails,
    gameState,
    isLoading,
    error,
    playDice,
    resolveGame,
    refreshGameData: fetchGameData
  };
}

// Helper function to determine game state
const determineGameState = (gameData) => {
  if (!gameData?.isActive) return GAME_STATES.PENDING;
  
  switch(gameData.status) {
    case 0: return GAME_STATES.PENDING;
    case 1: return GAME_STATES.STARTED;
    case 2: return GAME_STATES.COMPLETED_WIN;
    case 3: return GAME_STATES.COMPLETED_LOSS;
    case 4: return GAME_STATES.CANCELLED;
    default: return GAME_STATES.PENDING;
  }
};