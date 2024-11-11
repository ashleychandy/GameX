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
  // Extract error message from different error formats
  let message = error?.message || 'An unknown error occurred';
  
  // Handle specific contract errors
  if (error?.error?.data?.message) {
    message = error.error.data.message;
  } else if (error?.data?.message) {
    message = error.data.message;
  }

  // Clean up the message
  message = message.replace('execution reverted: ', '');
  message = message.replace('MetaMask Tx Signature: ', '');

  return {
    message,
    code: error?.code,
    originalError: error
  };
};

export const isUserRejection = (error) => {
  return error?.code === 4001 || // MetaMask
         error?.code === -32603; // Other wallets
};