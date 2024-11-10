import { ethers } from 'ethers';

export const formatAmount = (amount) => {
  try {
    if (!amount) return '0';
    
    // Handle very large numbers safely
    if (ethers.getBigInt(amount.toString()) > ethers.MaxUint256) {
      return 'Amount too large';
    }
    
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

export const calculateMaxBet = (contractBalance) => {
  try {
    // Consider the payout multiplier (6x) when calculating max bet
    return contractBalance.div(6);
  } catch (error) {
    console.error('Error calculating max bet:', error);
    return ethers.parseEther('0');
  }
}; 