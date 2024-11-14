import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { DICE_GAME_ABI, TOKEN_ABI } from '@/contracts/abis';
import { toast } from 'react-toastify';
import { config } from '@/config';

export function useGame() {
  const { provider, account } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [pendingTx, setPendingTx] = useState(null);

  const getContracts = useCallback(() => {
    if (!provider || !account) return null;
    
    const signer = provider.getSigner();
    return {
      diceGame: new ethers.Contract(
        config.contracts.diceGame,
        DICE_GAME_ABI,
        signer
      ),
      token: new ethers.Contract(
        config.contracts.token,
        TOKEN_ABI,
        signer
      )
    };
  }, [provider, account]);

  const fetchGameData = useCallback(async () => {
    const contracts = getContracts();
    if (!contracts || !account) return;

    try {
      setIsLoading(true);
      const [currentGame, stats, history] = await Promise.all([
        contracts.diceGame.games(account),
        contracts.diceGame.playerStats(account),
        contracts.diceGame.getPlayerHistory(account)
      ]);

      setGameData({
        currentGame: {
          number: currentGame.number.toNumber(),
          amount: ethers.formatEther(currentGame.amount),
          timestamp: currentGame.timestamp.toNumber(),
          resolved: currentGame.resolved,
          won: currentGame.won,
          payout: ethers.formatEther(currentGame.payout)
        },
        stats: {
          gamesPlayed: stats.gamesPlayed.toNumber(),
          gamesWon: stats.gamesWon.toNumber(),
          totalWagered: ethers.formatEther(stats.totalWagered),
          totalWon: ethers.formatEther(stats.totalWon)
        },
        history: history.map(game => ({
          number: game.number.toNumber(),
          amount: ethers.formatEther(game.amount),
          timestamp: game.timestamp.toNumber(),
          won: game.won,
          payout: ethers.formatEther(game.payout)
        }))
      });

      // Fetch game stats
      const [
        totalGames,
        totalVolume,
        houseEdge,
        collectedFees
      ] = await Promise.all([
        contracts.diceGame.totalGames(),
        contracts.diceGame.totalVolume(),
        contracts.diceGame.houseEdge(),
        contracts.diceGame.collectedFees()
      ]);

      setGameStats({
        totalGames: totalGames.toNumber(),
        totalVolume: ethers.formatEther(totalVolume),
        houseEdge: houseEdge.toNumber() / 100,
        collectedFees: ethers.formatEther(collectedFees)
      });

    } catch (err) {
      console.error('Error fetching game data:', err);
      setError('Failed to fetch game data');
    } finally {
      setIsLoading(false);
    }
  }, [getContracts, account]);

  const checkAndApproveToken = async (amount) => {
    const contracts = getContracts();
    if (!contracts) throw new Error('Contracts not initialized');

    try {
      const allowance = await contracts.token.allowance(
        account,
        config.contracts.diceGame
      );

      if (allowance.lt(amount)) {
        const approveTx = await contracts.token.approve(
          config.contracts.diceGame,
          ethers.MaxUint256
        );
        await approveTx.wait();
      }
    } catch (err) {
      console.error('Approval error:', err);
      throw new Error('Failed to approve tokens');
    }
  };

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
      const balance = await contracts.token.balanceOf(account);
      if (balance.lt(amountWei)) {
        throw new Error('Insufficient token balance');
      }

      // Approve tokens if needed
      await checkAndApproveToken(amountWei);

      // Place bet
      const tx = await contracts.diceGame.placeBet(number, amountWei);
      setPendingTx(tx.hash);
      
      const receipt = await tx.wait();
      
      // Handle events
      const gameStartedEvent = receipt.events?.find(
        e => e.event === 'GameStarted'
      );
      if (gameStartedEvent) {
        toast.info('Game started! Waiting for result...');
      }

      await fetchGameData();
      return receipt;

    } catch (err) {
      console.error('Error placing bet:', err);
      setError(err.message);
      toast.error('Failed to place bet');
      throw err;
    } finally {
      setIsLoading(false);
      setPendingTx(null);
    }
  }, [getContracts, account, fetchGameData]);

  const withdrawFees = useCallback(async () => {
    const contracts = getContracts();
    if (!contracts) return;

    try {
      setIsLoading(true);
      const tx = await contracts.diceGame.withdrawFees();
      await tx.wait();
      await fetchGameData();
      toast.success('Fees withdrawn successfully');
    } catch (err) {
      console.error('Error withdrawing fees:', err);
      toast.error('Failed to withdraw fees');
    } finally {
      setIsLoading(false);
    }
  }, [getContracts, fetchGameData]);

  // Setup event listeners
  useEffect(() => {
    const contracts = getContracts();
    if (!contracts) return;

    const handleGameResult = (player, won, number, amount, payout) => {
      if (player.toLowerCase() === account.toLowerCase()) {
        toast.success(
          won 
            ? `You won ${ethers.formatEther(payout)} DICE!` 
            : 'Better luck next time!'
        );
        fetchGameData();
      }
    };

    contracts.diceGame.on('GameResult', handleGameResult);

    return () => {
      contracts.diceGame.off('GameResult', handleGameResult);
    };
  }, [getContracts, account, fetchGameData]);

  // Initial data fetch
  useEffect(() => {
    if (getContracts() && account) {
      fetchGameData();
    }
  }, [getContracts, account, fetchGameData]);

  return {
    gameData,
    gameStats,
    isLoading,
    error,
    pendingTx,
    placeBet,
    withdrawFees,
    refreshGameState: fetchGameData
  };
} 