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
  
  const [gameData, setGameData] = useState({
    currentGame: {
      isActive: false,
      chosenNumber: '0',
      result: '0',
      amount: '0',
      timestamp: '0',
      payout: '0',
      randomWord: '0',
      status: GAME_STATES.PENDING
    },
    playerStats: {
      winRate: '0',
      averageBet: '0',
      totalGamesWon: '0',
      totalGamesLost: '0'
    },
    previousBets: [],
    requestDetails: {
      requestId: '0',
      requestFulfilled: false,
      requestActive: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced contract validation
  const validateContract = useCallback(() => {
    if (!contract || !isValid) {
      console.debug('Contract not initialized:', {
        hasContract: !!contract,
        isValid,
        address: contract?.target
      });
      return false;
    }

    // Verify required methods exist
    const requiredMethods = [
      'getCurrentGame',
      'getPlayerStats',
      'getPreviousBets',
      'getCurrentRequestDetails',
      'playDice'
    ];

    // Check if contract interface exists before filtering
    if (!contract.interface) {
      console.error('Contract interface is undefined');
      return false;
    }

    const missingMethods = requiredMethods.filter(
      method => !contract.interface.hasFunction(method)
    );

    if (missingMethods.length > 0) {
      console.error('Missing required contract methods:', missingMethods);
      return false;
    }

    return true;
  }, [contract, isValid]);

  // Enhanced data fetching with better error handling
  const fetchGameData = useCallback(async () => {
    if (!validateContract() || !address) {
      console.debug('Skipping fetchGameData - contract not ready or no address');
      setGameData(prev => ({...prev, gameState: GAME_STATES.PENDING}));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Wrap each call in a try-catch to handle individual failures
      const [currentGameData, stats, history, requestData] = await Promise.all([
        contract.getCurrentGame(address).catch(err => {
          console.error('Error fetching current game:', err);
          return null;
        }),
        contract.getPlayerStats(address).catch(err => {
          console.error('Error fetching player stats:', err);
          return null;
        }),
        contract.getPreviousBets(address).catch(err => {
          console.error('Error fetching previous bets:', err);
          return [];
        }),
        contract.getCurrentRequestDetails(address).catch(err => {
          console.error('Error fetching request details:', err);
          return null;
        })
      ]);

      // Process results with null checks
      setGameData({
        currentGame: currentGameData ? {
          isActive: currentGameData.isActive ?? false,
          chosenNumber: currentGameData.chosenNumber?.toString() || '0',
          result: currentGameData.result?.toString() || '0',
          amount: currentGameData.amount?.toString() || '0',
          timestamp: currentGameData.timestamp?.toString() || '0',
          payout: currentGameData.payout?.toString() || '0',
          randomWord: currentGameData.randomWord?.toString() || '0',
          status: currentGameData.status ?? GAME_STATES.PENDING
        } : null,
        playerStats: stats ? {
          winRate: stats.winRate?.toString() || '0',
          averageBet: stats.averageBet?.toString() || '0',
          totalGamesWon: stats.totalGamesWon?.toString() || '0',
          totalGamesLost: stats.totalGamesLost?.toString() || '0'
        } : null,
        previousBets: Array.isArray(history) ? history.map(bet => ({
          chosenNumber: bet.chosenNumber?.toString() || '0',
          rolledNumber: bet.rolledNumber?.toString() || '0',
          amount: bet.amount?.toString() || '0',
          timestamp: bet.timestamp?.toString() || '0'
        })) : [],
        requestDetails: requestData ? {
          requestId: requestData.requestId?.toString() || '0',
          requestFulfilled: !!requestData.requestFulfilled,
          requestActive: !!requestData.requestActive
        } : null
      });

    } catch (error) {
      console.error('Error fetching game data:', error);
      setError(formatErrorMessage(error));
      setGameData(prev => ({
        ...prev,
        gameState: GAME_STATES.ERROR
      }));
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, validateContract]);

  // Improved play dice function
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
        const approveTx = await tokenContract.approve(contract.target, amountInWei);
        await approveTx.wait();
        toast.success('Token approval successful');
      }

      const tx = await contract.playDice(chosenNumber, amountInWei);
      await tx.wait();
      
      toast.success('Bet placed successfully!');
      await fetchGameData(); // Refresh data after successful bet
    } catch (error) {
      console.error('Error playing dice:', error);
      toast.error(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced polling with error handling and backoff
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
        // Reset error count on successful call
        errorCount = 0;
      } catch (error) {
        errorCount++;
        console.error(`Polling error (${errorCount}/${MAX_ERRORS}):`, error);
        
        // If we hit max errors, back off and try again later
        if (errorCount >= MAX_ERRORS) {
          if (interval) clearInterval(interval);
          if (mounted) {
            toast.error('Connection issues detected. Retrying in 5 seconds...');
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
      if (interval) clearInterval(interval);
    };
  }, [contract, address, isValid, fetchGameData]);

  // Add missing contract interactions
  const resolveGame = async () => {
    if (!contract || !address || !isValid) {
      throw new Error('Contract not initialized');
    }

    return safeContractCall('resolveGame');
  };

  const checkCanPlay = async () => {
    if (!contract || !address || !isValid) return false;
    return safeContractCall('canStartNewGame', address);
  };

  // Add a safe contract call helper
  const safeContractCall = async (method, ...args) => {
    if (!validateContract()) {
      throw new Error('Contract not initialized');
    }
    try {
      return await contract[method](...args);
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      throw error;
    }
  };

  return {
    gameData,
    playDice,
    resolveGame,
    checkCanPlay,
    isLoading,
    error,
    fetchGameData,
    isContractValid: validateContract()
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