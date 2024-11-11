import { ERROR_CODES, ERROR_MESSAGES } from './constants';

export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export const handleError = (error) => {
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

  // Network errors
  if (error.message.includes('network error')) {
    return {
      message: 'Network error. Please check your connection',
      code: 'NETWORK_ERROR'
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
  if (error.message.includes('arithmetic underflow or overflow')) {
    return {
      message: 'Invalid amount or calculation error. Please try a different amount.',
      code: 'ARITHMETIC_ERROR'
    };
  }

  if (error.message.includes('execution reverted')) {
    return {
      message: 'Transaction failed. Please check your inputs and try again.',
      code: 'EXECUTION_REVERTED'
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};