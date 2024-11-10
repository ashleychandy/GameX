import { ethers } from 'ethers';

export const formatAmount = (amount) => {
  try {
    return ethers.formatEther(amount.toString());
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0';
  }
};

export const parseAmount = (amount) => {
  try {
    return ethers.parseEther(amount.toString());
  } catch (error) {
    console.error('Error parsing amount:', error);
    return ethers.parseEther('0');
  }
};

export const formatGameData = (data) => {
  if (!data) return null;
  
  return {
    isActive: data.isActive,
    chosenNumber: data.chosenNumber.toString(),
    result: data.result.toString(),
    amount: formatAmount(data.amount),
    timestamp: data.timestamp.toString(),
    payout: formatAmount(data.payout),
    randomWord: data.randomWord.toString(),
    status: data.status
  };
};

export const formatStats = (stats) => {
  if (!stats) return null;

  return {
    winRate: stats.winRate.toString(),
    averageBet: formatAmount(stats.averageBet),
    totalGamesWon: stats.totalGamesWon.toString(),
    totalGamesLost: stats.totalGamesLost.toString()
  };
};

export const formatBetHistory = (bet) => {
  return {
    chosenNumber: bet.chosenNumber.toString(),
    rolledNumber: bet.rolledNumber.toString(),
    amount: formatAmount(bet.amount),
    timestamp: bet.timestamp.toString()
  };
}; 