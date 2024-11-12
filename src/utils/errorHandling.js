import { ERROR_CODES, ERROR_MESSAGES } from './constants';
import { CONFIG } from '../config';

export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export const handleError = (error) => {
  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return {
      message: `Unable to connect to ${CONFIG.network.rpcUrl}`,
      code: 'NETWORK_ERROR'
    };
  }

  // Wrong network
  if (error.code === 'WRONG_NETWORK') {
    return {
      message: `Please switch to ${CONFIG.network.chainId} network`,
      code: 'WRONG_NETWORK'
    };
  }

  // Contract-specific errors
  if (error.message.includes('user rejected transaction')) {
    return {
      message: 'Transaction rejected by user',
      code: 'USER_REJECTED'
    };
  }

  if (error.message.includes('insufficient funds')) {
    return {
      message: 'Insufficient funds for transaction',
      code: 'INSUFFICIENT_FUNDS'
    };
  }

  if (error.message.includes('game already active')) {
    return {
      message: 'You already have an active game',
      code: 'GAME_ACTIVE'
    };
  }

  if (error.message.includes('invalid bet amount')) {
    return {
      message: 'Invalid bet amount',
      code: 'INVALID_BET'
    };
  }

  // Fallback
  return {
    message: error.message || 'An unknown error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

export const isUserRejection = (error) => {
  return error?.code === 4001 || // MetaMask
         error?.code === -32603; // Other wallets
};

export const handleContractError = (error) => {
  // Check for arithmetic errors
  if (error.message.includes('arithmetic underflow or overflow') ||
      error.message.includes('reverted') && error.message.includes('arithmetic')) {
    return {
      message: 'Invalid amount. Please check your input values and try again.',
      code: 'ARITHMETIC_ERROR'
    };
  }

  if (error.message.includes('execution reverted')) {
    return {
      message: 'Transaction failed. Please check your inputs and try again.',
      code: 'EXECUTION_REVERTED'
    };
  }

  // Handle user rejection
  if (error.code === 4001) {
    return {
      message: 'Transaction rejected by user',
      code: 'USER_REJECTED'
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};