import { useCallback, useRef, useState, useEffect } from 'react';
import { useContract } from './useContract';
import { useWallet } from '../contexts/WalletContext';
import { handleError } from '../utils/errorHandling';
import { validateGameData } from '../utils/format';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

// Helper function to format amounts without decimals
const formatAmount = (amount) => {
  if (!amount) return '0';
  try {
    // If amount is already a string
    if (typeof amount === 'string') {
      // Remove any decimals and trailing zeros
      return amount.split('.')[0];
    }

    // If it's a BigNumber or numeric value from contract
    let formattedValue;
    try {
      formattedValue = ethers.formatEther(amount);
      // Remove any decimals
      return formattedValue.split('.')[0];
    } catch {
      // If formatEther fails, try parsing as regular number
      const value = (Number(amount) / 1e18).toString();
      return value.split('.')[0];
    }
  } catch (error) {
    console.error('Error formatting amount:', error, 'Value:', amount);
    return '0';
  }
};

// Helper function to parse amounts safely
const parseAmount = (amount) => {
  try {
    if (!amount) return ethers.parseEther('0');

    // Remove any commas, spaces, and decimals
    const cleanAmount = amount.toString()
      .replace(/,/g, '')
      .trim()
      .split('.')[0]; // Only take the whole number part
    
    // Ensure the amount is a valid number
    if (isNaN(cleanAmount)) {
      console.error('Invalid amount:', amount);
      return ethers.parseEther('0');
    }

    // Convert to Wei
    return ethers.parseEther(cleanAmount);
  } catch (error) {
    console.error('Error parsing amount:', error, 'Value:', amount);
    return ethers.parseEther('0');
  }
};

const CACHE_DURATION = 30000; // 30 seconds
const dataCache = new Map();

const getCachedData = async (key, fetchFn) => {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchFn();
  dataCache.set(key, { data, timestamp: Date.now() });
  return data;
};

const POLLING_INTERVAL = 5000;
let pollTimer = null;

const startPolling = (callback) => {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(callback, POLLING_INTERVAL);
  return () => clearInterval(pollTimer);
};

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

// Add VRF handling
const handleVRFFulfilled = useCallback(async (requestId) => {
  if (!contract || !address) return;

  try {
    const [currentRequestDetails] = await contract.getCurrentRequestDetails(address);
    if (currentRequestDetails.toString() === requestId.toString()) {
      await resolveGame();
    }
  } catch (error) {
    console.error('Error handling VRF fulfillment:', error);
  }
}, [contract, address, resolveGame]);

export function useGame() {
  const { contract, isValid } = useContract('dice');
  const { address, signer, chainId } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);

  // Add network validation
  const isCorrectNetwork = useCallback(() => {
    // Convert chainId to number for comparison if it's a BigInt
    const currentChainId = typeof chainId === 'bigint' ? Number(chainId) : chainId;
    return currentChainId === 11155111; // Sepolia testnet
  }, [chainId]);

  // Define fetchGameState first since it's used by other functions
  const fetchGameState = useCallback(async () => {
    if (!isValid || !contract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const [
        userData,
        requestDetails,
        previousBets,
        playerStats
      ] = await Promise.all([
        contract.getUserData(address),
        contract.getCurrentRequestDetails(address),
        contract.getPreviousBets(address),
        contract.getPlayerStats(address)
      ]);

      const gameState = {
        currentGame: {
          isActive: userData.currentGame.isActive,
          chosenNumber: userData.currentGame.chosenNumber.toString(),
          result: userData.currentGame.result.toString(),
          amount: formatAmount(userData.currentGame.amount),
          timestamp: userData.currentGame.timestamp.toString(),
          payout: formatAmount(userData.currentGame.payout),
          randomWord: userData.currentGame.randomWord.toString(),
          status: userData.currentGame.status
        },
        stats: {
          totalGames: userData.totalGames.toString(),
          totalBets: formatAmount(userData.totalBets),
          totalWinnings: formatAmount(userData.totalWinnings),
          totalLosses: formatAmount(userData.totalLosses),
          lastPlayed: userData.lastPlayed.toString(),
          winRate: calculateWinRate(userData.totalGames, userData.totalGamesWon),
          averageBet: formatAmount(playerStats.averageBet)
        },
        requestDetails: {
          requestId: requestDetails[0].toString(),
          requestFulfilled: requestDetails[1],
          requestActive: requestDetails[2]
        },
        previousBets: previousBets.map(bet => ({
          chosenNumber: bet.chosenNumber.toString(),
          rolledNumber: bet.rolledNumber.toString(),
          amount: formatAmount(bet.amount),
          timestamp: bet.timestamp.toString()
        }))
      };

      setGameData(gameState);
    } catch (error) {
      console.error("Error fetching game data:", error);
      setError(handleError(error));
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, isValid]);

  // Add helper function for win rate calculation
  const calculateWinRate = (totalGames, totalWins) => {
    if (!totalGames || !totalWins) return "0";
    const games = parseInt(totalGames.toString());
    const wins = parseInt(totalWins.toString());
    return games > 0 ? ((wins / games) * 100).toFixed(2) : "0";
  };

  // Initialize token contract
  useEffect(() => {
    if (signer && contract) {
      const getTokenContract = async () => {
        try {
          const tokenAddress = await contract.myToken();
          const TokenABI = (await import('../abi/Token.json')).default;
          setTokenContract(new ethers.Contract(tokenAddress, TokenABI.abi, signer));
        } catch (error) {
          console.error('Error initializing token contract:', error);
        }
      };
      getTokenContract();
    }
  }, [signer, contract]);

  // Fetch game data on mount and when address changes
  useEffect(() => {
    fetchGameState();
  }, [address, fetchGameState]);

  // Rest of the functions remain the same but moved after fetchGameState
  const checkAndApproveToken = useCallback(async (amount) => {
    if (!tokenContract || !contract || !address) return false;

    try {
      const amountInWei = parseAmount(amount);
      const allowance = await tokenContract.allowance(address, contract.target);
      
      // Use proper BigNumber comparison
      if (ethers.getBigInt(allowance.toString()) < ethers.getBigInt(amountInWei.toString())) {
        const tx = await tokenContract.approve(contract.target, amountInWei);
        toast.info('Approving tokens...');
        await tx.wait();
        toast.success('Token approval successful');
      }
      return true;
    } catch (error) {
      const { message } = handleError(error);
      toast.error(`Token approval failed: ${message}`);
      return false;
    }
  }, [tokenContract, contract, address]);

  // Update canSelectNumber to include network check
  const canSelectNumber = useCallback((number) => {
    if (!isCorrectNetwork()) {
      console.log('Wrong network');
      return false;
    }

    if (!contract || !address) {
      console.log('No contract or address');
      return false;
    }

    if (!gameData) {
      console.log('No game data, allowing selection');
      return true;
    }

    const noActiveGame = !gameData.currentGame.isActive;
    const isValidNumber = number >= 1 && number <= 6;

    console.log('Game state check:', {
      noActiveGame,
      isValidNumber,
      gameData: gameData.currentGame
    });

    return noActiveGame && isValidNumber;
  }, [gameData, contract, address, isCorrectNetwork]);

  // Add UI state tracking
  const [uiState, setUiState] = useState(UI_STATES.IDLE);

  // Update playDice function to handle UI states
  const playDice = useCallback(async (number, amount) => {
    if (!isCorrectNetwork()) {
      setUiState(UI_STATES.ERROR);
      throw new Error('Please connect to Sepolia network');
    }

    try {
      setUiState(UI_STATES.APPROVING);
      const approved = await checkAndApproveToken(amount);
      if (!approved) {
        setUiState(UI_STATES.ERROR);
        throw new Error('Token approval failed');
      }

      setUiState(UI_STATES.PLACING_BET);
      const tx = await contract.playDice(number, parseAmount(amount));
      toast.info('Placing bet...');
      await tx.wait();
      
      setUiState(UI_STATES.WAITING_FOR_RESULT);
      pollGameState();
      
      await fetchGameState();
      return tx;
    } catch (error) {
      setUiState(UI_STATES.ERROR);
      const { message } = handleError(error);
      toast.error(message);
      throw error;
    }
  }, [/* ... existing dependencies ... */]);

  // Update resolveGame to handle UI states
  const resolveGame = useCallback(async () => {
    try {
      setUiState(UI_STATES.RESOLVING);
      const tx = await contract.resolveGame();
      await tx.wait();
      await fetchGameState();
      setUiState(UI_STATES.COMPLETED);
      return tx;
    } catch (error) {
      setUiState(UI_STATES.ERROR);
      throw error;
    }
  }, [contract, fetchGameState]);

  const resetGame = useCallback(async () => {
    setGameData(null);
    setError(null);
    return fetchGameState();
  }, [fetchGameState]);

  const fetchPaginatedBets = useCallback(async (offset = 0, limit = 10) => {
    if (!contract || !address) return null;

    try {
      const [bets, total] = await contract.getPaginatedBets(address, offset, limit);
      return {
        bets: bets.map(bet => ({
          chosenNumber: bet.chosenNumber.toString(),
          rolledNumber: bet.rolledNumber.toString(),
          amount: formatAmount(bet.amount),
          timestamp: bet.timestamp.toString()
        })),
        total: total.toString()
      };
    } catch (error) {
      console.error('Error fetching paginated bets:', error);
      throw error;
    }
  }, [contract, address]);

  const refreshGameData = useCallback(async () => {
    return fetchGameState();
  }, [fetchGameState]);

  const handleContractError = (error) => {
    // Parse contract errors
    if (error.message.includes("GameError")) {
        const errorCode = error.data?.errorArgs?.[0] || "unknown";
        return new Error(`Game Error: ${GAME_ERROR_MESSAGES[errorCode]}`);
    }
    return error;
  };

  const pollGameResult = useCallback(async () => {
    if (!contract || !address) return;
    
    const pollInterval = setInterval(async () => {
        try {
            const gameStatus = await contract.getGameStatus(address);
            if (gameStatus.status === GAME_STATES.COMPLETED) {
                clearInterval(pollInterval);
                await refreshGameData();
            }
        } catch (error) {
            console.error('Error polling game result:', error);
            clearInterval(pollInterval);
        }
    }, 5000);
    
    return () => clearInterval(pollInterval);
}, [contract, address]);

  // Update the event listeners
  useEffect(() => {
    if (!contract || !address) return;

    const gameStartedFilter = contract.filters.GameStarted(address);
    const gameResolvedFilter = contract.filters.GameResolved(address);
    const vrfFulfilledFilter = contract.filters.RandomWordsFulfilled();

    const handleGameStarted = async (player, requestId, chosenNumber, amount) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        await fetchGameState();
        pollGameState();
      }
    };

    const handleGameResolved = async (player, requestId, chosenNumber, rolledNumber, payout) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        stopPolling();
        await fetchGameState();
        
        const won = ethers.getBigInt(payout) > 0;
        toast.success(
          won 
            ? `You won ${formatAmount(payout)} tokens!` 
            : 'Better luck next time!'
        );
      }
    };

    contract.on(gameStartedFilter, handleGameStarted);
    contract.on(gameResolvedFilter, handleGameResolved);
    contract.on(vrfFulfilledFilter, handleVRFFulfilled);

    return () => {
      contract.off(gameStartedFilter, handleGameStarted);
      contract.off(gameResolvedFilter, handleGameResolved);
      contract.off(vrfFulfilledFilter, handleVRFFulfilled);
      stopPolling();
    };
  }, [contract, address, fetchGameState, pollGameState, handleVRFFulfilled]);

  // Add this function to properly handle game state updates
  const pollGameState = useCallback(async () => {
    if (!contract || !address) return;
    
    const checkGameState = async () => {
      try {
        const [gameState, requestDetails] = await Promise.all([
          contract.getCurrentGame(address),
          contract.getCurrentRequestDetails(address)
        ]);

        if (requestDetails.requestFulfilled) {
          stopPolling();
          await resolveGame();
        }
      } catch (error) {
        console.error('Error polling game state:', error);
        stopPolling();
      }
    };

    return startPolling(checkGameState);
  }, [contract, address, resolveGame]);

  const handleGameResult = useCallback(async (result) => {
    try {
        const tx = await contract.resolveGame();
        await tx.wait();
        await fetchGameState();
        
        // Update UI based on game result
        const won = result.payout.gt(0);
        toast.success(won ? 'You won!' : 'Better luck next time!');
    } catch (error) {
        console.error('Error resolving game:', error);
        toast.error('Failed to resolve game');
    }
}, [contract, fetchGameState]);

  const recoverGameState = useCallback(async () => {
    if (!contract || !address) return;

    try {
        const gameState = await contract.getCurrentGame(address);
        if (gameState.isActive) {
            // If there's an active game, start polling
            startPolling();
        }
    } catch (error) {
        console.error('Error recovering game state:', error);
    }
}, [contract, address, startPolling]);

  useEffect(() => {
    recoverGameState();
  }, [recoverGameState]);

  useEffect(() => {
    const recoverState = async () => {
      if (!contract || !address) return;

      try {
        const [gameState, requestDetails] = await Promise.all([
          contract.getCurrentGame(address),
          contract.getCurrentRequestDetails(address)
        ]);

        if (gameState.isActive) {
          if (requestDetails.requestFulfilled) {
            // Game can be resolved
            await resolveGame();
          } else {
            // Game is waiting for VRF
            pollGameState();
          }
        }
      } catch (error) {
        console.error('Error recovering game state:', error);
      }
    };

    recoverState();
  }, [contract, address, resolveGame, pollGameState]);

  // Add UI helper functions
  const getUIState = useCallback(() => {
    if (error) return UI_STATES.ERROR;
    if (isLoading) return uiState;
    if (!gameData?.currentGame) return UI_STATES.IDLE;
    
    const { currentGame, requestDetails } = gameData;
    if (currentGame.isActive && !requestDetails.requestFulfilled) {
      return UI_STATES.WAITING_FOR_RESULT;
    }
    if (currentGame.isActive && requestDetails.requestFulfilled) {
      return UI_STATES.RESOLVING;
    }
    return UI_STATES.IDLE;
  }, [gameData, error, isLoading, uiState]);

  // Add loading state helpers
  const isActionDisabled = useCallback(() => {
    const state = getUIState();
    return state !== UI_STATES.IDLE && 
           state !== UI_STATES.SELECTING && 
           state !== UI_STATES.COMPLETED;
  }, [getUIState]);

  const getLoadingMessage = useCallback(() => {
    switch (getUIState()) {
      case UI_STATES.APPROVING:
        return 'Approving tokens...';
      case UI_STATES.PLACING_BET:
        return 'Placing bet...';
      case UI_STATES.WAITING_FOR_RESULT:
        return 'Waiting for random number...';
      case UI_STATES.RESOLVING:
        return 'Resolving game...';
      default:
        return '';
    }
  }, [getUIState]);

  // Add game status helpers
  const getGameStatus = useCallback(() => {
    if (!gameData?.currentGame) return null;
    
    const { currentGame, requestDetails } = gameData;
    return {
      isActive: currentGame.isActive,
      chosenNumber: currentGame.chosenNumber,
      betAmount: currentGame.amount,
      result: currentGame.result,
      payout: currentGame.payout,
      canResolve: currentGame.isActive && requestDetails.requestFulfilled,
      timestamp: currentGame.timestamp,
      requestId: requestDetails.requestId,
      status: currentGame.status
    };
  }, [gameData]);

  // Add bet validation helper
  const validateBet = useCallback((number, amount) => {
    if (!number || number < 1 || number > 6) {
      throw new Error('Please select a number between 1 and 6');
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      throw new Error('Please enter a valid bet amount');
    }

    const amountInWei = parseAmount(amount);
    if (amountInWei.lt(ethers.parseEther(GAME_CONFIG.MIN_BET))) {
      throw new Error(`Minimum bet amount is ${GAME_CONFIG.MIN_BET} tokens`);
    }

    return true;
  }, []);

  return {
    gameData,
    isLoading,
    error,
    fetchGameData: fetchGameState,
    playDice,
    resolveGame,
    resetGame,
    fetchPaginatedBets,
    checkAndApproveToken,
    formatAmount,
    parseAmount,
    canSelectNumber,
    isCorrectNetwork: isCorrectNetwork(),
    hasActiveGame: gameData?.currentGame?.isActive ?? false,
    isGameResolvable: !!(gameData?.currentGame?.isActive && gameData?.requestDetails?.requestFulfilled),
    currentGameStatus: gameData?.currentGame?.status ?? 0,
    getGameState: () => ({
      hasGameData: !!gameData,
      currentGame: gameData?.currentGame,
      requestDetails: gameData?.requestDetails,
      isLoading,
      error,
      network: {
        chainId,
        isCorrect: isCorrectNetwork()
      }
    }),
    uiState: getUIState(),
    isSelecting: getUIState() === UI_STATES.SELECTING,
    isApproving: getUIState() === UI_STATES.APPROVING,
    isPlacingBet: getUIState() === UI_STATES.PLACING_BET,
    isWaitingForResult: getUIState() === UI_STATES.WAITING_FOR_RESULT,
    isResolving: getUIState() === UI_STATES.RESOLVING,
    isCompleted: getUIState() === UI_STATES.COMPLETED,
    isError: getUIState() === UI_STATES.ERROR,
    canPlay: getUIState() === UI_STATES.IDLE || getUIState() === UI_STATES.SELECTING,
    canResolve: getUIState() === UI_STATES.RESOLVING,
    resetUIState: () => setUiState(UI_STATES.IDLE),
    isActionDisabled: isActionDisabled(),
    loadingMessage: getLoadingMessage(),
    isProcessing: getUIState() !== UI_STATES.IDLE && 
                  getUIState() !== UI_STATES.COMPLETED && 
                  getUIState() !== UI_STATES.ERROR,
    gameStatus: getGameStatus(),
    lastResult: getGameStatus()?.result,
    lastPayout: getGameStatus()?.payout,
    validateBet,
    getFormattedGameData: () => ({
      currentBet: gameData?.currentGame?.amount ? formatAmount(gameData.currentGame.amount) : '0',
      totalBets: gameData?.stats?.totalBets ? formatAmount(gameData.stats.totalBets) : '0',
      winRate: gameData?.stats?.winRate || '0',
      lastPlayed: gameData?.stats?.lastPlayed || '0',
      history: gameData?.previousBets || []
    }),
    networkStatus: {
      isCorrectNetwork: isCorrectNetwork(),
      chainId,
      requiredChainId: SUPPORTED_CHAIN_ID
    }
  };
}