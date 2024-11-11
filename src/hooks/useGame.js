import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { useTokenApproval } from './useTokenApproval';
import { gameConfig } from '../config';
import { UI_STATES, GAME_STATUS } from '../utils/constants';
import { handleError, handleContractError } from '../utils/errorHandling';
import { useContract } from './useContract';

export function useGame() {
  const { contract, address } = useWallet();
  const { checkAndApproveToken } = useTokenApproval();
  
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

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

        let currentGame;
        try {
          currentGame = await contract.getCurrentGame(address);
        } catch (error) {
          console.error('Error fetching current game:', error);
          currentGame = {
            isActive: false,
            chosenNumber: ethers.BigNumber.from(0),
            result: ethers.BigNumber.from(0),
            amount: ethers.BigNumber.from(0),
            timestamp: ethers.BigNumber.from(0),
            payout: ethers.BigNumber.from(0),
            randomWord: ethers.BigNumber.from(0),
            status: 0
          };
        }

        const [
          betsHistory,
          userData,
          requestInfo,
          canStartNew,
          hasPending,
          playerStats
        ] = await Promise.all([
          contract.getPreviousBets(address).catch(() => []),
          contract.getUserData(address).catch(() => ({
            totalGames: ethers.BigNumber.from(0),
            totalBets: ethers.BigNumber.from(0),
            totalWinnings: ethers.BigNumber.from(0),
            totalLosses: ethers.BigNumber.from(0),
            lastPlayed: ethers.BigNumber.from(0)
          })),
          contract.getCurrentRequestDetails(address).catch(() => ({
            requestId: ethers.BigNumber.from(0),
            requestFulfilled: false,
            requestActive: false
          })),
          contract.canStartNewGame(address).catch(() => false),
          contract.hasPendingRequest(address).catch(() => false),
          contract.getPlayerStats(address).catch(() => ({
            winRate: ethers.BigNumber.from(0),
            averageBet: ethers.BigNumber.from(0),
            totalGamesWon: ethers.BigNumber.from(0),
            totalGamesLost: ethers.BigNumber.from(0)
          }))
        ]);

        const gameState = {
          isActive: Boolean(currentGame.isActive),
          chosenNumber: currentGame.chosenNumber.toString(),
          result: currentGame.result.toString(),
          amount: currentGame.amount.toString(),
          timestamp: currentGame.timestamp.toString(),
          payout: currentGame.payout.toString(),
          randomWord: currentGame.randomWord.toString(),
          status: currentGame.status
        };

        const transformedUserData = {
          totalGames: userData.totalGames.toString(),
          totalBets: userData.totalBets.toString(),
          totalWinnings: userData.totalWinnings.toString(),
          totalLosses: userData.totalLosses.toString(),
          lastPlayed: userData.lastPlayed.toString(),
          winRate: playerStats.winRate.toString(),
          averageBet: playerStats.averageBet.toString(),
          totalGamesWon: playerStats.totalGamesWon.toString(),
          totalGamesLost: playerStats.totalGamesLost.toString()
        };

        const transformedRequestDetails = {
          requestId: requestInfo.requestId.toString(),
          requestFulfilled: Boolean(requestInfo.requestFulfilled),
          requestActive: Boolean(requestInfo.requestActive)
        };

        const transformedBets = betsHistory.map(bet => ({
          chosenNumber: bet.chosenNumber.toString(),
          rolledNumber: bet.rolledNumber.toString(),
          amount: bet.amount.toString(),
          timestamp: bet.timestamp.toString()
        }));

        setGameData(gameState);
        setPreviousBets(transformedBets);
        setUserData(transformedUserData);
        setRequestDetails(transformedRequestDetails);
        setCanStart(canStartNew);
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

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        if (!mounted) return;
        await fetchGameState();
      } catch (error) {
        if (mounted) {
          const { message } = handleError(error);
          setError(message);
        }
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [fetchGameState]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const placeBet = async (number, amount) => {
    if (!contract || !address) return;

    try {
      setIsLoading(true);
      
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
      setIsLoading(false);
    }
  };

  const resolveGame = async () => {
    if (!contract || !address) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, resolvingGame: true }));
      
      const tx = await contract.resolveGame();
      toast.info('Resolving game... Please wait for confirmation');
      
      await tx.wait();
      toast.success('Game resolved successfully!');
      
      await fetchGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setLoadingStates(prev => ({ ...prev, resolvingGame: false }));
    }
  };

  const recoverStuckGame = async () => {
    if (!contract || !address) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, recoveringGame: true }));
      
      const tx = await contract.recoverStuckGame(address);
      toast.info('Recovering stuck game... Please wait for confirmation');
      
      await tx.wait();
      toast.success('Game recovered successfully!');
      
      await fetchGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setLoadingStates(prev => ({ ...prev, recoveringGame: false }));
    }
  };

  const claimPrize = async () => {
    if (!contract || !address) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, claimingPrize: true }));
      
      const tx = await contract.claimPrize();
      toast.info('Claiming prize... Please wait for confirmation');
      
      await tx.wait();
      toast.success('Prize claimed successfully!');
      
      await fetchGameState();
    } catch (error) {
      const { message } = handleError(error);
      toast.error(message);
    } finally {
      setLoadingStates(prev => ({ ...prev, claimingPrize: false }));
    }
  };

  const getGameStats = async () => {
    if (!contract) return null;
    
    try {
      const stats = await contract.getGameStats();
      return {
        totalGames: stats.totalGames.toString(),
        totalBets: stats.totalBets.toString(),
        totalVolume: ethers.utils.formatEther(stats.totalVolume),
        totalPrizesPaid: ethers.utils.formatEther(stats.totalPrizesPaid)
      };
    } catch (error) {
      const { message } = handleError(error);
      console.error('Failed to fetch game stats:', message);
      return null;
    }
  };

  const getHouseEdge = async () => {
    if (!contract) return null;
    
    try {
      const edge = await contract.getHouseEdge();
      return edge.toString();
    } catch (error) {
      console.error('Failed to fetch house edge:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!contract) return;

    const betPlacedFilter = contract.filters.BetPlaced(address);
    const gameCompletedFilter = contract.filters.GameCompleted(address);
    const gameCancelledFilter = contract.filters.GameCancelled(address);
    const prizeClaimedFilter = contract.filters.PrizeClaimed(address);

    const handleBetPlaced = (player, requestId) => {
      toast.info(`Bet placed! Request ID: ${requestId}`);
      fetchGameState();
    };

    const handleGameCompleted = (player, result, payout) => {
      const formattedPayout = ethers.utils.formatEther(payout);
      toast.success(`Game completed! Result: ${result}, Payout: ${formattedPayout} tokens`);
      fetchGameState();
    };

    const handleGameCancelled = () => {
      toast.info('Game cancelled');
      fetchGameState();
    };

    const handlePrizeClaimed = (player, amount) => {
      toast.success(`Prize claimed: ${ethers.utils.formatEther(amount)} tokens`);
      fetchGameState();
    };

    contract.on(betPlacedFilter, handleBetPlaced);
    contract.on(gameCompletedFilter, handleGameCompleted);
    contract.on(gameCancelledFilter, handleGameCancelled);
    contract.on(prizeClaimedFilter, handlePrizeClaimed);

    return () => {
      contract.off(betPlacedFilter, handleBetPlaced);
      contract.off(gameCompletedFilter, handleGameCompleted);
      contract.off(gameCancelledFilter, handleGameCancelled);
      contract.off(prizeClaimedFilter, handlePrizeClaimed);
    };
  }, [contract, address]);

  return {
    gameData,
    previousBets,
    pendingRequest,
    userData,
    requestDetails,
    canStart,
    isLoading,
    error,
    refreshGameState: fetchGameState,
    
    placeBet,
    resolveGame,
    recoverStuckGame,
    claimPrize,
    getGameStats,
    getHouseEdge,
    
    loadingStates,
    isOnline
  };
}

// Add PropTypes or TypeScript for better type safety
const transformGameData = (data) => ({
  isActive: Boolean(data.isActive),
  chosenNumber: String(data.chosenNumber),
  result: String(data.result),
  amount: String(data.amount),
  timestamp: String(data.timestamp),
  payout: String(data.payout),
  randomWord: String(data.randomWord),
  status: String(data.status)
});