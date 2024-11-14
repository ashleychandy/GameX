import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { DICE_GAME_ABI, TOKEN_ABI } from '@/contracts/abis';
import { config } from '@/config';
import { toast } from 'react-toastify';

export function useGame() {
  const { provider, account } = useWallet();
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const diceContract = useCallback(() => {
    if (!provider || !account) return null;
    return new ethers.Contract(
      config.contracts.dice,
      DICE_GAME_ABI,
      provider.getSigner()
    );
  }, [provider, account]);

  const placeBet = useCallback(async (number, amount) => {
    if (!diceContract()) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First approve tokens
      const tokenContract = new ethers.Contract(
        config.contracts.token,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        provider.getSigner()
      );

      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Check allowance
      const allowance = await tokenContract.allowance(account, config.contracts.dice);
      if (allowance.lt(amountWei)) {
        const approveTx = await tokenContract.approve(config.contracts.dice, amountWei);
        await approveTx.wait();
      }

      // Place bet
      const tx = await diceContract().placeBet(number, amountWei, {
        gasLimit: config.chainLink.callbackGasLimit,
      });
      
      const receipt = await tx.wait();
      
      toast.success('Bet placed successfully!');
      return receipt;
    } catch (err) {
      console.error('Place bet error:', err);
      setError(err.message);
      toast.error('Failed to place bet');
    } finally {
      setIsLoading(false);
    }
  }, [diceContract, provider, account]);

  const getGameState = useCallback(async () => {
    if (!diceContract() || !account) return;

    try {
      const [
        currentGame,
        playerBalance,
        houseBalance
      ] = await Promise.all([
        diceContract().games(account),
        diceContract().getPlayerBalance(account),
        diceContract().getHouseBalance()
      ]);

      setGameData({
        isActive: currentGame.isActive,
        chosenNumber: currentGame.chosenNumber.toNumber(),
        amount: ethers.utils.formatEther(currentGame.amount),
        playerBalance: ethers.utils.formatEther(playerBalance),
        houseBalance: ethers.utils.formatEther(houseBalance)
      });
    } catch (err) {
      console.error('Get game state error:', err);
      setError(err.message);
    }
  }, [diceContract, account]);

  useEffect(() => {
    if (account) {
      getGameState();
    }
  }, [account, getGameState]);

  return {
    gameData,
    isLoading,
    error,
    placeBet,
    refreshGameState: getGameState
  };
} 