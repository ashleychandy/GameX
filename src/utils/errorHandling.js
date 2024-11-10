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

export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  // Handle ContractError
  if (error.name === 'ContractError') {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }

  // Handle ValidationError
  if (error.name === 'ValidationError') {
    return {
      message: error.message,
      code: ERROR_CODES.VALIDATION_ERROR,
      details: { context }
    };
  }

  // Handle MetaMask errors
  if (error.code === ERROR_CODES.USER_REJECTED) {
    return {
      message: 'Transaction rejected by user',
      code: ERROR_CODES.USER_REJECTED
    };
  }

  if (error.code === ERROR_CODES.CHAIN_MISMATCH) {
    return {
      message: 'Please switch to the correct network',
      code: ERROR_CODES.CHAIN_MISMATCH
    };
  }

  // Handle network errors
  if (error.message?.includes('network') || error.code === ERROR_CODES.NETWORK_ERROR) {
    return {
      message: 'Network error. Please check your connection',
      code: ERROR_CODES.NETWORK_ERROR
    };
  }

  // Handle timeout
  if (error.code === ERROR_CODES.TIMEOUT) {
    return {
      message: 'Request timed out. Please try again',
      code: ERROR_CODES.TIMEOUT
    };
  }

  // Handle contract-specific errors
  if (error.message?.includes('insufficient funds')) {
    return {
      message: ERROR_MESSAGES.INSUFFICIENT_USER_BALANCE,
      code: ERROR_CODES.INSUFFICIENT_BALANCE
    };
  }

  // Default error
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || ERROR_CODES.UNKNOWN_ERROR,
    details: { context, originalError: error }
  };
};

export const showError = (error, context = '') => {
  const { message } = handleError(error, context);
  toast.error(message);
  return message;
};