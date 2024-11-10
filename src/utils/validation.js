import { ethers } from 'ethers';
import { GAME_CONFIG } from './constants';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateBetAmount = (amount, balance) => {
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    throw new Error('Please enter a valid bet amount');
  }

  const betAmount = ethers.parseEther(amount.toString());
  const userBalance = balance || ethers.parseEther('0');

  if (betAmount.gt(userBalance)) {
    throw new Error('Insufficient balance');
  }

  return betAmount;
};

export const validateGameData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid game data format');
  }

  // Ensure currentGame exists and has required fields
  if (!data.currentGame || typeof data.currentGame !== 'object') {
    data.currentGame = {
      isActive: false,
      chosenNumber: '0',
      result: '0',
      amount: '0',
      timestamp: '0',
      payout: '0',
      randomWord: '0',
      status: 0
    };
  }

  // Ensure stats exists and has required fields
  if (!data.stats || typeof data.stats !== 'object') {
    data.stats = {
      totalGames: '0',
      totalBets: '0',
      totalWinnings: '0',
      totalLosses: '0',
      lastPlayed: '0'
    };
  }

  return {
    currentGame: {
      isActive: Boolean(data.currentGame.isActive),
      chosenNumber: data.currentGame.chosenNumber?.toString() || '0',
      result: data.currentGame.result?.toString() || '0',
      amount: data.currentGame.amount?.toString() || '0',
      timestamp: data.currentGame.timestamp?.toString() || '0',
      payout: data.currentGame.payout?.toString() || '0',
      randomWord: data.currentGame.randomWord?.toString() || '0',
      status: Number(data.currentGame.status || 0)
    },
    stats: {
      totalGames: data.stats.totalGames?.toString() || '0',
      totalBets: data.stats.totalBets?.toString() || '0',
      totalWinnings: data.stats.totalWinnings?.toString() || '0',
      totalLosses: data.stats.totalLosses?.toString() || '0',
      lastPlayed: data.stats.lastPlayed?.toString() || '0'
    }
  };
};

export const validateContractResponse = (response) => {
  if (!response || !response.hash) {
    throw new ValidationError('Invalid contract response');
  }
  return response;
}; 