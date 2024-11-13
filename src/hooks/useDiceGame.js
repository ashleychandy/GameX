import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { formatAmount } from '../utils/format';
import { handleError } from '../utils/errorHandling';
import { GAME_STATES } from '../utils/constants';
import { executeContractTransaction } from '../utils/contractHelpers';
import { useContract } from './useContract';

export function useDiceGame() {
  const { address, contracts } = useWallet();
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
    if (!contracts?.dice || !address) return;

    try {
      setLoadingStates(prev => ({ ...prev, fetchingData: true }));

      const [
        currentGame,
        stats,
        betsHistory,
        requestDetails,
        canStart
      ] = await Promise.all([
        contracts.dice.getCurrentGame(address),
        contracts.dice.getPlayerStats(address),
        contracts.dice.getPreviousBets(address),
        contracts.dice.getCurrentRequestDetails(address),
        contracts.dice.canStartNewGame(address)
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
  }, [contracts?.dice, address]);

  const playDice = useCallback(async (chosenNumber, betAmount) => {
    if (!contracts?.dice || !address) return;
    
    setLoadingStates(prev => ({ ...prev, placingBet: true }));
    
    try {
      const amount = ethers.parseEther(betAmount);
      const tx = await executeContractTransaction(
        contracts.dice,
        'playDice',
        [chosenNumber, amount],
        {
          onSuccess: () => {
            toast.success('Bet placed successfully!');
            updateGameState();
          },
          onError: (error) => {
            toast.error('Failed to place bet');
            console.error('Bet error:', error);
          }
        }
      );

      return tx;
    } finally {
      setLoadingStates(prev => ({ ...prev, placingBet: false }));
    }
  }, [contracts?.dice, address, updateGameState]);

  const resolveGame = useCallback(async () => {
    if (!contracts?.dice || !address) return;
    
    setLoadingStates(prev => ({ ...prev, resolving: true }));
    
    try {
      await executeContractTransaction(
        contracts.dice,
        'resolveGame',
        [],
        {
          onSuccess: () => {
            toast.success('Game resolved successfully!');
            updateGameState();
          },
          onError: (error) => {
            toast.error('Failed to resolve game');
            console.error('Resolve error:', error);
          }
        }
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, resolving: false }));
    }
  }, [contracts?.dice, address, updateGameState]);

  // Auto-refresh game state
  useEffect(() => {
    if (!contracts?.dice || !address) return;
    
    updateGameState();
    const interval = setInterval(updateGameState, 30000);
    return () => clearInterval(interval);
  }, [contracts?.dice, address, updateGameState]);

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