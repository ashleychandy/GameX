import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { executeContractTransaction } from '../utils/contractHelpers';
import { toast } from 'react-toastify';

export function useGameActions() {
  const { contracts, address } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const placeBet = useCallback(async (number, amount) => {
    if (!contracts.dice || !address) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    try {
      // Convert amount to Wei
      const parsedAmount = ethers.parseEther(amount.toString());
      
      // First approve tokens
      const approveTx = await executeContractTransaction(
        contracts.token,
        'approve',
        [contracts.dice.address, parsedAmount]
      );
      await approveTx.wait();

      // Then place bet
      const tx = await executeContractTransaction(
        contracts.dice,
        'playDice',
        [number, parsedAmount]
      );
      
      const receipt = await tx.wait();
      
      // Find the GameStarted event
      const event = receipt.logs
        .map(log => {
          try {
            return contracts.dice.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(event => event && event.name === 'GameStarted');

      if (event) {
        toast.success('Bet placed successfully!');
        return event.args.requestId;
      }
      
      throw new Error('Game start event not found');
    } catch (error) {
      toast.error(error.message || 'Failed to place bet');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [contracts, address]);

  const resolveGame = useCallback(async () => {
    if (!contracts.dice || !address) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    try {
      const tx = await executeContractTransaction(
        contracts.dice,
        'resolveGame',
        []
      );
      await tx.wait();
      toast.success('Game resolved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to resolve game');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [contracts, address]);

  return {
    placeBet,
    resolveGame,
    isProcessing
  };
} 