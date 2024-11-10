import { toast } from 'react-toastify';
import { ERROR_CODES } from './constants';

export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  // Handle contract revert errors with more detail
  if (error?.code === 'CALL_EXCEPTION') {
    return {
      code: error.code,
      message: error.reason || 'Contract call failed. Please check the transaction.',
      details: {
        data: error.data,
        transaction: error.transaction
      }
    };
  }

  // Handle contract revert errors (old style)
  if (error?.code === -32000 && error?.message?.includes('execution reverted')) {
    return {
      code: error.code,
      message: error.data?.message || 'Transaction failed. Please try again.',
      details: error.data
    };
  }

  // Handle user rejection
  if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
    return {
      code: error.code,
      message: 'Transaction was rejected by user'
    };
  }

  // Handle other common errors
  if (error?.message) {
    const message = error.message
      .replace('MetaMask Tx Signature: ', '')
      .replace('Error: ', '')
      .substring(0, 150);
    
    return {
      code: error.code,
      message,
      details: error
    };
  }

  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    details: error
  };
};

export const formatErrorMessage = (error) => {
  const { message } = handleError(error);
  return message;
};

export const isUserRejection = (error) => {
  return error?.code === 'ACTION_REJECTED' || 
         error?.code === 4001 ||
         error?.message?.includes('User denied');
};

export const isNetworkError = (error) => {
  return error.code === ERROR_CODES.NETWORK_ERROR;
};

export const isContractError = (error) => {
  return error.code === ERROR_CODES.CONTRACT_ERROR;
};

export const logError = (error, context = '') => {
  const { code, message } = handleError(error);
  console.error(`[${context}] Error ${code}:`, message, error);
  return { code, message };
}; 