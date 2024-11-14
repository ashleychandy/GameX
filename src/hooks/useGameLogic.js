import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import { useWallet } from '../contexts/WalletContext';
import { notify } from '../services/notifications';
import { validateBetAmount } from '../utils/helpers';
import { MIN_BET, MAX_BET, TRANSACTION_STATES } from '../utils/constants';

export const useGameLogic = () => {
  const { account } = useWallet();
  const contract = useContract();
  
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [transactionState, setTransactionState] = useState(TRANSACTION_STATES.NONE);
  const [transactionHash, setTransactionHash] = useState(null);

  const resetGame = useCallback(() => {
    setSelectedNumber(null);
    setBetAmount('');
    setIsRolling(false);
    setTransactionState(TRANSACTION_STATES.NONE);
    setTransactionHash(null);
  }, []);

  const validateBet = useCallback(() => {
    if (!account) {
      notify.error('Please connect your wallet');
      return false;
    }

    if (!selectedNumber) {
      notify.error('Please select a number');
      return false;
    }

    if (!validateBetAmount(betAmount, MIN_BET, MAX_BET)) {
      notify.error(`Bet amount must be between ${MIN_BET} and ${MAX_BET} ETH`);
      return false;
    }

    return true;
  }, [account, selectedNumber, betAmount]);

  const placeBet = useCallback(async () => {
    if (!validateBet()) return;

    try {
      setIsRolling(true);
      setTransactionState(TRANSACTION_STATES.PENDING);

      const tx = await contract.placeBet(selectedNumber, {
        value: ethers.parseEther(betAmount)
      });

      setTransactionHash(tx.hash);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTransactionState(TRANSACTION_STATES.CONFIRMED);
        notify.success('Bet placed successfully!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      setTransactionState(TRANSACTION_STATES.FAILED);
      notify.error(error.message);
      console.error('Bet error:', error);
    } finally {
      setIsRolling(false);
    }
  }, [contract, selectedNumber, betAmount, validateBet]);

  useEffect(() => {
    if (!account) {
      resetGame();
    }
  }, [account, resetGame]);

  return {
    selectedNumber,
    setSelectedNumber,
    betAmount,
    setBetAmount,
    isRolling,
    transactionState,
    transactionHash,
    placeBet,
    resetGame
  };
}; 