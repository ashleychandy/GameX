import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { GAME_STATES, POLLING_INTERVAL } from '../utils/constants';

export function useGame() {
  const [currentGame, setCurrentGame] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [previousBets, setPreviousBets] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [gameState, setGameState] = useState(GAME_STATES.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Improved error handling utility
  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    const errorMessage = error.reason || error.message || 'An unknown error occurred';
    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Improved data fetching with validation
  const fetchGameData = useCallback(async () => {
    if (!contract || !address) {
      resetGameState();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [userData, stats, previousBetsData, requestInfo] = await Promise.all([
        contract.getUserData(address).catch(e => {
          throw new Error(`Failed to fetch user data: ${e.message}`);
        }),
        contract.getPlayerStats(address).catch(e => {
          throw new Error(`Failed to fetch player stats: ${e.message}`);
        }),
        contract.getPreviousBets(address).catch(e => {
          throw new Error(`Failed to fetch previous bets: ${e.message}`);
        }),
        contract.getCurrentRequestDetails(address).catch(e => {
          throw new Error(`Failed to fetch request details: ${e.message}`);
        })
      ]);

      // Validate and format current game data
      const gameData = formatGameData(userData?.currentGame);
      setCurrentGame(gameData);

      // Format player stats with validation
      setPlayerStats(formatPlayerStats(stats));

      // Format previous bets with validation
      setPreviousBets(formatPreviousBets(previousBetsData));

      // Update request details with validation
      setRequestDetails(formatRequestDetails(requestInfo));

      // Determine game state with improved logic
      updateGameState(gameData, requestInfo);

    } catch (error) {
      handleError(error, 'fetchGameData');
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  // Data formatting utilities
  const formatGameData = (game) => {
    if (!game) return null;
    try {
      return {
        isActive: game.isActive,
        chosenNumber: Number(game.chosenNumber),
        result: Number(game.result),
        amount: ethers.formatEther(game.amount.toString()),
        timestamp: Number(game.timestamp),
        payout: ethers.formatEther(game.payout.toString()),
        status: GAME_STATES[game.status] || GAME_STATES.PENDING
      };
    } catch (error) {
      handleError(error, 'formatGameData');
      return null;
    }
  };

  const formatPlayerStats = (stats) => {
    try {
      return {
        winRate: Number(stats.winRate) / 100,
        averageBet: ethers.formatEther(stats.averageBet.toString()),
        totalGamesWon: Number(stats.totalGamesWon),
        totalGamesLost: Number(stats.totalGamesLost),
        totalGames: Number(stats.totalGamesWon) + Number(stats.totalGamesLost)
      };
    } catch (error) {
      handleError(error, 'formatPlayerStats');
      return null;
    }
  };

  const formatPreviousBets = (bets) => {
    try {
      return bets.map(bet => ({
        chosenNumber: Number(bet.chosenNumber),
        rolledNumber: Number(bet.rolledNumber),
        amount: ethers.formatEther(bet.amount.toString()),
        timestamp: Number(bet.timestamp)
      }));
    } catch (error) {
      handleError(error, 'formatPreviousBets');
      return [];
    }
  };

  const formatRequestDetails = (info) => {
    try {
      return {
        requestId: Number(info.requestId),
        requestFulfilled: info.requestFulfilled,
        requestActive: info.requestActive
      };
    } catch (error) {
      handleError(error, 'formatRequestDetails');
      return null;
    }
  };

  // Improved game state management
  const updateGameState = (gameData, requestInfo) => {
    try {
      if (!gameData?.isActive) {
        setGameState(GAME_STATES.PENDING);
      } else if (requestInfo.requestFulfilled) {
        setGameState(GAME_STATES.READY_TO_RESOLVE);
      } else if (requestInfo.requestActive) {
        setGameState(GAME_STATES.WAITING_FOR_RESULT);
      } else {
        setGameState(gameData.status);
      }
    } catch (error) {
      handleError(error, 'updateGameState');
    }
  };

  // Improved play dice function
  const playDice = async (chosenNumber, amount) => {
    if (!contract || !address) {
      toast.error('Please connect your wallet to play');
      return;
    }

    setIsLoading(true);
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await contract.playDice(chosenNumber, amountInWei);
      
      // Wait for transaction confirmation with timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), 30000)
        )
      ]);

      toast.success('Bet placed successfully!');
      await fetchGameData();
    } catch (error) {
      handleError(error, 'playDice');
    } finally {
      setIsLoading(false);
    }
  };

  // Improved resolve game function
  const resolveGame = async () => {
    if (!contract || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await contract.resolveGame();
      
      // Wait for transaction confirmation with timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), 30000)
        )
      ]);

      toast.success('Game resolved successfully!');
      await fetchGameData();
    } catch (error) {
      handleError(error, 'resolveGame');
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

  // Improved polling with cleanup
  useEffect(() => {
    let mounted = true;
    let interval;

    const pollGameData = async () => {
      if (mounted && contract && address) {
        await fetchGameData();
      }
    };

    if (contract && address) {
      pollGameData();
      interval = setInterval(pollGameData, POLLING_INTERVAL);
    }

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [contract, address, fetchGameData]);

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