import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useContract } from '../hooks/useContract';
import { useWallet } from './WalletContext';
import { toast } from 'react-toastify';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('0');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  const { account } = useWallet();
  const contract = useContract();

  const placeBet = useCallback(async () => {
    if (!account || !contract || !selectedNumber || !betAmount) {
      toast.error('Please connect wallet and select number and bet amount');
      return;
    }

    try {
      setIsPlaying(true);
      const tx = await contract.placeBet(selectedNumber, {
        value: ethers.parseEther(betAmount)
      });
      await tx.wait();
      
      toast.success('Bet placed successfully!');
      // Reset game state
      setSelectedNumber(null);
      setBetAmount('0');
    } catch (error) {
      toast.error('Failed to place bet');
      console.error(error);
    } finally {
      setIsPlaying(false);
    }
  }, [account, contract, selectedNumber, betAmount]);

  const value = {
    selectedNumber,
    setSelectedNumber,
    betAmount,
    setBetAmount,
    isPlaying,
    gameHistory,
    placeBet
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
