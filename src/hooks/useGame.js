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
    currentGame: null,
    playerStats: null,
    previousBets: [],
    requestDetails: null,
    gameState: GAME_STATES.PENDING
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add debug logging for contract initialization
  useEffect(() => {
    console.debug('Contract state updated:', {
      hasContract: !!contract,
      isValid,
      contractAddress: contract?.target,
      hasInterface: !!contract?.interface,
      hasFunctions: !!contract?.interface?.functions,
      availableMethods: contract?.interface ? Object.keys(contract.interface.functions || {}) : []
    });
  }, [contract, isValid]);

  // Safe contract call wrapper with better error handling
  const safeContractCall = async (method, ...args) => {
    try {
      if (!contract || !isValid) {
        console.debug(`Contract not initialized for ${method}`, { 
          contract: !!contract,
          isValid,
          address: contract?.target
        });
        throw new Error('Contract not initialized');
      }

      // Log contract state
      console.debug(`Calling ${method}`, {
        contractAddress: contract.target,
        args,
        signer: await contract.signer.getAddress(),
        provider: contract.provider.connection.url
      });

      // Verify method exists on contract
      if (typeof contract[method] !== 'function') {
        console.error(`Method ${method} not found on contract`);
        throw new Error(`Method ${method} does not exist on contract`);
      }

      try {
        // Add gas estimation for debugging
        const gasEstimate = await contract.estimateGas[method](...args);
        console.debug(`Gas estimate for ${method}:`, gasEstimate.toString());

        const result = await contract[method](...args);
        console.debug(`${method} result:`, result);
        return result;
      } catch (error) {
        // Enhanced error handling
        if (error.code === 'CALL_EXCEPTION') {
          const reason = error.reason || error.data?.message || 'Contract call failed';
          console.error(`Contract call failed for ${method}:`, {
            error,
            args,
            contractAddress: contract.target,
            errorData: error.data
          });
          throw new Error(`${method} failed: ${reason}`);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      throw error;
    }
  };

  // Enhanced data fetching with better error handling
  const fetchGameData = useCallback(async () => {
    if (!contract || !address || !isValid) {
      console.debug('Prerequisites not met:', { 
        hasContract: !!contract, 
        address, 
        isValid,
        contractState: contract ? {
          target: contract.target,
          hasInterface: !!contract.interface,
          hasFunctions: !!contract.interface?.functions
        } : null
      });
      setGameData(prev => ({...prev, gameState: GAME_STATES.PENDING}));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate contract interface before proceeding
      if (!contract.interface || !contract.interface.functions) {
        console.error('Contract interface not properly initialized:', {
          hasInterface: !!contract.interface,
          hasFunctions: !!contract.interface?.functions
        });
        throw new Error('Contract interface not properly initialized');
      }

      // Log contract state with safe access
      console.debug('Contract state:', {
        address: contract.target,
        provider: contract.provider?.connection?.url,
        signer: await contract.signer?.getAddress(),
        methods: Object.keys(contract.interface.functions || {})
      });

      // Verify required methods exist
      const requiredMethods = ['getGameStatus', 'getPlayerStats', 'getPreviousBets', 'getCurrentRequestDetails'];
      const missingMethods = requiredMethods.filter(method => !contract.interface.functions[method]);
      
      if (missingMethods.length > 0) {
        console.error('Missing required contract methods:', missingMethods);
        throw new Error(`Missing required contract methods: ${missingMethods.join(', ')}`);
      }

      const [currentGameData, stats, history, requestData] = await Promise.allSettled([
        safeContractCall('getGameStatus', address),
        safeContractCall('getPlayerStats', address),
        safeContractCall('getPreviousBets', address),
        safeContractCall('getCurrentRequestDetails', address)
      ]);

      // Process results handling potential failures
      setGameData({
        currentGame: currentGameData.status === 'fulfilled' && currentGameData.value ? {
          isActive: currentGameData.value.isActive,
          chosenNumber: currentGameData.value.chosenNumber.toString(),
          amount: currentGameData.value.amount.toString(),
          timestamp: currentGameData.value.timestamp.toString(),
          status: currentGameData.value.status
        } : null,
        playerStats: stats.status === 'fulfilled' && stats.value ? {
          winRate: stats.value.winRate.toString(),
          averageBet: stats.value.averageBet.toString(),
          totalGamesWon: stats.value.totalGamesWon.toString(),
          totalGamesLost: stats.value.totalGamesLost.toString()
        } : null,
        previousBets: history.status === 'fulfilled' && Array.isArray(history.value) ? 
          history.value.map(bet => ({
            chosenNumber: bet.chosenNumber.toString(),
            rolledNumber: bet.rolledNumber.toString(),
            amount: bet.amount.toString(),
            timestamp: bet.timestamp.toString()
          })) : [],
        requestDetails: requestData.status === 'fulfilled' && requestData.value ? {
          requestId: requestData.value.requestId.toString(),
          requestFulfilled: requestData.value.requestFulfilled,
          requestActive: requestData.value.requestActive
        } : null,
        gameState: currentGameData.status === 'fulfilled' && currentGameData.value ? 
          determineGameState(currentGameData.value) : GAME_STATES.PENDING
      });

    } catch (error) {
      console.error('Error fetching game data:', error);
      setError(formatErrorMessage(error));
      setGameData(prev => ({
        ...prev,
        gameState: GAME_STATES.ERROR,
        currentGame: null,
        playerStats: null,
        previousBets: [],
        requestDetails: null
      }));
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, isValid]);

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

  return {
    ...gameData,
    isLoading,
    error,
    playDice,
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