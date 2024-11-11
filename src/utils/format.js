import { ethers } from 'ethers';
import { format } from 'date-fns';

export const formatEther = (value) => {
  try {
    return ethers.utils.formatEther(value);
  } catch (error) {
    console.error('Error formatting ether value:', error);
    return '0';
  }
};

export const formatDate = (timestamp) => {
  try {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const calculateMaxBet = (contractBalance) => {
  try {
    if (!contractBalance || contractBalance.eq(0)) return ethers.parseEther('0');
    // Max bet is 1% of contract balance, using BigNumber operations
    return contractBalance.div(100);
  } catch (error) {
    console.error('Error calculating max bet:', error);
    return ethers.parseEther('0');
  }
};

export const formatAmount = (amount) => {
  if (!amount) return '0';
  try {
    // Handle both string and BigNumber inputs
    const value = typeof amount === 'string' ? amount : amount.toString();
    return ethers.formatEther(value);
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0';
  }
};

export const parseAmount = (amount) => {
  if (!amount) return ethers.parseEther('0');
  try {
    return ethers.parseEther(amount.toString());
  } catch (error) {
    console.error('Error parsing amount:', error);
    return ethers.parseEther('0');
  }
};

export const formatGameData = (data) => {
  if (!data) return null;
  
  try {
    return {
      isActive: Boolean(data.isActive),
      chosenNumber: data.chosenNumber?.toString() || '0',
      result: data.result?.toString() || '0',
      amount: formatAmount(data.amount || '0'),
      timestamp: data.timestamp?.toString() || '0',
      payout: formatAmount(data.payout || '0'),
      randomWord: data.randomWord?.toString() || '0',
      status: data.status?.toString() || '0'
    };
  } catch (error) {
    console.error('Error formatting game data:', error);
    return null;
  }
};

export const formatStats = (stats) => {
  if (!stats) return null;

  try {
    return {
      winRate: stats.winRate?.toString() || '0',
      averageBet: formatAmount(stats.averageBet || '0'),
      totalGamesWon: stats.totalGamesWon?.toString() || '0',
      totalGamesLost: stats.totalGamesLost?.toString() || '0'
    };
  } catch (error) {
    console.error('Error formatting stats:', error);
    return null;
  }
};

export const formatBetHistory = (bet) => {
  try {
    return {
      chosenNumber: bet.chosenNumber?.toString() || '0',
      rolledNumber: bet.rolledNumber?.toString() || '0',
      amount: formatAmount(bet.amount || '0'),
      timestamp: bet.timestamp?.toString() || '0'
    };
  } catch (error) {
    console.error('Error formatting bet history:', error);
    return null;
  }
};

export const validateGameData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid game data format');
  }

  const requiredFields = ['isActive', 'chosenNumber', 'amount', 'status'];
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return data;
};

export const safeParseAmount = (amount) => {
  try {
    // Remove any excess decimals beyond 18
    const [whole, decimal = ''] = amount.toString().split('.');
    const safeDecimal = decimal.slice(0, 18).padEnd(18, '0');
    const safeAmount = `${whole}.${safeDecimal}`;
    
    return ethers.parseEther(safeAmount);
  } catch (error) {
    console.error('Error parsing amount:', error);
    return ethers.parseEther('0');
  }
};