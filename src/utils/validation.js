import { ethers } from 'ethers';
import { GAME_STATUS } from './constants';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateGameState = (gameData) => {
  if (!gameData || typeof gameData !== 'object') {
    throw new ValidationError('Invalid game data structure');
  }
  
  const requiredFields = ['isActive', 'chosenNumber', 'result', 'amount', 'status'];
  const missingFields = requiredFields.filter(field => !(field in gameData));
  
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return {
    isActive: Boolean(gameData.isActive),
    chosenNumber: ethers.formatUnits(gameData.chosenNumber || '0', 0),
    result: ethers.formatUnits(gameData.result || '0', 0),
    amount: ethers.formatEther(gameData.amount || '0'),
    status: Number(gameData.status) || GAME_STATUS.PENDING,
    timestamp: gameData.timestamp ? Number(gameData.timestamp) : Date.now()
  };
};

export const validateBetAmount = (amount, minBet, maxBet) => {
  const parsedAmount = ethers.parseEther(amount.toString());
  const parsedMinBet = ethers.parseEther(minBet.toString());
  const parsedMaxBet = ethers.parseEther(maxBet.toString());

  if (parsedAmount.lt(parsedMinBet)) {
    throw new ValidationError(`Bet amount must be at least ${minBet} tokens`);
  }

  if (parsedAmount.gt(parsedMaxBet)) {
    throw new ValidationError(`Bet amount cannot exceed ${maxBet} tokens`);
  }

  return true;
};

export const validateContractResponse = (response) => {
  if (!response || !response.hash) {
    throw new ValidationError('Invalid contract response');
  }
  return response;
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