import { toast } from 'react-toastify';

export const ERROR_CODES = {
  USER_REJECTED: 'ACTION_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  // MetaMask and wallet errors
  if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
    return {
      code: ERROR_CODES.USER_REJECTED,
      message: 'Transaction rejected by user'
    };
  }

  // Contract errors
  if (error?.code === 'CALL_EXCEPTION') {
    let message = 'Transaction failed';
    
    if (error.reason?.includes('insufficient funds')) {
      return {
        code: ERROR_CODES.INSUFFICIENT_FUNDS,
        message: 'Insufficient funds for transaction'
      };
    }

    if (error.reason) {
      message = error.reason;
    }

    return {
      code: ERROR_CODES.CONTRACT_ERROR,
      message,
      details: error
    };
  }

  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection error. Please check your connection and try again.'
    };
  }

  // Generic error handler
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: error?.message || 'An unexpected error occurred',
    details: error
  };
};

export const showError = (error, context = '') => {
  const { message } = handleError(error, context);
  toast.error(message);
  return message;
};