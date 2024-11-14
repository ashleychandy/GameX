import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { config } from '@/config';
import { toast } from 'react-toastify';
import { DICE_GAME_ABI } from '@/abi';

export function useGame() {
  const { provider, address } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingTx, setPendingTx] = useState(null);

  const getContracts = useCallback(() => {
    if (!provider || !address) return null;

    const signer = provider.getSigner();
    const diceGame = new ethers.Contract(
      config.contracts.diceGame,
      DICE_GAME_ABI,
      signer
    );
    const token = new ethers.Contract(
      config.contracts.token,
      ['function balanceOf(address) view returns (uint256)',
       'function allowance(address,address) view returns (uint256)',
       'function approve(address,uint256) returns (bool)'],
      signer
    );

    return { diceGame, token };
  }, [provider, address]);

  const fetchGameData = useCallback(async () => {
    const contracts = getContracts();
    if (!contracts) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get current game state
      const currentGame = await contracts.diceGame.getCurrentGame(address);
      
      // Get previous bets
      const previousBets = await contracts.diceGame.getPreviousBets(address);

      // Get player stats
      const stats = await contracts.diceGame.getPlayerStats(address);

      setGameData({
        currentGame: {
          isActive: currentGame.isActive,
          chosenNumber: Number(currentGame.chosenNumber),
          result: Number(currentGame.result),
          amount: currentGame.amount,
          status: currentGame.status,
          timestamp: Number(currentGame.timestamp)
        },
        previousBets: previousBets.map(bet => ({
          chosenNumber: Number(bet.chosenNumber),
          rolledNumber: Number(bet.rolledNumber),
          amount: bet.amount,
          timestamp: Number(bet.timestamp)
        }))
      });

      setGameStats({
        winRate: Number(stats[0]),
        averageBet: stats[1],
        gamesWon: Number(stats[2]),
        gamesLost: Number(stats[3])
      });

    } catch (err) {
      console.error('Error fetching game data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getContracts, address]);

  const checkAllowance = useCallback(async () => {
    const contracts = getContracts();
    if (!contracts) return '0';

    try {
      const allowance = await contracts.token.allowance(
        address,
        config.contracts.diceGame
      );
      return ethers.formatEther(allowance);
    } catch (err) {
      console.error('Error checking allowance:', err);
      throw err;
    }
  }, [getContracts, address]);

  const approveTokens = useCallback(async (amount) => {
    const contracts = getContracts();
    if (!contracts) throw new Error('Wallet not connected');

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await contracts.token.approve(
        config.contracts.diceGame,
        amountWei
      );
      await tx.wait();
    } catch (err) {
      console.error('Error approving tokens:', err);
      throw err;
    }
  }, [getContracts]);

  const placeBet = useCallback(async (number, amount) => {
    const contracts = getContracts();
    if (!contracts) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountWei = ethers.parseEther(amount.toString());
      
      // Check balance
      const balance = await contracts.token.balanceOf(address);
      if (balance < amountWei) {
        throw new Error('Insufficient token balance');
      }

      // Place bet
      const tx = await contracts.diceGame.placeBet(number, amountWei);
      setPendingTx(tx.hash);
      
      const receipt = await tx.wait();
      
      await fetchGameData();
      return receipt;

    } catch (err) {
      console.error('Error placing bet:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      setPendingTx(null);
    }
  }, [getContracts, address, fetchGameData]);

  // Initial data fetch
  useEffect(() => {
    if (address) {
      fetchGameData();
    }
  }, [address, fetchGameData]);

  // Listen for game events
  useEffect(() => {
    const contracts = getContracts();
    if (!contracts) return;

    const handleGameEvent = () => {
      fetchGameData();
    };

    // No need for event listeners as we'll use polling
    const interval = setInterval(fetchGameData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [getContracts, fetchGameData]);

  return {
    gameData,
    gameStats,
    isLoading,
    error,
    pendingTx,
    placeBet,
    checkAllowance,
    approveTokens,
    refreshGameState: fetchGameData
  };
} 