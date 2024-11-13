import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { handleError, handleContractError } from '../utils/errorHandling';
import { formatAmount, validateGameData } from '../utils/helpers';
import { UI_STATES, GAME_STATUS, ERROR_MESSAGES, NETWORKS } from '../utils/constants';
import { executeContractTransaction, executeContractCall } from '../utils/contractHelpers';
import { CONFIG } from '../config';

// Auth Hook
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = useCallback(async (credentials) => {
    try {
      // API call logic here
      setIsAuthenticated(true);
      setUser({ /* user data */ });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    user,
    login,
    logout
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
    claimingPrize: false
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
          playerStats
        ] = await Promise.all([
          contract.getCurrentGame(address),
          contract.getPreviousBets(address),
          contract.getUserData(address),
          contract.getCurrentRequestDetails(address),
          contract.canStartNewGame(address),
          contract.hasPendingRequest(address),
          contract.getPlayerStats(address)
        ]);

        setGameData({
          isActive: currentGame.isActive,
          chosenNumber: currentGame.chosenNumber.toString(),
          amount: currentGame.amount.toString(),
          timestamp: currentGame.timestamp.toString(),
          payout: currentGame.payout.toString(),
          randomWord: currentGame.randomWord.toString(),
          status: currentGame.status
        });

        setPreviousBets(betsHistory.map(bet => ({
          chosenNumber: bet.chosenNumber.toString(),
          rolledNumber: bet.rolledNumber.toString(),
          amount: bet.amount.toString(),
          timestamp: bet.timestamp.toString()
        })));

        setUserData({
          totalGames: userData.totalGames.toString(),
          totalBets: userData.totalBets.toString(),
          totalWinnings: userData.totalWinnings.toString(),
          totalLosses: userData.totalLosses.toString(),
          lastPlayed: userData.lastPlayed.toString(),
          winRate: playerStats.winRate.toString(),
          averageBet: playerStats.averageBet.toString(),
          totalGamesWon: playerStats.totalGamesWon.toString(),
          totalGamesLost: playerStats.totalGamesLost.toString()
        });

        setRequestDetails({
          requestId: requestInfo.requestId.toString(),
          requestFulfilled: requestInfo.requestFulfilled,
          requestActive: requestInfo.requestActive
        });

        setCanStart(canStart);
        setPendingRequest(hasPending);
        break;
      } catch (error) {
        console.error('Error fetching game state:', error);
        retries--;
        if (retries === 0) {
          setError('Failed to fetch game state');
          setGameData(null);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [contract, address]);

  const placeBet = useCallback(async (number, amount) => {
    if (!contract || !address) return;

    try {
      setLoadingStates(prev => ({ ...prev, placingBet: true }));
      
      const parsedAmount = ethers.parseEther(amount.toString());
      
      if (parsedAmount.lte(0)) {
        throw new Error('Bet amount must be greater than 0');
      }

      const tx = await contract.placeBet(number, parsedAmount);
      await tx.wait();
      
      await fetchGameState();
    } catch (error) {
      const { message } = handleContractError(error);
      throw new Error(message);
    } finally {
      setLoadingStates(prev => ({ ...prev, placingBet: false }));
    }
  }, [contract, address, fetchGameState]);

  const resolveGame = useCallback(async () => {
    if (!contract || !address) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, resolvingGame: true }));
      
      const tx = await contract.resolveGame();
      toast.info('Resolving game...');
      
      await tx.wait();
      toast.success('Game resolved successfully!');
      
      await fetchGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setLoadingStates(prev => ({ ...prev, resolvingGame: false }));
    }
  }, [contract, address, fetchGameState]);

  const recoverStuckGame = useCallback(async () => {
    if (!contract || !address) return;

    try {
      setLoadingStates(prev => ({ ...prev, recoveringGame: true }));
      
      const tx = await contract.recoverStuckGame(address);
      toast.info('Recovering game...');
      
      await tx.wait();
      toast.success('Game recovered successfully!');
      
      await fetchGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setLoadingStates(prev => ({ ...prev, recoveringGame: false }));
    }
  }, [contract, address, fetchGameState]);

  useEffect(() => {
    if (!contract || !address) return;

    const filters = [
      contract.filters.GameStarted(address),
      contract.filters.GameCompleted(address),
      contract.filters.GameCancelled(address)
    ];

    const handleGameEvent = () => {
      fetchGameState();
    };

    filters.forEach(filter => {
      contract.on(filter, handleGameEvent);
    });

    return () => {
      filters.forEach(filter => {
        contract.off(filter, handleGameEvent);
      });
    };
  }, [contract, address, fetchGameState]);

  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  useEffect(() => {
    if (gameData?.isActive || pendingRequest) {
      const interval = setInterval(fetchGameState, 5000);
      return () => clearInterval(interval);
    }
  }, [gameData?.isActive, pendingRequest, fetchGameState]);

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
    resolveGame,
    recoverStuckGame,
    refreshGameState: fetchGameState
  };
}

// Token Approval Hook
export function useTokenApproval(spenderAddress) {
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
      const requiredAmount = ethers.parseEther(amount.toString());

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

// Network Hook
export function useNetwork() {
  const { provider, isConnected } = useWallet();
  const [chainId, setChainId] = useState(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  useEffect(() => {
    if (!provider || !isConnected) return;

    const handleChainChanged = (newChainId) => {
      setChainId(Number(newChainId));
      setIsCorrectChain(Number(newChainId) === CONFIG.network.chainId);
    };

    provider.getNetwork().then(network => {
      handleChainChanged(network.chainId);
    });

    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider, isConnected]);

  const switchToCorrectNetwork = useCallback(async () => {
    if (!provider) return;

    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${CONFIG.network.chainId.toString(16)}` }
      ]);
      toast.success('Successfully switched network');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, [provider]);

  return {
    chainId,
    isCorrectChain,
    switchToCorrectNetwork
  };
}

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

// Game History Hook
export function useGameHistory() {
  const { address } = useWallet();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`game_history_${address}`);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    }
  }, [address]);

  const addToHistory = useCallback((game) => {
    if (!address) return;
    
    setHistory(prev => {
      const updated = [game, ...prev].slice(0, 50);
      localStorage.setItem(`game_history_${address}`, JSON.stringify(updated));
      return updated;
    });
  }, [address]);

  const clearHistory = useCallback(() => {
    if (!address) return;
    
    localStorage.removeItem(`game_history_${address}`);
    setHistory([]);
  }, [address]);

  return {
    history,
    addToHistory,
    clearHistory
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

    const handleGameStarted = (player, requestId, chosenNumber, amount) => {
      toast.info(`Bet placed: ${chosenNumber} for ${formatAmount(amount)} tokens`);
      onGameUpdate?.();
    };

    const handleGameCompleted = (player, result, payout) => {
      const won = payout > 0;
      toast.success(
        won ? `You won ${formatAmount(payout)} tokens!` : 'Better luck next time!'
      );
      onGameUpdate?.();
    };

    const handleGameCancelled = (player, requestId, reason) => {
      toast.error(`Game cancelled: ${reason}`);
      onGameUpdate?.();
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
      const { message } = handleError(error);
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

// Notifications Hook
export function useNotifications() {
  const notify = useCallback((message, type = 'info') => {
    const options = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch(type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      default:
        toast.info(message, options);
    }
  }, []);

  return { notify };
}

// useGameTransactions
const useGameTransactions = () => {
  const { contract } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeGameTransaction = async (method, args = [], options = {}) => {
    setIsProcessing(true);
    try {
      const tx = await contract[method](...args, options);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      throw handleContractError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, executeGameTransaction };
};

// Add these to index.js

// 1. useGamePolling
export function useGamePolling(callback, interval = 5000, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, interval, enabled]);
}

// 2. useGameSettings
export function useGameSettings() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notifications: true,
    autoRefresh: true,
    theme: 'light'
  });

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('gameSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  return { settings, updateSettings };
}

// 3. useGameTransactions
export function useGameTransactions() {
  const { contract } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeGameTransaction = async (method, args = [], options = {}) => {
    setIsProcessing(true);
    try {
      const tx = await contract[method](...args, options);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      throw handleContractError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, executeGameTransaction };
}

// 4. useLocalStorage
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// 5. useSound
export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const playSound = useCallback((soundType) => {
    if (!isMuted) {
      // Sound playing logic
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.volume = volume;
      audio.play();
    }
  }, [isMuted, volume]);

  return { isMuted, setIsMuted, volume, setVolume, playSound };
}

// 6. useTheme
export function useTheme() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) {
      setTheme(stored);
    }
  }, []);

  return { theme, toggleTheme };
}

// 7. useToken
export function useToken() {
  const { contracts: { token }, address } = useWallet();
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!token || !address) return;
    
    try {
      setIsLoading(true);
      const balance = await token.balanceOf(address);
      setBalance(balance.toString());
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, address]);

  useEffect(() => {
    fetchBalance();
    
    if (token && address) {
      const filter = token.filters.Transfer(null, address);
      token.on(filter, fetchBalance);
      return () => token.off(filter, fetchBalance);
    }
  }, [token, address, fetchBalance]);

  return { balance, isLoading, refreshBalance: fetchBalance };
}

// 8. useContractInteraction
export function useContractInteraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const executeTransaction = async (contractMethod, args = [], options = {}) => {
    setIsProcessing(true);
    try {
      const tx = await contractMethod(...args, options);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      throw handleContractError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, executeTransaction };
}

// 9. useContractState
export function useContractState() {
  const [state, setState] = useState(null);
  const stateRef = useRef(null);

  const updateState = useCallback((newState) => {
    stateRef.current = newState;
    setState(newState);
  }, []);

  return { state, updateState, stateRef };
}

// Export all hooks
export {
  useAuth,
  useGame,
  useGamePolling,
  useGameSettings,
  useGameTransactions,
  useLocalStorage,
  useNetwork,
  useNotifications,
  useSound,
  useTheme,
  useToken,
  useTokenApproval,
  useContract,
  useContractEvents,
  useContractInteraction,
  useContractState,
  useGameHistory
}; 