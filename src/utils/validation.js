import { ethers } from 'ethers';
import { GAME_CONFIG } from './constants';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateBetAmount = (amount) => {
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    throw new Error('Invalid bet amount');
  }

  const amountBN = ethers.parseEther(amount.toString());
  
  if (amountBN.lt(GAME_CONFIG.MIN_BET)) {
    throw new Error(`Minimum bet amount is ${ethers.formatEther(GAME_CONFIG.MIN_BET)} tokens`);
  }

  if (amountBN.gt(GAME_CONFIG.MAX_BET)) {
    throw new Error(`Maximum bet amount is ${ethers.formatEther(GAME_CONFIG.MAX_BET)} tokens`);
  }

  return amountBN;
};

export const validateContractAddress = (address) => {
  if (!address || !ethers.isAddress(address)) {
    throw new Error('Invalid contract address');
  }
  return address;
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

export const validateGameState = (gameData) => {
  if (!gameData || typeof gameData !== 'object') {
    throw new Error('Invalid game data');
  }
  
  const requiredFields = ['isActive', 'chosenNumber', 'result', 'amount', 'status'];
  for (const field of requiredFields) {
    if (!(field in gameData)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return true;
}; 