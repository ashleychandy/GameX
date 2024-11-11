import { ethers } from 'ethers';
import { AppError } from './errorHandling';
import { ERROR_CODES } from './constants';

export const validateGameData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new AppError('Invalid game data format', ERROR_CODES.VALIDATION_ERROR);
  }

  const requiredFields = {
    currentGame: {
      isActive: 'boolean',
      chosenNumber: 'number',
      amount: 'string',
      status: 'number',
      timestamp: 'string',
      result: 'string',
      payout: 'string',
      randomWord: 'string'
    },
    stats: {
      totalGames: 'string',
      totalBets: 'string',
      totalWinnings: 'string',
      totalLosses: 'string',
      lastPlayed: 'string'
    }
  };

  // Deep validation of nested objects
  const validateObject = (obj, schema, path = '') => {
    for (const [key, type] of Object.entries(schema)) {
      const value = obj[key];
      const fullPath = path ? `${path}.${key}` : key;

      if (value === undefined) {
        throw new AppError(`Missing required field: ${fullPath}`, ERROR_CODES.VALIDATION_ERROR);
      }

      if (typeof type === 'object') {
        validateObject(value, type, fullPath);
      } else if (typeof value !== type && !(type === 'number' && !isNaN(Number(value)))) {
        throw new AppError(
          `Invalid type for ${fullPath}. Expected ${type}, got ${typeof value}`,
          ERROR_CODES.VALIDATION_ERROR
        );
      }
    }
  };

  validateObject(data, requiredFields);
  return data;
};

export const validateAmount = (amount, min, max) => {
  try {
    const parsedAmount = ethers.parseEther(amount.toString());
    const parsedMin = ethers.parseEther(min.toString());
    const parsedMax = ethers.parseEther(max.toString());

    if (parsedAmount.lt(parsedMin)) {
      throw new AppError(`Amount must be at least ${min}`, ERROR_CODES.INVALID_AMOUNT);
    }

    if (parsedAmount.gt(parsedMax)) {
      throw new AppError(`Amount cannot exceed ${max}`, ERROR_CODES.INVALID_AMOUNT);
    }

    return parsedAmount;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid amount format', ERROR_CODES.INVALID_AMOUNT);
  }
};

export const validateAddress = (address) => {
  if (!address || !ethers.isAddress(address)) {
    throw new AppError('Invalid address format', ERROR_CODES.INVALID_ADDRESS);
  }
  return address;
};