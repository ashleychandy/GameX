import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useTokenApproval } from './useTokenApproval';
import { handleContractError } from '../utils/contractHelpers';
import { GAME_STATES } from '../utils/constants';
import { toast } from 'react-toastify';
import { CONFIG } from '../config';

export function useDiceGame() {
  const { diceContract: contract, address } = useWallet();
  const { checkAndApproveToken } = useTokenApproval(contract?.address);
  
  const [gameData, setGameData] = useState(null);
  const [previousBets, setPreviousBets] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [userData, setUserData] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    placingBet: false,
    resolvingGame: false,
    recoveringGame: false,
    fetchingData: false
  });

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    if (!contract || !address) return;

    try {
      setLoadingStates(prev => ({ ...prev, fetchingData: true }));

      const [
        currentGame,
        userStats,
        betsHistory,
        requestInfo,
        canStart,
        hasPending
      ] = await Promise.all([
        contract.getCurrentGame(address),
        contract.getUserData(address),
        contract.getPreviousBets(address),
        contract.getCurrentRequestDetails(address),
        contract.canStartNewGame(address),
        contract.hasPendingRequest(address)
      ]);

      setGameData({
        isActive: currentGame.isActive,
        chosenNumber: currentGame.chosenNumber.toString(),
        amount: currentGame.amount.toString(),
        result: currentGame.result.toString(),
        payout: currentGame.payout.toString(),
        status: currentGame.status
      });

      setUserData({
        totalGames: userStats.totalGames.toString(),
        totalBets: userStats.totalBets.toString(),
        totalWinnings: userStats.totalWinnings.toString(),
        totalLosses: userStats.totalLosses.toString(),
        lastPlayed: userStats.lastPlayed.toString()
      });

      setPreviousBets(betsHistory.map(bet => ({
        chosenNumber: bet.chosenNumber.toString(),
        rolledNumber: bet.rolledNumber.toString(),
        amount: bet.amount.toString(),
        timestamp: bet.timestamp.toString()
      })));

      setRequestDetails({
        requestId: requestInfo.requestId.toString(),
        requestFulfilled: requestInfo.requestFulfilled,
        requestActive: requestInfo.requestActive
      });

      setPendingRequest(hasPending);

    } catch (error) {
      console.error('Error fetching game state:', error);
      toast.error('Failed to fetch game state');
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingData: false }));
    }
  }, [contract, address]);

  // Place bet
  const placeBet = useCallback(async (number, amount) => {
    if (!contract || !address) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, placingBet: true }));

      // First approve tokens
      await checkAndApproveToken(amount);

      // Place bet
      const tx = await contract.playDice(
        number,
        ethers.parseEther(amount.toString())
      );

      toast.info('Placing bet...');
      const receipt = await tx.wait();

      // Find GameStarted event
      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(event => event && event.name === 'GameStarted');

      if (event) {
        toast.success('Bet placed successfully!');
        await fetchGameState();
        return event.args.requestId;
      }

      throw new Error('Game start event not found');
    } catch (error) {
      handleContractError(error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, placingBet: false }));
    }
  }, [contract, address, checkAndApproveToken, fetchGameState]);

  // Resolve game
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
      handleContractError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, resolvingGame: false }));
    }
  }, [contract, address, fetchGameState]);

  // Recover stuck game
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
      handleContractError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, recoveringGame: false }));
    }
  }, [contract, address, fetchGameState]);

  // Setup event listeners
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

  // Initial fetch
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  // Auto-refresh when game is active
  useEffect(() => {
    if (gameData?.isActive || pendingRequest) {
      const interval = setInterval(fetchGameState, 5000);
      return () => clearInterval(interval);
    }
  }, [gameData?.isActive, pendingRequest, fetchGameState]);

  const initializeGame = useCallback(async () => {
    try {
      const callbackGasLimit = CONFIG.chainlink.callbackGasLimit;
      const requestConfirmations = CONFIG.chainlink.requestConfirmations;
      
      // Initialize game with proper config
      const tx = await contract.initializeGame({
        gasLimit: callbackGasLimit,
        requestConfirmations
      });

      await tx.wait();
    } catch (error) {
      throw handleError(error);
    }
  }, [contract]);

  return {
    gameData,
    previousBets,
    pendingRequest,
    userData,
    requestDetails,
    loadingStates,
    placeBet,
    resolveGame,
    recoverStuckGame,
    refreshGameState: fetchGameState,
    initializeGame
  };
} 