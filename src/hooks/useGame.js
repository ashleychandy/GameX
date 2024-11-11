import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { useTokenApproval } from './useTokenApproval';
import { gameConfig } from '../config';
import { UI_STATES, GAME_STATUS } from '../utils/constants';
import { handleError } from '../utils/errorHandling';
import { useContract } from './useContract';

export function useGame() {
  const { address } = useWallet();
  const { contract } = useContract('dice');
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
    userData: false
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

        const [
          currentGame,
          betsHistory,
          userDataResult,
          requestInfo,
          canStartNew,
          hasPending
        ] = await Promise.all([
          contract.getCurrentGame(address),
          contract.getPreviousBets(address),
          contract.getUserData(address),
          contract.getCurrentRequestDetails(address),
          contract.canStartNewGame(address),
          contract.hasPendingRequest(address)
        ]);

        // Transform game data
        const gameState = {
          isActive: currentGame.isActive,
          chosenNumber: currentGame.chosenNumber.toString(),
          result: currentGame.result.toString(),
          amount: currentGame.amount.toString(),
          timestamp: currentGame.timestamp.toString(),
          payout: currentGame.payout.toString(),
          randomWord: currentGame.randomWord.toString(),
          status: currentGame.status
        };

        // Transform user data
        const transformedUserData = {
          totalGames: userDataResult.totalGames.toString(),
          totalBets: userDataResult.totalBets.toString(),
          totalWinnings: userDataResult.totalWinnings.toString(),
          totalLosses: userDataResult.totalLosses.toString(),
          lastPlayed: userDataResult.lastPlayed.toString()
        };

        // Transform request details
        const transformedRequestDetails = {
          requestId: requestInfo.requestId.toString(),
          requestFulfilled: requestInfo.requestFulfilled,
          requestActive: requestInfo.requestActive
        };

        // Transform bet history
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
        retries--;
        if (retries === 0) {
          const { message } = handleError(error);
          setError(message);
          toast.error('Failed to fetch game state after multiple attempts');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
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

  return {
    gameData,
    previousBets,
    pendingRequest,
    userData,
    requestDetails,
    canStart,
    isLoading,
    error,
    refreshGameState: fetchGameState
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