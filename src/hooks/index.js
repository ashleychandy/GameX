import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { handleError, handleContractError } from '../utils/errorHandling';
import { formatAmount, validateGameData, validateAmount } from '../utils/helpers';
import { UI_STATES, GAME_STATES, ERROR_MESSAGES, NETWORKS } from '../utils/constants';
import { executeContractTransaction, executeContractCall } from '../utils/contractHelpers';
import { CONFIG } from '../config';

// Contract Hook
export function useContract(contractType) {
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { provider, signer, isConnected, chainId } = useWallet();

  const initializeContract = useCallback(async () => {
    if (!isConnected || !provider || !signer) {
      setContract(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const contractConfig = CONFIG.contracts[contractType];
      if (!contractConfig) {
        throw new Error(`Contract ${contractType} not configured`);
      }

      const code = await provider.getCode(contractConfig.address);
      if (code === '0x') {
        throw new Error(`Contract not deployed at ${contractConfig.address}`);
      }

      const contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer
      );

      setContract(contract);
    } catch (error) {
      setError(error.message);
      toast.error(`Failed to initialize ${contractType} contract: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [provider, signer, chainId, contractType, isConnected]);

  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  return { contract, isLoading, error };
}

// Dice Game Hook
export function useDiceGame() {
  const { signer, address } = useWallet();
  const { contract, isLoading: contractLoading, error: contractError } = useContract('dice');
  const [gameData, setGameData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [requestInfo, setRequestInfo] = useState(null);
  const [canStartGame, setCanStartGame] = useState(false);
  
  const [loadingStates, setLoadingStates] = useState({
    fetchingData: false,
    placingBet: false,
    resolving: false
  });

  const updateGameState = useCallback(async () => {
    if (!contract || !address || contractLoading || contractError) return;
    
    setLoadingStates(prev => ({ ...prev, fetchingData: true }));
    
    try {
      const [
        currentGame,
        stats,
        betsHistory,
        requestDetails,
        canStart
      ] = await Promise.all([
        contract.getCurrentGame(address),
        contract.getPlayerStats(address),
        contract.getPreviousBets(address),
        contract.getCurrentRequestDetails(address),
        contract.canStartNewGame(address)
      ]);

      setGameData({
        isActive: currentGame.isActive,
        chosenNumber: currentGame.chosenNumber.toString(),
        result: currentGame.result.toString(),
        amount: formatAmount(currentGame.amount),
        timestamp: currentGame.timestamp.toString(),
        payout: formatAmount(currentGame.payout),
        status: currentGame.status
      });

      setUserStats({
        winRate: formatAmount(stats.winRate),
        averageBet: formatAmount(stats.averageBet),
        totalGamesWon: stats.totalGamesWon.toString(),
        totalGamesLost: stats.totalGamesLost.toString()
      });

      setHistory(betsHistory.map(bet => ({
        chosenNumber: bet.chosenNumber.toString(),
        rolledNumber: bet.rolledNumber.toString(),
        amount: formatAmount(bet.amount),
        timestamp: bet.timestamp.toString()
      })));

      setRequestInfo({
        requestId: requestDetails.requestId.toString(),
        fulfilled: requestDetails.requestFulfilled,
        active: requestDetails.requestActive
      });

      setCanStartGame(canStart);
      
    } catch (error) {
      console.error('Error updating game state:', error);
      toast.error('Failed to update game state');
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingData: false }));
    }
  }, [contract, address, contractLoading, contractError]);

  const playDice = useCallback(async (chosenNumber, betAmount) => {
    if (!contract || !address || contractLoading || contractError) return;
    
    setLoadingStates(prev => ({ ...prev, placingBet: true }));
    
    try {
      const parsedAmount = validateAmount(betAmount, CONFIG.minBet, CONFIG.maxBet);
      const tx = await contract.playDice(chosenNumber, parsedAmount);
      
      toast.info('Transaction submitted...');
      await tx.wait();
      
      toast.success('Bet placed successfully!');
      await updateGameState();
    } catch (error) {
      handleContractError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, placingBet: false }));
    }
  }, [contract, address, contractLoading, contractError]);

  const resolveGame = useCallback(async () => {
    if (!contract || !address || contractLoading || contractError) return;
    
    setLoadingStates(prev => ({ ...prev, resolving: true }));
    
    try {
      const tx = await contract.resolveGame();
      toast.info('Resolving game...');
      
      await tx.wait();
      toast.success('Game resolved successfully!');
      await updateGameState();
    } catch (error) {
      handleContractError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, resolving: false }));
    }
  }, [contract, address, contractLoading, contractError]);

  // Auto-refresh game state
  useEffect(() => {
    if (!contract || !address) return;
    
    updateGameState();
    const interval = setInterval(updateGameState, 30000);
    return () => clearInterval(interval);
  }, [contract, address, updateGameState]);

  return {
    gameData,
    userStats,
    history,
    requestInfo,
    canStartGame,
    loadingStates,
    playDice,
    resolveGame,
    updateGameState
  };
}

// Game Events Hook
export function useGameEvents(onGameUpdate) {
  const { contract: dice, address } = useWallet();

  const setupEventListeners = useCallback(() => {
    if (!dice || !address) return;

    const gameStartedFilter = dice.filters.GameStarted(address);
    const gameCompletedFilter = dice.filters.GameCompleted(address);
    const gameCancelledFilter = dice.filters.GameCancelled(address);

    const handleGameStarted = (player, requestId, chosenNumber, amount, timestamp) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.info(
          `Bet placed: ${chosenNumber} for ${formatAmount(amount)} tokens`
        );
        onGameUpdate?.();
      }
    };

    const handleGameCompleted = (
      player,
      requestId,
      chosenNumber,
      rolledNumber,
      amount,
      payout,
      status,
      timestamp
    ) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        const statusText = GAME_STATES[status];
        const message = payout > 0
          ? `You won ${formatAmount(payout)} tokens!`
          : 'Better luck next time!';
        
        toast[payout > 0 ? 'success' : 'info'](message);
        onGameUpdate?.();
      }
    };

    const handleGameCancelled = (player, requestId, reason) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        toast.error(`Game cancelled: ${reason}`);
        onGameUpdate?.();
      }
    };

    dice.on(gameStartedFilter, handleGameStarted);
    dice.on(gameCompletedFilter, handleGameCompleted);
    dice.on(gameCancelledFilter, handleGameCancelled);

    return () => {
      dice.off(gameStartedFilter, handleGameStarted);
      dice.off(gameCompletedFilter, handleGameCompleted);
      dice.off(gameCancelledFilter, handleGameCancelled);
    };
  }, [dice, address, onGameUpdate]);

  useEffect(() => {
    const cleanup = setupEventListeners();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupEventListeners]);
}

// Admin Hook
export function useAdmin() {
  const { tokenContract: token, diceContract: dice, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTransaction = async (operation, successMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!token || !dice) {
        throw new Error('Contracts not initialized');
      }

      const tx = await operation();
      toast.info(`Transaction submitted: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success(successMessage);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      const { message } = handleContractError(error);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const mintTokens = useCallback(async (to, amount) => {
    if (!token) return;
    return handleTransaction(
      () => token.mint(to, ethers.parseEther(amount)),
      `Successfully minted ${amount} tokens to ${to}`
    );
  }, [token]);

  const setHouseEdge = useCallback(async (newEdge) => {
    if (!dice) return;
    return handleTransaction(
      () => dice.setHouseEdge(ethers.parseEther(newEdge)),
      `House edge updated to ${newEdge}%`
    );
  }, [dice]);

  const withdrawFunds = useCallback(async (amount) => {
    if (!dice) return;
    return handleTransaction(
      () => dice.withdrawFunds(ethers.parseEther(amount)),
      `Successfully withdrawn ${amount} tokens`
    );
  }, [dice]);

  return {
    isLoading,
    error,
    mintTokens,
    setHouseEdge,
    withdrawFunds
  };
}

// Game Approvals Hook
export function useGameApprovals(spenderAddress) {
  const { contracts: { token }, address } = useWallet();
  const [allowance, setAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);

  const fetchAllowance = useCallback(async () => {
    if (!token || !address || !spenderAddress) return;
    
    try {
      const result = await executeContractCall(
        token,
        'allowance',
        [address, spenderAddress]
      );
      setAllowance(result.toString());
    } catch (error) {
      console.error('Failed to fetch allowance:', error);
      toast.error('Failed to fetch token allowance');
    }
  }, [token, address, spenderAddress]);

  const checkAndApproveToken = useCallback(async (amount) => {
    if (!token || !address || !spenderAddress) {
      throw new Error('Token approval not available');
    }

    try {
      setIsApproving(true);
      const currentAllowance = ethers.BigNumber.from(allowance);
      const requiredAmount = validateAmount(amount, '0', CONFIG.maxBet);

      if (currentAllowance.lt(requiredAmount)) {
        const tx = await executeContractTransaction(
          token,
          'approve',
          [spenderAddress, ethers.constants.MaxUint256]
        );
        await tx.wait();
        await fetchAllowance();
        toast.success('Token approval successful');
      }
      return true;
    } catch (error) {
      toast.error('Failed to approve token');
      throw error;
    } finally {
      setIsApproving(false);
    }
  }, [token, address, spenderAddress, allowance, fetchAllowance]);

  useEffect(() => {
    fetchAllowance();
    
    if (token && address && spenderAddress) {
      const filter = token.filters.Approval(address, spenderAddress);
      token.on(filter, fetchAllowance);
      return () => token.off(filter, fetchAllowance);
    }
  }, [token, address, spenderAddress, fetchAllowance]);

  return {
    allowance,
    isApproving,
    checkAndApproveToken,
    refreshAllowance: fetchAllowance
  };
}

// Game Hook
export function useGame() {
  const { contract, address } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [previousBets, setPreviousBets] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [userData, setUserData] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [canStart, setCanStart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    gameData: false,
    betsHistory: false,
    userData: false,
    placingBet: false,
    cancellingGame: false,
    claimingPrize: false,
  });

  const fetchGameState = useCallback(async () => {
    if (!contract || !address) {
      setIsLoading(false);
      return;
    }

    let retries = 3;
    while (retries > 0) {
      try {
        setIsLoading(true);
        setError(null);

        const [
          currentGame,
          betsHistory,
          userData,
          requestInfo,
          canStart,
          hasPending,
          playerStats,
        ] = await Promise.all([
          contract.getCurrentGame(address),
          contract.getPreviousBets(address),
          contract.getUserData(address),
          contract.getCurrentRequestDetails(address),
          contract.canStartNewGame(address),
          contract.hasPendingRequest(address),
          contract.getPlayerStats(address),
        ]);

        setGameData(
          validateGameData({
            currentGame: {
              isActive: currentGame.isActive,
              chosenNumber: currentGame.chosenNumber.toString(),
              amount: formatAmount(currentGame.amount),
              timestamp: currentGame.timestamp.toString(),
              payout: formatAmount(currentGame.payout),
              randomWord: currentGame.randomWord.toString(),
              status: currentGame.status,
            },
            stats: {
              totalGames: userData.totalGames.toString(),
              totalBets: userData.totalBets.toString(),
              totalWin: userData.totalWin.toString(),
              totalLoss: userData.totalLoss.toString(),
              winRate: formatAmount(playerStats.winRate),
              averageBet: formatAmount(playerStats.averageBet),
              totalGamesWon: playerStats.totalGamesWon.toString(),
              totalGamesLost: playerStats.totalGamesLost.toString(),
            },
            previousBets: betsHistory.map((bet) => ({
              chosenNumber: bet.chosenNumber.toString(),
              rolledNumber: bet.rolledNumber.toString(),
              amount: formatAmount(bet.amount),
              timestamp: bet.timestamp.toString(),
            })),
          })
        );
        setPreviousBets(
          betsHistory.map((bet) => ({
            chosenNumber: bet.chosenNumber.toString(),
            rolledNumber: bet.rolledNumber.toString(),
            amount: formatAmount(bet.amount),
            timestamp: bet.timestamp.toString(),
          }))
        );
        setUserData({
          totalGames: userData.totalGames.toString(),
          totalBets: userData.totalBets.toString(),
          totalWin: userData.totalWin.toString(),
          totalLoss: userData.totalLoss.toString(),
        });
        setRequestDetails({
          requestId: requestInfo.requestId.toString(),
          fulfilled: requestInfo.requestFulfilled,
          active: requestInfo.requestActive,
        });
        setCanStart(canStart);
        setPendingRequest(hasPending);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("Error fetching game state:", error);
        retries--;
        if (retries === 0) {
          setError(error.message);
          toast.error("Failed to fetch game state");
          setIsLoading(false);
          return;
        }
      }
    }
  }, [contract, address]);

  const placeBet = useCallback(async (chosenNumber, betAmount) => {
    if (!contract || !address) return;
    setLoadingStates((prev) => ({ ...prev, placingBet: true }));
    try {
      const parsedAmount = validateAmount(
        betAmount,
        CONFIG.minBet,
        CONFIG.maxBet
      );
      const tx = await contract.playDice(chosenNumber, parsedAmount);
      toast.info("Transaction submitted...");
      await tx.wait();
      toast.success("Bet placed successfully!");
      await fetchGameState();
    } catch (error) {
      handleContractError(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, placingBet: false }));
    }
  }, [contract, address, fetchGameState]);

  const cancelGame = useCallback(async () => {
    if (!contract || !address) return;
    setLoadingStates((prev) => ({ ...prev, cancellingGame: true }));
    try {
      const tx = await contract.cancelGame();
      toast.info("Cancelling game...");
      await tx.wait();
      toast.success("Game cancelled successfully!");
      await fetchGameState();
    } catch (error) {
      handleContractError(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, cancellingGame: false }));
    }
  }, [contract, address, fetchGameState]);

  const claimPrize = useCallback(async () => {
    if (!contract || !address) return;
    setLoadingStates((prev) => ({ ...prev, claimingPrize: true }));
    try {
      const tx = await contract.claimPrize();
      toast.info("Claiming prize...");
      await tx.wait();
      toast.success("Prize claimed successfully!");
      await fetchGameState();
    } catch (error) {
      handleContractError(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, claimingPrize: false }));
    }
  }, [contract, address, fetchGameState]);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 30000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  return {
    gameData,
    previousBets,
    pendingRequest,
    userData,
    requestDetails,
    canStart,
    isLoading,
    error,
    loadingStates,
    placeBet,
    cancelGame,
    claimPrize
  };
}

// Utility Functions
export function formatAmount(amount) {
  return ethers.utils.formatEther(amount);
}

export function validateAmount(amount, min, max) {
  const parsedAmount = ethers.utils.parseEther(amount.toString());
  if (parsedAmount.lt(ethers.utils.parseEther(min))) {
    throw new Error(`Amount must be at least ${min} tokens`);
  }
  if (parsedAmount.gt(ethers.utils.parseEther(max))) {
    throw new Error(`Amount must be at most ${max} tokens`);
  }
  return parsedAmount;
}

export function validateGameData(data) {
  return {
    currentGame: {
      isActive: data.currentGame.isActive,
      chosenNumber: data.currentGame.chosenNumber,
      amount: data.currentGame.amount,
      timestamp: data.currentGame.timestamp,
      payout: data.currentGame.payout,
      randomWord: data.currentGame.randomWord,
      status: data.currentGame.status
    },
    stats: {
      totalGames: data.stats.totalGames,
      totalBets: data.stats.totalBets,
      totalWin: data.stats.totalWin,
      totalLoss: data.stats.totalLoss,
      winRate: data.stats.winRate,
      averageBet: data.stats.averageBet,
      totalGamesWon: data.stats.totalGamesWon,
      totalGamesLost: data.stats.totalGamesLost
    },
    previousBets: data.previousBets
  };
}

export function handleContractError(error) {
  const { message, code } = error;
  const errorMessage = ERROR_MESSAGES[code] || message;
  toast.error(errorMessage);
  return { message: errorMessage, code };
}