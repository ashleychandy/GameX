import { toast } from 'react-toastify';
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
  console.error('Error:', error);

  // Contract custom errors
  if (error.errorName) {
    switch (error.errorName) {
      case 'InvalidBetParameters':
        return { message: 'Invalid bet parameters', code: ERROR_CODES.INVALID_BET };
      case 'InsufficientContractBalance':
        return { message: 'Contract has insufficient balance', code: ERROR_CODES.INSUFFICIENT_BALANCE };
      case 'InsufficientUserBalance':
        return { message: 'Insufficient balance', code: ERROR_CODES.INSUFFICIENT_BALANCE };
      case 'GameError':
        return { message: 'Game error occurred', code: ERROR_CODES.GAME_IN_PROGRESS };
      case 'VRFError':
        return { message: 'Random number generation failed', code: ERROR_CODES.CONTRACT_ERROR };
      case 'PayoutCalculationError':
        return { message: 'Payout calculation failed', code: ERROR_CODES.CONTRACT_ERROR };
    }
  }

  // User rejection
  if (error.code === ERROR_CODES.USER_REJECTED) {
    return { message: 'Transaction rejected by user', code: ERROR_CODES.USER_REJECTED };
  }

  // Network errors
  if (error.code === ERROR_CODES.NETWORK_ERROR) {
    return { message: 'Network error occurred', code: ERROR_CODES.NETWORK_ERROR };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || ERROR_CODES.CONTRACT_ERROR
  };
};

export const showError = (error, context = '') => {
  const { message } = handleError(error, context);
  toast.error(message);
  return message;
};