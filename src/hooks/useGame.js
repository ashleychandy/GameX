import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { config } from '@/config';
import { toast } from 'react-toastify';
import { DICE_GAME_ABI } from '@/abi';

export function useGame() {
  const { provider, address } = useWallet();
  const [gameData, setGameData] = useState(null);
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

  // ... rest of the hook implementation
} 