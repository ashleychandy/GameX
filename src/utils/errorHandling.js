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

  // MetaMask specific errors
  if (error.code === 4001) {
    return { message: 'Transaction rejected by user', code: ERROR_CODES.USER_REJECTED };
  }

  if (error.code === 4902) {
    return { message: 'Network not added to MetaMask', code: ERROR_CODES.CHAIN_MISMATCH };
  }

  // Contract custom errors
  if (error.errorName) {
    const contractErrors = {
      InvalidBetParameters: { message: ERROR_MESSAGES.INVALID_BET_PARAMETERS, code: ERROR_CODES.INVALID_BET },
      InsufficientContractBalance: { message: ERROR_MESSAGES.INSUFFICIENT_CONTRACT_BALANCE, code: ERROR_CODES.INSUFFICIENT_BALANCE },
      InsufficientUserBalance: { message: ERROR_MESSAGES.INSUFFICIENT_USER_BALANCE, code: ERROR_CODES.INSUFFICIENT_BALANCE },
      GameError: { message: ERROR_MESSAGES.GAME_ERROR, code: ERROR_CODES.GAME_IN_PROGRESS },
      VRFError: { message: ERROR_MESSAGES.VRF_ERROR, code: ERROR_CODES.CONTRACT_ERROR },
      PayoutCalculationError: { message: ERROR_MESSAGES.PAYOUT_CALCULATION_ERROR, code: ERROR_CODES.CONTRACT_ERROR },
    };

    return contractErrors[error.errorName] || { 
      message: 'Contract error occurred', 
      code: ERROR_CODES.CONTRACT_ERROR 
    };
  }

  // Network errors
  if (error.code === ERROR_CODES.NETWORK_ERROR) {
    return { message: 'Network error occurred', code: ERROR_CODES.NETWORK_ERROR };
  }

  // Parse MetaMask error messages
  if (error.message?.includes('MetaMask')) {
    if (error.message.includes('insufficient funds')) {
      return { message: 'Insufficient funds for transaction', code: ERROR_CODES.INSUFFICIENT_BALANCE };
    }
    if (error.message.includes('user rejected')) {
      return { message: 'Transaction rejected by user', code: ERROR_CODES.USER_REJECTED };
    }
  }

  // Generic error handling
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || ERROR_CODES.UNKNOWN_ERROR
  };
};